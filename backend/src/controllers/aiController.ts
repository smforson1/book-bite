import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { aiService } from '../services/aiService';

const prisma = new PrismaClient();

export const aiController = {
    /**
     * Syncs AI embeddings for all businesses that don't have one or need an update.
     */
    async syncEmbeddings(req: Request, res: Response) {
        try {
            const businesses = await prisma.business.findMany({
                include: {
                    menuCategories: {
                        include: { items: true }
                    },
                    roomCategories: {
                        include: { rooms: true }
                    }
                }
            });

            console.log(`Syncing embeddings for ${businesses.length} businesses...`);

            let syncCount = 0;
            for (const business of businesses) {
                // Construct a descriptive string for embedding
                const menuItemsString = business.menuCategories
                    .flatMap(mc => mc.items.map(i => `${i.name}: ${i.description || ''}`))
                    .join(', ');

                const roomsString = business.roomCategories
                    .flatMap(rc => rc.rooms.map(r => `${r.name}: ${r.description || ''}`))
                    .join(', ');

                const descriptiveText = `
          Business Name: ${business.name}
          Type: ${business.type}
          Description: ${business.description || ''}
          Address: ${business.address}
          Menu Items: ${menuItemsString}
          Rooms: ${roomsString}
        `.trim();

                const embedding = await aiService.generateEmbedding(descriptiveText);

                await (prisma.business as any).update({
                    where: { id: business.id },
                    data: { aiEmbedding: embedding }
                } as any);

                syncCount++;
            }

            res.json({ message: `Successfully synced ${syncCount} business embeddings.` });
        } catch (error: any) {
            console.error("Sync error:", error);
            res.status(500).json({ message: "Failed to sync embeddings", error: error.message });
        }
    },

    /**
     * Performs a semantic search for businesses based on a user query.
     */
    async semanticSearch(req: Request, res: Response) {
        try {
            const { query } = req.query;

            if (!query || typeof query !== 'string') {
                return res.status(400).json({ message: "Search query is required." });
            }

            const queryEmbedding = await aiService.generateEmbedding(query);

            const businesses = await (prisma.business as any).findMany({
                where: {
                    aiEmbedding: { not: null }
                }
            });

            const results = (businesses as any[])
                .map(business => {
                    const businessEmbedding = business.aiEmbedding as number[];
                    const similarity = aiService.cosineSimilarity(queryEmbedding, businessEmbedding);
                    return { ...business, similarity, aiEmbedding: undefined }; // Don't return the raw embedding
                })
                .sort((a, b) => b.similarity - a.similarity)
                .filter(res => res.similarity > 0.6) // Simple threshold
                .slice(0, 10);

            res.json(results);
        } catch (error: any) {
            console.error("Search error:", error);
            res.status(500).json({ message: "Semantic search failed", error: error.message });
        }
    },

    /**
     * Handles chat requests from BiteBot.
     */
    async chat(req: Request, res: Response) {
        try {
            const { query, history } = req.body;

            if (!query) {
                return res.status(400).json({ message: "Query is required." });
            }

            // 1. Fetch relevant context using semantic search logic
            const queryEmbedding = await aiService.generateEmbedding(query);
            const businesses = await (prisma.business as any).findMany({
                where: { aiEmbedding: { not: null } },
                include: {
                    menuCategories: { include: { items: true } },
                    roomCategories: { include: { rooms: true } }
                }
            });

            const contextResults = (businesses as any[])
                .map(b => ({
                    ...b,
                    similarity: aiService.cosineSimilarity(queryEmbedding, b.aiEmbedding as number[])
                }))
                .sort((a, b) => b.similarity - a.similarity)
                .filter(b => b.similarity > 0.5)
                .slice(0, 3); // Get top 3 most relevant businesses for context

            const contextText = contextResults.map(b => {
                const menu = b.menuCategories?.flatMap((mc: any) => mc.items.map((i: any) => i.name)).join(', ');
                const rooms = b.roomCategories?.flatMap((rc: any) => rc.rooms.map((r: any) => r.name)).join(', ');
                return `
          Business: ${b.name} (${b.type})
          Description: ${b.description || ''}
          Menu/Items: ${menu || 'None'}
          Rooms/Units: ${rooms || 'None'}
        `.trim();
            }).join('\n\n');

            // 2. Get AI response
            const response = await aiService.getChatResponse(history || [], query, contextText);

            res.json({ response });
        } catch (error: any) {
            console.error("Chat error:", error);
            res.status(500).json({ message: "BiteBot is resting right now. Try again soon!", error: error.message });
        }
    }
};

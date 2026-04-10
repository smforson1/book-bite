import { PrismaClient } from '@prisma/client';
import { aiService } from '../src/services/aiService';

const prisma = new PrismaClient();

async function syncEmbeddings() {
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
            console.log(`Processing ${business.name}...`);
            // Construct a descriptive string for embedding
            const menuItemsString = business.menuCategories
                .flatMap(mc => mc.items.map(i => `${i.name}: ${i.description || i.name}`))
                .join(', ');

            const roomsString = business.roomCategories
                .flatMap(rc => rc.rooms.map(r => `${r.name}: ${r.description || r.name}`))
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

            // Using prisma.business.update directly if schema allows Json for aiEmbedding
            // Or use cast if needed. 
            await (prisma.business as any).update({
                where: { id: business.id },
                data: { aiEmbedding: embedding }
            });

            syncCount++;
        }

        console.log(`Successfully synced ${syncCount} business embeddings.`);
    } catch (error: any) {
        console.error("Sync error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

syncEmbeddings();

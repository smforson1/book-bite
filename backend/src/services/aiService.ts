import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Service to handle AI-related operations like embeddings and chat.
 */
export const aiService = {
    /**
     * Generates an embedding vector for the given text.
     * @param text The text to embed.
     * @returns An array of numbers representing the embedding.
     */
    async generateEmbedding(text: string): Promise<number[]> {
        try {
            if (!process.env.GEMINI_API_KEY) {
                throw new Error("GEMINI_API_KEY is not set in environment variables.");
            }

            const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
            const result = await model.embedContent(text);
            return result.embedding.values;
        } catch (error) {
            console.error("Error generating embedding:", error);
            throw error;
        }
    },

    /**
     * Calculates the cosine similarity between two vectors.
     * Useful for basic semantic search if not using a dedicated vector DB.
     */
    cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    },

    /**
     * Gets a conversational response from BiteBot.
     */
    async getChatResponse(history: any[], query: string, context: string): Promise<string> {
        try {
            if (!process.env.GEMINI_API_KEY) {
                throw new Error("GEMINI_API_KEY is not set.");
            }

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: `
          You are "BiteBot", the ultimate AI Concierge for the "Book Bite" app. 
          Your goal is to help users find the best food and accommodation (hostels/hotels).
          
          Guidelines:
          - Be friendly, professional, and slightly enthusiastic. 
          - Use the provided CONTEXT to answer questions about specific businesses, menus, or rooms.
          - If the user asks for recommendations, use the context to suggest relevant places.
          - If you don't know the answer from the context, say you're not sure but offer to help find something else.
          - Keep answers concise and mobile-friendly.
          - If relevant, suggest they use the "Book Now" or "Order Now" feature in the app.
          
          CONTEXT:
          ${context}
        `.trim()
            });

            const chat = model.startChat({
                history: history.map(h => ({
                    role: h.role === 'user' ? 'user' : 'model',
                    parts: [{ text: h.content }]
                })),
            });

            const result = await chat.sendMessage(query);
            return result.response.text();
        } catch (error) {
            console.error("Chat error:", error);
            throw error;
        }
    },

    /**
     * Analyzes sentiment and provides a summary for a set of reviews.
     */
    async analyzeSentiment(reviews: any[]): Promise<{ score: number, summary: string }> {
        try {
            if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set.");
            if (reviews.length === 0) return { score: 0, summary: "No reviews yet to analyze." };

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
                Analyze the following customer reviews for a business.
                1. Provide a concise summary (max 3 sentences) of the overall feedback.
                2. Provide a sentiment score between -1.0 (very negative) and 1.0 (very positive).
                
                Format your response STRICTORLY as a JSON object: {"score": number, "summary": "string"}
                
                REVIEWS:
                ${reviews.map(r => `- Rating ${r.rating}: ${r.comment || 'No comment'}`).join('\n')}
            `.trim();

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Clean markdown blocks if any
            const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Sentiment analysis error:", error);
            return { score: 0, summary: "AI was unable to analyze reviews at this time." };
        }
    },

    /**
     * Generates an appetizing or inviting description for a menu item or room.
     */
    async generateDescription(type: 'menu' | 'room', name: string, details: string): Promise<string> {
        try {
            if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set.");

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
                Role: You are a professional copywriter for a premium booking app called "Book Bite".
                Task: Write a ${type === 'menu' ? 'mouth-watering and creative' : 'warm and inviting'} description for a ${type}.
                
                ${type === 'menu' ? 'Item Name' : 'Room Name'}: ${name}
                Details/Keywords: ${details}
                
                Requirements:
                - Keep it between 2 to 4 sentences.
                - Use vivid, sensory language.
                - Make it sound premium and exclusive.
                - Do not use hashtags or emojis.
                - Respond ONLY with the description text.
            `.trim();

            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error("Description generation error:", error);
            throw error;
        }
    },

    /**
     * Analyzes an image and returns a textual description.
     */
    async analyzeImage(base64Data: string, mimeType: string): Promise<string> {
        try {
            if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set.");

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = "What is in this image? Provide a concise description that can be used for searching. Focus on food items, room styles, or business types. (Max 10 words)";

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                }
            ]);

            return result.response.text().trim();
        } catch (error) {
            console.error("Vision error:", error);
            throw error;
        }
    }
};

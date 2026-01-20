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
    }
};

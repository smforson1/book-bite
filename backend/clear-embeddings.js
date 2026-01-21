const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearEmbeddings() {
    try {
        console.log("Clearing old embeddings...");
        const result = await prisma.business.updateMany({
            data: {
                aiEmbedding: null
            }
        });
        console.log(`Cleared embeddings for ${result.count} businesses.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

clearEmbeddings();

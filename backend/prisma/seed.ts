import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@bookbite.com' },
        update: {},
        create: {
            email: 'admin@bookbite.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
        },
    });

    console.log('✅ Admin user created:', admin.email);
    console.log('📧 Email: admin@bookbite.com');
    console.log('🔑 Password: Admin123!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

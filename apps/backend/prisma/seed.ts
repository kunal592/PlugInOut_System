import { PrismaClient, UserRole, PricingType, ToolAccessStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@pluginout.com' },
        update: {},
        create: {
            email: 'admin@pluginout.com',
            passwordHash: adminPasswordHash,
            firstName: 'Admin',
            lastName: 'User',
            role: UserRole.SUPER_ADMIN,
            emailVerified: true,
        },
    });
    console.log(`✅ Created admin user: ${admin.email}`);

    // Create demo user
    const userPasswordHash = await bcrypt.hash('user123', 12);
    const demoUser = await prisma.user.upsert({
        where: { email: 'user@demo.com' },
        update: {},
        create: {
            email: 'user@demo.com',
            passwordHash: userPasswordHash,
            firstName: 'Demo',
            lastName: 'User',
            role: UserRole.USER,
            emailVerified: true,
        },
    });
    console.log(`✅ Created demo user: ${demoUser.email}`);

    // Create sample tools
    // Note: Updated to match new schema (basePrice, permissions enum)
    const sampleTools = [
        {
            slug: 'invoice',
            name: 'Invoice Generator',
            description: 'Create professional invoices in seconds',
            basePrice: 19900, // 199.00 INR in paise
            currency: 'INR',
            pricingType: PricingType.ONE_TIME,
            routes: '/invoice',
            permissions: [UserRole.USER],
            icon: '📄',
            category: 'finance',
        },
        {
            slug: 'expense-tracker',
            name: 'Expense Tracker',
            description: 'Track and manage your business expenses',
            basePrice: 9900, // 99.00 INR in paise
            currency: 'INR',
            pricingType: PricingType.SUBSCRIPTION,
            routes: '/expenses',
            permissions: [UserRole.USER],
            icon: '💰',
            category: 'finance',
        },
        {
            slug: 'task-manager',
            name: 'Task Manager',
            description: 'Organize your tasks and projects',
            basePrice: 0,
            currency: 'INR',
            pricingType: PricingType.FREE,
            routes: '/tasks',
            permissions: [UserRole.USER],
            icon: '✅',
            category: 'productivity',
        },
    ];

    for (const toolData of sampleTools) {
        const tool = await prisma.tool.upsert({
            where: { slug: toolData.slug },
            update: toolData,
            create: toolData,
        });
        console.log(`✅ Created/updated tool: ${tool.name}`);
    }

    // Grant demo user access to free tools
    const freeTools = await prisma.tool.findMany({
        where: { pricingType: PricingType.FREE },
    });

    for (const tool of freeTools) {
        await prisma.userTool.upsert({
            where: {
                userId_toolId: {
                    userId: demoUser.id,
                    toolId: tool.id,
                },
            },
            update: {},
            create: {
                userId: demoUser.id,
                toolId: tool.id,
                status: ToolAccessStatus.ACTIVE,
                activatedAt: new Date(),
            },
        });
        console.log(`✅ Granted ${demoUser.email} access to ${tool.name}`);
    }

    console.log('\n🎉 Database seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

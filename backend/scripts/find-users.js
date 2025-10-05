import dotenv from 'dotenv';
dotenv.config();

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

async function findUsers() {
    console.log('🔍 Finding Users in Database...');
    console.log('============================');

    const prisma = new PrismaClient();

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true
            }
        });

        console.log(`Found ${users.length} user(s):`);
        console.log('');

        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log('');
        });

        console.log('💡 To test login:');
        console.log('   Try common password patterns like:');
        console.log('   - password123');
        console.log('   - Admin123!');
        console.log('   - Mindboost123!');
        console.log('   - Superadmin123!');

    } catch (error) {
        console.log('❌ Error finding users:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

findUsers();
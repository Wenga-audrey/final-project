import dotenv from 'dotenv';
dotenv.config();

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

async function checkUsers() {
    console.log('👥 Checking Users in Database...');
    console.log('==============================');

    const prisma = new PrismaClient();

    try {
        const users = await prisma.user.findMany();
        console.log(`Found ${users.length} user(s) in database`);

        if (users.length > 0) {
            console.log('\nSample users:');
            users.slice(0, 3).forEach((user, index) => {
                console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
            });

            if (users.length > 3) {
                console.log(`... and ${users.length - 3} more users`);
            }
        } else {
            console.log('No users found in database');
            console.log('\n💡 You can create a test user by:');
            console.log('   1. Running the application and using the sign up form');
            console.log('   2. Using the seed script if available');
            console.log('   3. Manually creating a user through the API');
        }

    } catch (error) {
        console.log('❌ Error checking users:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
import dotenv from 'dotenv';
dotenv.config();

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

async function testDatabaseConnection() {
    console.log('🔌 Testing Database Connection...');
    console.log('================================');

    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'FOUND' : 'NOT FOUND');

    if (!process.env.DATABASE_URL) {
        console.log('❌ DATABASE_URL not found in environment variables');
        return;
    }

    const prisma = new PrismaClient();

    try {
        await prisma.$connect();
        console.log('✅ Database connection successful!');

        // Try a simple query
        try {
            const users = await prisma.user.findMany({ take: 1 });
            console.log('✅ Database query successful!');
            console.log(`Found ${users.length} user(s) in database`);
        } catch (queryError) {
            console.log('⚠️  Database query failed:', queryError.message);
        }

    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
        console.log('\n💡 Tips:');
        console.log('   - Check your DATABASE_URL in the .env file');
        console.log('   - Ensure your database server is running');
        console.log('   - Verify database credentials are correct');
        console.log('   - Check if the database exists');
    } finally {
        await prisma.$disconnect();
    }
}

testDatabaseConnection();
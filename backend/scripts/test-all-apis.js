import dotenv from 'dotenv';
dotenv.config();

import { createAIService } from '../src/lib/aiService.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testAllAPIs() {
    console.log('🚀 Testing All APIs...');
    console.log('====================');

    // Test 1: Health Check API
    console.log('\n1. Testing Health Check API...');
    try {
        const healthResponse = await fetch('http://localhost:3002/health');
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Health Check API: SUCCESS');
            console.log('   Status:', healthData.status);
            console.log('   Timestamp:', healthData.timestamp);
        } else {
            console.log('❌ Health Check API: FAILED');
            console.log('   Status:', healthResponse.status);
        }
    } catch (error) {
        console.log('❌ Health Check API: CONNECTION ERROR');
        console.log('   Error:', error.message);
    }

    // Test 2: Authentication APIs
    console.log('\n2. Testing Authentication APIs...');

    // Test 2a: Login
    console.log('   a. Testing Login API...');
    try {
        const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'superadmin@mindboost.com',
                password: 'Admin123!' // Common default password pattern
            })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login API: SUCCESS');
            console.log('   User:', loginData.data?.user?.firstName, loginData.data?.user?.lastName);
            console.log('   Token:', loginData.data?.token ? 'RECEIVED' : 'NOT RECEIVED');
        } else {
            const errorText = await loginResponse.text();
            console.log('⚠️  Login API: AUTHENTICATION FAILED');
            console.log('   Status:', loginResponse.status);
            console.log('   Response:', errorText);
        }
    } catch (error) {
        console.log('❌ Login API: CONNECTION ERROR');
        console.log('   Error:', error.message);
    }

    // Test 3: AI Service
    console.log('\n3. Testing AI Service...');
    try {
        const aiService = createAIService();
        if (aiService.model) {
            console.log('✅ AI Service: INITIALIZED');
            console.log('   Model:', process.env.GOOGLE_AI_MODEL || 'models/gemini-pro-latest');
            console.log('   Max Retries:', aiService.maxRetries);

            // Test basic text generation
            console.log('   Testing AI Text Generation...');
            const response = await aiService.generateText('What is 2+2? Give a short answer.');

            if (response.success) {
                console.log('✅ AI Text Generation: SUCCESS');
                console.log('   Response:', response.content.substring(0, 50) + '...'); // First 50 chars
            } else {
                console.log('⚠️  AI Text Generation: FAILED (but with retry logic)');
                console.log('   Error:', response.error);
                console.log('   The system will automatically retry on temporary failures');
            }
        } else {
            console.log('❌ AI Service: NOT INITIALIZED');
        }
    } catch (error) {
        console.log('❌ AI Service: ERROR');
        console.log('   Error:', error.message);
    }

    // Test 4: Database APIs (through Prisma)
    console.log('\n4. Testing Database Connection...');
    try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();

        await prisma.$connect();
        console.log('✅ Database Connection: SUCCESS');

        // Test a simple query
        const userCount = await prisma.user.count();
        console.log('   Users in database:', userCount);

        if (userCount > 0) {
            const sampleUser = await prisma.user.findFirst();
            console.log('   Sample user:', sampleUser.firstName, sampleUser.lastName);
        }

        await prisma.$disconnect();
    } catch (error) {
        console.log('❌ Database Connection: FAILED');
        console.log('   Error:', error.message);
    }

    // Test 5: Shared API Configuration
    console.log('\n5. Testing Shared Config Access...');
    try {
        // Check if shared config file exists
        const sharedConfigPath = join(__dirname, '../../shared/config.js');
        if (existsSync(sharedConfigPath)) {
            console.log('✅ Shared Config File: EXISTS');
        } else {
            console.log('⚠️  Shared Config File: NOT FOUND');
            console.log('   Expected path:', sharedConfigPath);
        }
    } catch (error) {
        console.log('❌ Shared Config Check: ERROR');
        console.log('   Error:', error.message);
    }

    console.log('\n🏁 API Testing Complete');
    console.log('======================');

    // Additional information about handling AI service issues
    console.log('\n💡 AI Service Resilience Information:');
    console.log('   - The AI service now includes automatic retry logic');
    console.log('   - Exponential backoff (1s, 2s, 4s) between retries');
    console.log('   - Fallback responses are provided when AI is unavailable');
    console.log('   - Temporary 503 errors should resolve automatically');
}

testAllAPIs();
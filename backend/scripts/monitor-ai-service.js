import dotenv from 'dotenv';
dotenv.config();

import { createAIService } from '../src/lib/aiService.js';

async function monitorAIService() {
    console.log('🤖 Monitoring AI Service Health...');
    console.log('=================================');

    console.log('Timestamp:', new Date().toISOString());
    console.log('API Key Status:', process.env.GOOGLE_AI_API_KEY ? 'CONFIGURED' : 'MISSING');
    console.log('Model Name:', process.env.GOOGLE_AI_MODEL || 'models/gemini-pro-latest');

    try {
        const aiService = createAIService();

        if (!aiService.model) {
            console.log('❌ AI Service: NOT INITIALIZED');
            console.log('   Possible causes:');
            console.log('   - Missing or invalid API key');
            console.log('   - Network connectivity issues');
            console.log('   - Invalid model name');
            return;
        }

        console.log('✅ AI Service: INITIALIZED');

        // Test with a simple prompt
        console.log('\nTesting AI response time...');
        const startTime = Date.now();

        const response = await aiService.generateText('Respond with exactly: "AI_SERVICE_OK"');

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (response.success) {
            console.log('✅ AI Service Test: SUCCESS');
            console.log('   Response Time:', responseTime, 'ms');
            console.log('   Response:', response.content.trim());

            if (response.content.includes('AI_SERVICE_OK')) {
                console.log('✅ AI Service Fully Functional');
            } else {
                console.log('⚠️  AI Service Response Format Issue');
            }
        } else {
            console.log('❌ AI Service Test: FAILED');
            console.log('   Error:', response.error);
            console.log('   Response Time:', responseTime, 'ms');

            // Check if it's a temporary issue
            if (response.error.includes('503') || response.error.includes('Service Unavailable')) {
                console.log('💡 This appears to be a temporary service issue.');
                console.log('   The retry logic should handle this automatically.');
                console.log('   Try again in a few minutes.');
            } else if (response.error.includes('401') || response.error.includes('API key')) {
                console.log('🔐 This appears to be an authentication issue.');
                console.log('   Check your GOOGLE_AI_API_KEY in the .env file.');
            } else if (response.error.includes('404') || response.error.includes('model')) {
                console.log('🔍 This appears to be a model issue.');
                console.log('   Check your GOOGLE_AI_MODEL in the .env file.');
            }
        }

    } catch (error) {
        console.log('❌ AI Service Monitor: ERROR');
        console.log('   Error:', error.message);
    }

    console.log('\n🔧 Recommendations:');
    console.log('   1. If experiencing 503 errors, wait a few minutes and retry');
    console.log('   2. Check Google AI service status page for outages');
    console.log('   3. Verify API key has proper permissions');
    console.log('   4. Ensure billing is enabled for your Google AI project');
}

monitorAIService();
#!/usr/bin/env node

/**
 * Fresh Google AI API Key Test
 * 
 * This script creates a fresh instance of the Google AI service
 * to test if the API key is working properly.
 */

import dotenv from 'dotenv';
dotenv.config();

async function testGoogleAI() {
    console.log('🤖 Fresh Google AI API Key Test');
    console.log('===============================');

    // Check if API key is loaded
    console.log('GOOGLE_AI_API_KEY from process.env:', process.env.GOOGLE_AI_API_KEY ? 'FOUND' : 'NOT FOUND');
    console.log('GOOGLE_AI_API_KEY length:', process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.length : 0);

    if (!process.env.GOOGLE_AI_API_KEY) {
        console.log('❌ GOOGLE_AI_API_KEY is not set in environment variables');
        return;
    }

    try {
        // Import the Google Generative AI package
        const { GoogleGenerativeAI } = await import('@google/generative-ai');

        // Create a fresh instance of the Google Generative AI service
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

        // Get the model with the correct model name
        const model = genAI.getGenerativeModel({ model: "models/gemini-pro-latest" });

        // Test content generation
        console.log('Sending test prompt to Google AI...');
        const result = await model.generateContent('Say "Hello, Mindboost!" in 3 different languages.');
        const response = await result.response;
        const text = response.text();

        console.log('✅ Content generated successfully!');
        console.log('Response:');
        console.log(text);

        console.log('\n🎉 All tests passed! Google AI API key is working correctly.');

        // Now test the application's AIService
        console.log('\n🧪 Testing application AIService...');
        const { createAIService } = await import('../src/lib/aiService.js');

        // Create a fresh instance of the application's AIService
        const aiService = createAIService();

        // Test content generation
        console.log('Sending test prompt to application AIService...');
        const appResponse = await aiService.generateText('Say "Hello from application!" in 2 different languages.');

        if (appResponse.success) {
            console.log('✅ Application AIService is working correctly!');
            console.log('Response:');
            console.log(appResponse.content);

            console.log('\n🎉 All tests passed! Both Google AI services are working correctly.');
        } else {
            console.log('❌ Application AIService test failed:');
            console.log(appResponse.error);
        }

    } catch (error) {
        console.log('❌ Error testing Google AI:', error.message);

        if (error.message.includes('module')) {
            console.log('\n💡 It seems the Google Generative AI package is not installed.');
            console.log('   Run: npm install @google/generative-ai');
        } else if (error.message.includes('API_KEY')) {
            console.log('\n💡 There might be an issue with your API key:');
            console.log('   - Check if the key is valid');
            console.log('   - Ensure billing is enabled for your Google Cloud project');
            console.log('   - Verify the key has access to the Generative AI API');
        }
    }
}

// Run the test
testGoogleAI();
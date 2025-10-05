import dotenv from 'dotenv';
dotenv.config();

// Now import the AI service after environment variables are loaded
import { createAIService } from '../src/lib/aiService.js';

async function testGoogleAI() {
    console.log('🤖 Testing Google AI API Key...');
    console.log('================================');

    // Check if API key is loaded
    console.log('GOOGLE_AI_API_KEY from process.env:', process.env.GOOGLE_AI_API_KEY ? 'FOUND' : 'NOT FOUND');
    console.log('GOOGLE_AI_API_KEY length:', process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.length : 0);

    try {
        // Instantiate the AI service directly
        const aiService = createAIService();

        // Test basic text generation
        console.log('Sending test prompt to Google AI...');
        const response = await aiService.generateText('Say "Hello, Mindboost!" in 5 different languages.');

        if (response.success) {
            console.log('✅ Google AI API key is working correctly!');
            console.log('Response:');
            console.log(response.content);
            console.log('\n🎉 All tests passed! Google AI is properly configured.');
        } else {
            console.log('❌ Google AI API test failed:');
            console.log(response.error);

            if (response.error.includes('API key')) {
                console.log('\n💡 Tips:');
                console.log('   - Check your GOOGLE_AI_API_KEY in the .env file');
                console.log('   - Ensure the API key is valid and has billing enabled');
                console.log('   - Verify the key has access to the Google Generative AI API');
            }
        }
    } catch (error) {
        console.log('❌ Error testing Google AI:', error.message);

        if (error.message.includes('module')) {
            console.log('\n💡 It seems the Google Generative AI package is not installed.');
            console.log('   Run: npm install @google/generative-ai');
        }
    }
}

// Run the test
testGoogleAI();
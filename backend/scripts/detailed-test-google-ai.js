#!/usr/bin/env node

/**
 * Detailed Test Google AI API Key
 * 
 * This script provides detailed information about the Google AI API key configuration
 * and tests if it's working properly.
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('🤖 Detailed Google AI API Key Test');
console.log('===================================');

// Check environment variables
console.log('Environment Variables Check:');
console.log('  GOOGLE_AI_API_KEY:', process.env.GOOGLE_AI_API_KEY ? 'SET' : 'NOT SET');
console.log('  GOOGLE_AI_API_KEY length:', process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.length : 0);
console.log('  GOOGLE_AI_MODEL:', process.env.GOOGLE_AI_MODEL || 'NOT SET (using default)');

// Try to import and instantiate the Google AI service
try {
    console.log('\nImporting GoogleGenerativeAI...');
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    console.log('✅ GoogleGenerativeAI imported successfully');

    if (process.env.GOOGLE_AI_API_KEY) {
        console.log('\nTesting GoogleGenerativeAI instantiation...');
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        console.log('✅ GoogleGenerativeAI instantiated successfully');

        console.log('\nTesting model access...');
        const model = genAI.getGenerativeModel({ model: process.env.GOOGLE_AI_MODEL || "models/gemini-pro" });
        console.log('✅ Model accessed successfully');

        console.log('\nTesting content generation...');
        try {
            const result = await model.generateContent('Say "Hello, Mindboost!" in 3 different languages.');
            const response = await result.response;
            const text = response.text();
            console.log('✅ Content generated successfully!');
            console.log('Response:');
            console.log(text);

            console.log('\n🎉 All tests passed! Google AI is properly configured.');
        } catch (genError) {
            console.log('❌ Content generation failed:', genError.message);

            // Try with a different model
            console.log('\nTrying with models/gemini-pro-latest model...');
            try {
                const modelPro = genAI.getGenerativeModel({ model: "models/gemini-pro-latest" });
                const resultPro = await modelPro.generateContent('Say "Hello, Mindboost!" in 3 different languages.');
                const responsePro = await resultPro.response;
                const textPro = responsePro.text();
                console.log('✅ Content generated successfully with models/gemini-pro-latest!');
                console.log('Response:');
                console.log(textPro);

                console.log('\n🎉 All tests passed with models/gemini-pro-latest model!');
            } catch (proError) {
                console.log('❌ Content generation failed with models/gemini-pro-latest:', proError.message);

                // Try with the full model path
                console.log('\nTrying with models/gemini-1.0-pro model...');
                try {
                    const modelFull = genAI.getGenerativeModel({ model: "models/gemini-1.0-pro" });
                    const resultFull = await modelFull.generateContent('Say "Hello, Mindboost!" in 3 different languages.');
                    const responseFull = await resultFull.response;
                    const textFull = responseFull.text();
                    console.log('✅ Content generated successfully with models/gemini-1.0-pro!');
                    console.log('Response:');
                    console.log(textFull);

                    console.log('\n🎉 All tests passed with models/gemini-1.0-pro model!');
                } catch (fullError) {
                    console.log('❌ Content generation failed with models/gemini-1.0-pro:', fullError.message);

                    // Try with the latest model
                    console.log('\nTrying with models/gemini-1.0-pro-latest model...');
                    try {
                        const modelLatest = genAI.getGenerativeModel({ model: "models/gemini-1.0-pro-latest" });
                        const resultLatest = await modelLatest.generateContent('Say "Hello, Mindboost!" in 3 different languages.');
                        const responseLatest = await resultLatest.response;
                        const textLatest = responseLatest.text();
                        console.log('✅ Content generated successfully with models/gemini-1.0-pro-latest!');
                        console.log('Response:');
                        console.log(textLatest);

                        console.log('\n🎉 All tests passed with models/gemini-1.0-pro-latest model!');
                    } catch (latestError) {
                        console.log('❌ Content generation failed with models/gemini-1.0-pro-latest:', latestError.message);
                    }
                }
            }
        }
    } else {
        console.log('❌ GOOGLE_AI_API_KEY is not set in environment variables');
    }
} catch (error) {
    console.log('❌ Error during detailed test:', error.message);

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
#!/usr/bin/env node

/**
 * Test AI Service Script
 * 
 * This script tests the consolidated AI service to ensure all functionality is working correctly.
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

console.log('🤖 Testing Consolidated AI Service');
console.log('==================================');

// Import and initialize the AI service AFTER loading environment variables
const { createAIService } = await import('../src/lib/aiService.js');

// Initialize the AI service
const aiService = createAIService();

// Test 1: Basic text generation
console.log('\n📝 Test 1: Basic Text Generation');
try {
    const result = await aiService.generateText('Say "Hello, Mindboost!" in 3 different languages');

    if (result.success) {
        console.log('✅ Text generation successful!');
        console.log('Response:', result.content);
    } else {
        console.log('❌ Text generation failed:', result.error);
    }
} catch (error) {
    console.log('❌ Text generation error:', error.message);
}

// Test 2: Adaptive quiz questions
console.log('\n❓ Test 2: Adaptive Quiz Questions');
try {
    const quizResult = await aiService.generateAdaptiveQuizQuestions(
        'Mathematics',
        'Algebra',
        'Linear Equations',
        5,
        'intermediate'
    );

    if (quizResult.success) {
        console.log('✅ Adaptive quiz generation successful!');
        console.log('Questions count:', quizResult.questions?.length || 0);
        if (quizResult.questions?.length > 0) {
            console.log('First question:', JSON.stringify(quizResult.questions[0], null, 2));
        }
    } else {
        console.log('❌ Adaptive quiz generation failed:', quizResult.error);
    }
} catch (error) {
    console.log('❌ Adaptive quiz generation error:', error.message);
}

console.log('\n🎉 AI Service test completed!');
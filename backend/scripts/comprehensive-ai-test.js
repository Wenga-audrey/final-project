#!/usr/bin/env node

/**
 * Comprehensive AI Service Test Script
 * 
 * This script tests all the functionality of the consolidated AI service.
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

console.log('🤖 Comprehensive AI Service Test');
console.log('================================');

// Import and initialize the AI service AFTER loading environment variables
const { createAIService } = await import('../src/lib/aiService.js');

// Initialize the AI service
const aiService = createAIService();

// Test 1: Basic text generation
console.log('\n📝 Test 1: Basic Text Generation');
try {
    const result = await aiService.generateText('Explain what artificial intelligence is in one sentence');

    if (result.success) {
        console.log('✅ Text generation successful!');
        console.log('Response:', result.content.substring(0, 100) + '...');
    } else {
        console.log('❌ Text generation failed:', result.error);
    }
} catch (error) {
    console.log('❌ Text generation error:', error.message);
}

// Test 2: Adaptive quiz questions
console.log('\n❓ Test 2: Adaptive Quiz Questions');
try {
    const sampleContent = {
        title: "Introduction to Mathematics",
        description: "Basic concepts in mathematics including algebra and geometry",
        topics: ["Algebra", "Geometry", "Calculus"]
    };

    const config = {
        questionCount: 3,
        difficulty: 'MEDIUM',
        learnerProfile: {
            currentLevel: 'INTERMEDIATE',
            weakAreas: ['Geometry'],
            strongAreas: ['Algebra']
        }
    };

    const quizResult = await aiService.generateAdaptiveQuizQuestions(sampleContent, 'chapter', config);

    if (quizResult.success) {
        console.log('✅ Adaptive quiz generation successful!');

        // Try to parse the response as JSON
        try {
            const questions = JSON.parse(quizResult.content);
            console.log('Questions count:', questions.length);
            if (questions.length > 0) {
                console.log('First question preview:', questions[0].question?.substring(0, 50) + '...');
            }
        } catch (parseError) {
            console.log('Response is not valid JSON, content preview:', quizResult.content.substring(0, 200) + '...');
        }
    } else {
        console.log('❌ Adaptive quiz generation failed:', quizResult.error);
    }
} catch (error) {
    console.log('❌ Adaptive quiz generation error:', error.message);
}

// Test 3: Study suggestions
console.log('\n📚 Test 3: Study Suggestions');
try {
    const weakAreas = ['Algebra', 'Trigonometry'];
    const userPerformance = {
        averageScore: 65,
        recentScores: [58, 62, 70, 68],
        completedLessons: 12
    };
    const learnerProfile = {
        userId: 'test-user-123',
        currentLevel: 'INTERMEDIATE',
        weakAreas: ['Algebra'],
        strongAreas: ['Geometry'],
        averageScore: 65,
        recentPerformance: [58, 62, 70, 68],
        preferredDifficulty: 'MEDIUM'
    };

    const suggestionsResult = await aiService.generateStudySuggestions(weakAreas, userPerformance, learnerProfile);

    if (suggestionsResult.success) {
        console.log('✅ Study suggestions generation successful!');

        // Try to parse the response as JSON
        try {
            const suggestions = JSON.parse(suggestionsResult.content);
            console.log('Suggestions keys:', Object.keys(suggestions));
        } catch (parseError) {
            console.log('Response is not valid JSON, content preview:', suggestionsResult.content.substring(0, 200) + '...');
        }
    } else {
        console.log('❌ Study suggestions generation failed:', suggestionsResult.error);
    }
} catch (error) {
    console.log('❌ Study suggestions generation error:', error.message);
}

// Test 4: Performance analysis
console.log('\n📊 Test 4: Performance Analysis');
try {
    const assessmentResults = [
        { score: 75 },
        { score: 82 },
        { score: 68 },
        { score: 90 },
        { score: 77 }
    ];
    const studyTime = 120; // minutes

    const analysisResult = await aiService.analyzePerformance(assessmentResults, studyTime);

    if (analysisResult.success) {
        console.log('✅ Performance analysis successful!');

        // Try to parse the response as JSON
        try {
            const analysis = JSON.parse(analysisResult.content);
            console.log('Analysis keys:', Object.keys(analysis));
        } catch (parseError) {
            console.log('Response is not valid JSON, content preview:', analysisResult.content.substring(0, 200) + '...');
        }
    } else {
        console.log('❌ Performance analysis failed:', analysisResult.error);
    }
} catch (error) {
    console.log('❌ Performance analysis error:', error.message);
}

console.log('\n🎉 Comprehensive AI Service test completed!');
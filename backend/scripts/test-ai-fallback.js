import dotenv from 'dotenv';
dotenv.config();

async function testAIFallback() {
    console.log('🔄 Testing AI Fallback Mechanisms...');
    console.log('====================================');

    // First, get a valid token by logging in as a learner
    let authToken = '';
    try {
        const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'learner@mindboost.com',
                password: 'learner123'
            })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            authToken = loginData.data.token;
            console.log('✅ Authentication successful');
        } else {
            console.log('❌ Authentication failed');
            return;
        }
    } catch (error) {
        console.log('❌ Authentication error:', error.message);
        return;
    }

    // Test AI Study Suggestions with fallback
    console.log('\n1. Testing AI Study Suggestions with Fallback...');
    try {
        const aiResponse = await fetch('http://localhost:3002/api/ai/study-suggestions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                weakAreas: ['Mathematics', 'Physics'],
                userPerformance: { averageScore: 75, completedLessons: 10 }
            })
        });

        if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            console.log('✅ AI Study Suggestions API: SUCCESS');
            if (aiData.data?.suggestions) {
                console.log('   Suggestions received:', typeof aiData.data.suggestions);
                // Check if it's the real AI response or fallback
                if (aiData.message && aiData.message.includes('mode dégradé')) {
                    console.log('   ⚠️  Using fallback suggestions (AI service may be temporarily unavailable)');
                } else {
                    console.log('   ✅ Using real AI-generated suggestions');
                }
            }
        } else {
            console.log('❌ AI Study Suggestions API: FAILED');
            console.log('   Status:', aiResponse.status);
        }
    } catch (error) {
        console.log('❌ AI Study Suggestions API: ERROR');
        console.log('   Error:', error.message);
    }

    // Test AI Chat with fallback
    console.log('\n2. Testing AI Chat with Fallback...');
    try {
        const chatResponse = await fetch('http://localhost:3002/api/ai/chat', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Hello, how can I improve my study habits?'
            })
        });

        if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            console.log('✅ AI Chat API: SUCCESS');
            if (chatData.data?.response) {
                console.log('   Response received:', chatData.data.response.substring(0, 50) + '...');
                // Check if it's the real AI response or fallback
                if (chatData.message && chatData.message.includes('fallback')) {
                    console.log('   ⚠️  Using fallback response (AI service may be temporarily unavailable)');
                } else {
                    console.log('   ✅ Using real AI-generated response');
                }
            }
        } else {
            console.log('❌ AI Chat API: FAILED');
            console.log('   Status:', chatResponse.status);
        }
    } catch (error) {
        console.log('❌ AI Chat API: ERROR');
        console.log('   Error:', error.message);
    }

    console.log('\n🏁 AI Fallback Testing Complete');
    console.log('===============================');
    console.log('\n💡 Fallback mechanisms ensure users always receive helpful responses,');
    console.log('   even when AI services are temporarily unavailable.');
}

testAIFallback();
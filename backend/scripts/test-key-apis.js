import dotenv from 'dotenv';
dotenv.config();

async function testKeyAPIs() {
    console.log('🔑 Testing Key APIs...');
    console.log('====================');

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
            console.log('   Token acquired for testing');
        } else {
            console.log('❌ Authentication failed');
            return;
        }
    } catch (error) {
        console.log('❌ Authentication error:', error.message);
        return;
    }

    // Test 1: Get user profile
    console.log('\n1. Testing User Profile API...');
    try {
        const profileResponse = await fetch('http://localhost:3002/api/profile', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('✅ User Profile API: SUCCESS');
            console.log('   User:', profileData.data?.user?.firstName, profileData.data?.user?.lastName);
            console.log('   Email:', profileData.data?.user?.email);
        } else {
            console.log('❌ User Profile API: FAILED');
            console.log('   Status:', profileResponse.status);
        }
    } catch (error) {
        console.log('❌ User Profile API: ERROR');
        console.log('   Error:', error.message);
    }

    // Test 2: Get learner context
    console.log('\n2. Testing Learner Context API...');
    try {
        const contextResponse = await fetch('http://localhost:3002/api/learner/context', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (contextResponse.ok) {
            const contextData = await contextResponse.json();
            console.log('✅ Learner Context API: SUCCESS');
            if (contextData.data?.activeClass) {
                console.log('   Active Class:', contextData.data.activeClass.name);
            }
            console.log('   Subjects:', contextData.data?.subjects?.length || 0);
        } else {
            console.log('❌ Learner Context API: FAILED');
            console.log('   Status:', contextResponse.status);
        }
    } catch (error) {
        console.log('❌ Learner Context API: ERROR');
        console.log('   Error:', error.message);
    }

    // Test 3: Get dashboard data
    console.log('\n3. Testing Dashboard API...');
    try {
        const dashboardResponse = await fetch('http://localhost:3002/api/learner/dashboard', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json();
            console.log('✅ Dashboard API: SUCCESS');
            console.log('   Total Courses:', dashboardData.data?.totalCourses);
            console.log('   Average Score:', dashboardData.data?.averageScore + '%');
            console.log('   Study Time (Week):', dashboardData.data?.studyTimeThisWeek + 'h');
        } else {
            console.log('❌ Dashboard API: FAILED');
            console.log('   Status:', dashboardResponse.status);
        }
    } catch (error) {
        console.log('❌ Dashboard API: ERROR');
        console.log('   Error:', error.message);
    }

    // Test 4: Get recent quiz results
    console.log('\n4. Testing Quiz Results API...');
    try {
        const quizResponse = await fetch('http://localhost:3002/api/learner/recent-quiz-results', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (quizResponse.ok) {
            const quizData = await quizResponse.json();
            console.log('✅ Quiz Results API: SUCCESS');
            console.log('   Results Count:', quizData.data?.length || 0);
        } else {
            console.log('❌ Quiz Results API: FAILED');
            console.log('   Status:', quizResponse.status);
        }
    } catch (error) {
        console.log('❌ Quiz Results API: ERROR');
        console.log('   Error:', error.message);
    }

    // Test 5: Test AI recommendations endpoint (if available)
    console.log('\n5. Testing AI Recommendations API...');
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
            console.log('✅ AI Recommendations API: SUCCESS');
            console.log('   Suggestions:', aiData.success ? 'RECEIVED' : 'NOT SUCCESSFUL');
        } else if (aiResponse.status === 404) {
            console.log('⚠️  AI Recommendations API: NOT IMPLEMENTED');
            console.log('   Endpoint not found (404)');
        } else {
            console.log('❌ AI Recommendations API: FAILED');
            console.log('   Status:', aiResponse.status);
        }
    } catch (error) {
        console.log('❌ AI Recommendations API: ERROR');
        console.log('   Error:', error.message);
    }

    console.log('\n🏁 Key API Testing Complete');
    console.log('==========================');
}

testKeyAPIs();
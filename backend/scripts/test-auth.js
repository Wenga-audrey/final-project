import dotenv from 'dotenv';
dotenv.config();

async function testAuthentication() {
    console.log('🔐 Testing Authentication with Default Credentials...');
    console.log('====================================================');

    // Test users with their default passwords from seed.js
    const testUsers = [
        {
            email: 'superadmin@mindboost.com',
            password: 'superadmin123',
            name: 'Super Admin'
        },
        {
            email: 'prepadmin@mindboost.com',
            password: 'prepadmin123',
            name: 'Prep Admin'
        },
        {
            email: 'teacher@mindboost.com',
            password: 'teacher123',
            name: 'Teacher'
        },
        {
            email: 'learner@mindboost.com',
            password: 'learner123',
            name: 'Learner'
        },
        {
            email: 'student@mindboost.com',
            password: 'student123',
            name: 'Student'
        }
    ];

    console.log('Testing login for all users...\n');

    for (const user of testUsers) {
        console.log(`Testing ${user.name} (${user.email})...`);

        try {
            const response = await fetch('http://localhost:3002/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    password: user.password
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ SUCCESS: ${user.name} logged in`);
                console.log(`   Token: ${data.data?.token ? 'RECEIVED' : 'NOT RECEIVED'}`);
                console.log(`   User ID: ${data.data?.user?.id}`);
                console.log(`   Role: ${data.data?.user?.role}`);
            } else {
                const errorData = await response.json();
                console.log(`❌ FAILED: ${user.name} login failed`);
                console.log(`   Status: ${response.status}`);
                console.log(`   Error: ${errorData.error || errorData.message}`);
            }
        } catch (error) {
            console.log(`❌ ERROR: ${user.name} login error`);
            console.log(`   Error: ${error.message}`);
        }

        console.log(''); // Empty line for readability
    }

    console.log('🏁 Authentication Testing Complete');
    console.log('=================================');
}

testAuthentication();
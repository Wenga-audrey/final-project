// Simple API test script
const testApiEndpoints = async () => {
    const baseUrl = 'http://localhost:3002';

    // Test endpoints
    const endpoints = [
        '/api/health',
        '/api/auth/login',
        '/api/auth/register',
        '/api/prep-classes',
        '/api/subjects',
        '/api/forums/study-groups'
    ];

    console.log('Testing API endpoints...\n');

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log(`✓ ${endpoint}: ${response.status} ${response.statusText}`);
        } catch (error) {
            console.log(`✗ ${endpoint}: ${error.message}`);
        }
    }
};

// Run the tests
testApiEndpoints();
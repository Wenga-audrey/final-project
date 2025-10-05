import dotenv from 'dotenv';
dotenv.config();

async function testLoginNotification() {
    console.log('🧪 Testing Login Notification...');
    console.log('============================');

    try {
        // Test login with a known user
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
            console.log('✅ Login successful');
            console.log('   User:', loginData.data.user.firstName, loginData.data.user.lastName);
            console.log('   Role:', loginData.data.user.role);

            // Wait a moment for the notification to be processed
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Check if notification was created
            const notificationsResponse = await fetch(`http://localhost:3002/api/notifications`, {
                headers: {
                    'Authorization': `Bearer ${loginData.data.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (notificationsResponse.ok) {
                const notificationsData = await notificationsResponse.json();
                const securityNotifications = notificationsData.data.notifications.filter(n => n.type === 'security');

                if (securityNotifications.length > 0) {
                    console.log('✅ Login notification created successfully');
                    console.log('   Notification:', securityNotifications[0].title);
                    console.log('   Message:', securityNotifications[0].message.substring(0, 50) + '...');
                } else {
                    console.log('⚠️  No security notifications found');
                }
            } else {
                console.log('❌ Failed to fetch notifications');
            }
        } else {
            console.log('❌ Login failed');
            const errorText = await loginResponse.text();
            console.log('   Error:', errorText);
        }
    } catch (error) {
        console.log('❌ Test error:', error.message);
    }

    console.log('\n🏁 Login Notification Test Complete');
    console.log('==================================');
}

testLoginNotification();
async function testClassId() {
    try {
        const response = await fetch('http://localhost:3002/api/prep-classes');
        const data = await response.json();
        console.log('Response structure:', JSON.stringify(data, null, 2));

        if (data.data && data.data.prepClasses && data.data.prepClasses.length > 0) {
            console.log('First class ID:', data.data.prepClasses[0].id);
        } else if (Array.isArray(data) && data.length > 0) {
            console.log('First class ID:', data[0].id);
        } else {
            console.log('No classes found');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testClassId();
/**
 * Test environment variables loading
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const result = dotenv.config({ path: join(__dirname, 'backend', '.env') });

if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('Environment variables loaded successfully');
}

console.log('=== Environment Variables ===');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
if (process.env.JWT_SECRET) {
    console.log('JWT_SECRET length:', process.env.JWT_SECRET.length);
}
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('PORT:', process.env.PORT || 'Not set (defaulting to 3002)');

// Test JWT token generation
if (process.env.JWT_SECRET) {
    import('./backend/src/lib/jwt.js').then(({ generateToken, verifyToken }) => {
        console.log('\n=== Testing JWT Functions ===');

        const testPayload = {
            userId: 'test-user-id',
            email: 'test@example.com',
            role: 'LEARNER'
        };

        try {
            console.log('Generating test token...');
            const token = generateToken(testPayload);
            console.log('Token generated successfully');

            console.log('Verifying test token...');
            const decoded = verifyToken(token);
            console.log('Token verified successfully:', decoded);
            console.log('✅ All tests passed');
        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
    }).catch(error => {
        console.error('Failed to import JWT library:', error.message);
    });
} else {
    console.log('Cannot test JWT functions - JWT_SECRET not available');
}
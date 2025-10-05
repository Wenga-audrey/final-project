/**
 * Test JWT token generation and verification
 */

import { generateToken, verifyToken } from './backend/src/lib/jwt.js';

console.log('=== JWT Test ===');

// Test payload
const testPayload = {
    userId: 'test-user-id-123',
    email: 'test@example.com',
    role: 'LEARNER'
};

console.log('Test payload:', testPayload);

// Generate token
console.log('\nGenerating token...');
const token = generateToken(testPayload);
console.log('Generated token:', token);

// Verify token
console.log('\nVerifying token...');
try {
    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);
    console.log('✅ Token verification successful');
} catch (error) {
    console.log('❌ Token verification failed:', error.message);
}

// Test with expired token (simulate by using a short expiration)
console.log('\n--- Testing with short expiration ---');
const shortToken = generateToken({ ...testPayload, exp: Math.floor(Date.now() / 1000) - 3600 }); // Expired 1 hour ago
console.log('Generated expired token:', shortToken.substring(0, 20) + '...');

try {
    const decoded = verifyToken(shortToken);
    console.log('Decoded expired token:', decoded);
} catch (error) {
    console.log('✅ Expired token correctly rejected:', error.message);
}
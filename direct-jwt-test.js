/**
 * Direct JWT test using the same configuration as the backend
 */

import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, 'backend', '.env') });

console.log('=== Direct JWT Test ===');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
if (process.env.JWT_SECRET) {
    console.log('JWT_SECRET length:', process.env.JWT_SECRET.length);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
console.log('Using JWT_SECRET length:', JWT_SECRET.length);

// Test payload
const testPayload = {
    userId: 'test-user-id-123',
    email: 'test@example.com',
    role: 'LEARNER'
};

console.log('\nTest payload:', testPayload);

// Generate token
console.log('\nGenerating token...');
const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '7d' });
console.log('Generated token (first 50 chars):', token.substring(0, 50) + "...");

// Verify token
console.log('\nVerifying token...');
try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified successfully');
    console.log('Decoded payload:', decoded);
} catch (error) {
    console.log('❌ Token verification failed:', error.message);
}

// Test with wrong secret
console.log('\nTesting with wrong secret...');
try {
    const decoded = jwt.verify(token, 'wrong-secret');
    console.log('Token verified with wrong secret (unexpected):', decoded);
} catch (error) {
    console.log('✅ Token correctly rejected with wrong secret:', error.message);
}

// Test expiration
console.log('\nTesting with expired token...');
const expiredToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '-1h' });
console.log('Generated expired token (first 50 chars):', expiredToken.substring(0, 50) + "...");

try {
    const decoded = jwt.verify(expiredToken, JWT_SECRET);
    console.log('Expired token verified (unexpected):', decoded);
} catch (error) {
    console.log('✅ Expired token correctly rejected:', error.message);
}
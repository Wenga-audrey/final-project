import { generateToken, verifyToken } from './src/lib/jwt.js';

// Test JWT functionality
console.log("Testing JWT functionality...");

const testPayload = {
    userId: "test-user-id",
    email: "test@example.com",
    role: "LEARNER"
};

console.log("Test payload:", testPayload);

// Generate a token
const token = generateToken(testPayload);
console.log("Generated token:", token);

// Verify the token
try {
    const decoded = verifyToken(token);
    console.log("Decoded token:", decoded);
    console.log("JWT functionality working correctly!");
} catch (error) {
    console.error("JWT verification failed:", error.message);
}
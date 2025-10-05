import dotenv from 'dotenv';
dotenv.config();

import { generateToken, verifyToken } from './src/lib/jwt.js';

// Test JWT functionality with the actual environment
console.log("=== JWT Debug Test ===");
console.log("process.env.JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("process.env.JWT_SECRET length:", process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

const testPayload = {
    userId: "test-user-id",
    email: "test@example.com",
    role: "LEARNER"
};

console.log("\nTest payload:", testPayload);

// Generate a token
const token = generateToken(testPayload);
console.log("\nGenerated token:", token);

// Verify the token
try {
    const decoded = verifyToken(token);
    console.log("\nDecoded token:", decoded);
    console.log("✅ JWT functionality working correctly!");
} catch (error) {
    console.error("❌ JWT verification failed:", error.message);
}

// Test with a sample from the login response
console.log("\n=== Testing with sample token ===");
const sampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWdid2NjNXkwMDAzbXpsdDFsMzk2bGtzIiwiZW1haWwiOiJsZWFybmVyQG1pbmRib29zdC5jb20iLCJyb2xlIjoiTEVBUk5FUiIsImlhdCI6MTc1OTY3NTM0MCwiZXhwIjoxNzYwMjgwMTQwfQ.XFpqkOxvy5ZHWwkmkp";

try {
    const decoded = verifyToken(sampleToken);
    console.log("✅ Sample token verified successfully:", decoded);
} catch (error) {
    console.error("❌ Sample token verification failed:", error.message);
}
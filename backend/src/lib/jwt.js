import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Log environment variables for debugging
console.log("=== JWT Library Initialization ===");
console.log("process.env.JWT_SECRET exists:", !!process.env.JWT_SECRET);
if (process.env.JWT_SECRET) {
  console.log("process.env.JWT_SECRET length:", process.env.JWT_SECRET.length);
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

console.log("Using JWT_SECRET length:", JWT_SECRET.length);
console.log("Using JWT_EXPIRES_IN:", JWT_EXPIRES_IN);

export const generateToken = (payload) => {
  console.log("Generating token with payload:", payload);
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  console.log("Generated token (first 20 chars):", token.substring(0, 20) + "...");
  return token;
};

export const verifyToken = (token) => {
  console.log("Verifying token (first 20 chars):", token.substring(0, 20) + "...");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token verified successfully, decoded:", decoded);
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error.message);
    throw error;
  }
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
};
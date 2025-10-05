#!/usr/bin/env node

/**
 * Initial Setup Script
 * 
 * This script helps with the initial setup of the Mindboost backend:
 * 1. Checks for required environment variables
 * 2. Validates Google AI API key
 * 3. Sets up database connection
 * 4. Runs initial seeding
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");
const envPath = join(projectRoot, ".env");

console.log("🔧 Mindboost Backend Setup");
console.log("==========================");

// Function to run a command and return a promise
function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: "inherit",
            shell: true,
            cwd: projectRoot,
            ...options,
        });

        child.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });

        child.on("error", (error) => {
            reject(error);
        });
    });
}

// Function to check if environment variables are set
function checkEnvVariables() {
    console.log("🔍 Checking environment variables...");

    // Check if .env file exists
    if (!existsSync(envPath)) {
        console.log("❌ .env file not found. Please create one based on .env.example");
        return false;
    }

    // Read .env file
    const envContent = readFileSync(envPath, "utf8");
    const envVars = {};

    // Parse environment variables
    envContent.split("\n").forEach(line => {
        if (line.trim() && !line.startsWith("#")) {
            const [key, value] = line.split("=");
            if (key && value) {
                envVars[key.trim()] = value.trim().replace(/(^"|"$)/g, ""); // Remove quotes
            }
        }
    });

    // Check required variables
    const requiredVars = ["GOOGLE_AI_API_KEY", "JWT_SECRET"];
    let allSet = true;

    requiredVars.forEach(varName => {
        if (!envVars[varName] || envVars[varName] === `your_${varName.toLowerCase()}_here`) {
            console.log(`❌ ${varName} is not set or has default value`);
            allSet = false;
        } else {
            console.log(`✅ ${varName} is set`);
        }
    });

    // Check Google AI API key specifically
    if (envVars.GOOGLE_AI_API_KEY && envVars.GOOGLE_AI_API_KEY !== "your_google_ai_api_key_here") {
        console.log("✅ Google AI API key is configured");
    }

    // Check JWT secret
    if (envVars.JWT_SECRET && envVars.JWT_SECRET !== "your_jwt_secret_here" && envVars.JWT_SECRET !== "your_secure_jwt_secret_here_change_this_in_production" && envVars.JWT_SECRET !== "mindboost_jwt_secret_key_2024_random_string_here") {
        // Check if JWT secret is secure enough
        if (envVars.JWT_SECRET.length < 32) {
            console.log("⚠️  JWT_SECRET should be at least 32 characters for better security");
        } else {
            console.log("✅ JWT_SECRET is properly configured");
        }
    } else {
        console.log("⚠️  Using default JWT_SECRET. Generate a secure one with: npm run generate-jwt-secret");
    }

    return allSet;
}

// Function to validate Google AI API key
async function validateGoogleAIKey() {
    console.log("🤖 Validating Google AI API key...");

    // We'll just check if it's set for now
    const envContent = readFileSync(envPath, "utf8");
    if (envContent.includes("YOUR_VALID_GOOGLE_AI_API_KEY_HERE")) {
        console.log("⚠️  Please replace 'YOUR_VALID_GOOGLE_AI_API_KEY_HERE' in .env with your actual Google AI API key");
        console.log("   Get your API key from: https://makersuite.google.com/app/apikey");
        return false;
    }

    console.log("✅ Google AI API key appears to be set");
    return true;
}

// Function to setup database
async function setupDatabase() {
    console.log("🗄️  Setting up database...");

    try {
        console.log("📦 Generating Prisma client...");
        await runCommand("npx", ["prisma", "generate"]);

        console.log("🔄 Running database migrations...");
        await runCommand("npx", ["prisma", "migrate", "deploy"]);

        console.log("✅ Database setup completed");
        return true;
    } catch (error) {
        console.error("❌ Database setup failed:", error.message);
        return false;
    }
}

// Function to seed database
async function seedDatabase() {
    console.log("🌱 Seeding database with initial data...");

    try {
        await runCommand("npm", ["run", "db:seed"]);
        console.log("✅ Database seeding completed");
        return true;
    } catch (error) {
        console.error("❌ Database seeding failed:", error.message);
        return false;
    }
}

// Main setup function
async function main() {
    try {
        console.log("Starting Mindboost backend setup...\n");

        // Check environment variables
        if (!checkEnvVariables()) {
            console.log("\n📝 Please update your .env file with the required values and run this script again.");
            process.exit(1);
        }

        // Validate Google AI key
        if (!await validateGoogleAIKey()) {
            console.log("\n📝 Please update your Google AI API key in .env and run this script again.");
            process.exit(1);
        }

        // Setup database
        if (!await setupDatabase()) {
            console.log("\n❌ Database setup failed. Please check your database configuration.");
            process.exit(1);
        }

        // Seed database
        if (!await seedDatabase()) {
            console.log("\n❌ Database seeding failed.");
            process.exit(1);
        }

        console.log("\n🎉 Setup completed successfully!");
        console.log("\nNext steps:");
        console.log("1. Start the development server: npm run dev");
        console.log("2. Access the API at: http://localhost:3002");
        console.log("3. Use the demo credentials to log in:");
        console.log("   - Super Admin: superadmin@mindboost.com / superadmin123");
        console.log("   - Prep Admin: prepadmin@mindboost.com / prepadmin123");
        console.log("   - Teacher: teacher@mindboost.com / teacher123");
        console.log("   - Learner: learner@mindboost.com / learner123");

    } catch (error) {
        console.error("Setup failed:", error.message);
        process.exit(1);
    }
}

main();
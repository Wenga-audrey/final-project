#!/usr/bin/env node

/**
 * Database Seeding Script
 * 
 * This script runs the database seeding process to populate the database
 * with initial data including users, classes, subjects, and content.
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

console.log("🌱 Starting database seeding...");

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

async function seedDatabase() {
    try {
        console.log("📦 Generating Prisma client...");
        await runCommand("npx", ["prisma", "generate"]);

        console.log("🗄️ Running database migrations...");
        await runCommand("npx", ["prisma", "migrate", "deploy"]);

        console.log("🌱 Seeding database with initial data...");
        await runCommand("node", ["src/prisma/seed.js"]);

        console.log("✅ Database seeding completed successfully!");
        console.log("\n👥 Demo users created:");
        console.log("   Super Admin: superadmin@mindboost.com / superadmin123");
        console.log("   Prep Admin: prepadmin@mindboost.com / prepadmin123");
        console.log("   Teacher: teacher@mindboost.com / teacher123");
        console.log("   Learner 1: learner@mindboost.com / learner123");
        console.log("   Learner 2: student@mindboost.com / student123");
        console.log("\n🔐 You can now log in with these credentials!");
    } catch (error) {
        console.error("❌ Database seeding failed:", error.message);
        process.exit(1);
    }
}

seedDatabase();
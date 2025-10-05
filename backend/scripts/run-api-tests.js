#!/usr/bin/env node

/**
 * Simple API Test Runner
 * Run all API tests without Jest
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Running API Tests');
console.log('====================');

// Function to run a test script
function runTestScript(scriptName, scriptPath) {
    return new Promise((resolve) => {
        console.log(`\n🧪 Running ${scriptName}...`);
        console.log('-'.repeat(30));

        const child = spawn('node', [scriptPath], {
            stdio: 'inherit',
            cwd: join(__dirname, '..')
        });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${scriptName} completed successfully\n`);
            } else {
                console.log(`❌ ${scriptName} failed with code ${code}\n`);
            }
            resolve(code === 0);
        });

        child.on('error', (error) => {
            console.log(`❌ Error running ${scriptName}:`, error.message);
            resolve(false);
        });
    });
}

// Run all test scripts
async function runAllTests() {
    const testScripts = [
        {
            name: 'Health Check Test',
            path: join(__dirname, 'test-health.js')
        },
        {
            name: 'Authentication Test',
            path: join(__dirname, 'test-auth.js')
        },
        {
            name: 'Profile Endpoints Test',
            path: join(__dirname, 'test-profile.js')
        },
        {
            name: 'Preparatory Classes Test',
            path: join(__dirname, 'test-prep-classes.js')
        }
    ];

    // Check if the comprehensive test script exists
    const comprehensiveTestPath = join(__dirname, 'test-all-apis-with-jest.js');

    console.log('Starting comprehensive API tests...\n');

    const success = await runTestScript('Comprehensive API Tests', comprehensiveTestPath);

    if (success) {
        console.log('🎉 All API tests completed successfully!');
        process.exit(0);
    } else {
        console.log('❌ Some API tests failed!');
        process.exit(1);
    }
}

// Run the tests
runAllTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
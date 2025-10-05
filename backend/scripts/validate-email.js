#!/usr/bin/env node

/**
 * Email Configuration Validation Script
 * 
 * This script validates the email configuration in the .env file
 * and tests the connection to the SMTP server.
 */

import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createTransport } from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const envPath = join(projectRoot, '.env');

// Function to parse .env file
function parseEnvFile() {
    if (!existsSync(envPath)) {
        console.error('❌ .env file not found.');
        return null;
    }

    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim().replace(/(^"|"$)/g, ''); // Remove quotes
            }
        }
    });

    return envVars;
}

// Function to validate email configuration
function validateEmailConfig(envVars) {
    console.log('📧 Validating Email Configuration...');
    console.log('====================================');

    const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
    let isValid = true;

    requiredVars.forEach(varName => {
        if (!envVars[varName] || envVars[varName] === `your_${varName.toLowerCase()}` || envVars[varName].includes('example') || envVars[varName].includes('change')) {
            console.log(`❌ ${varName} is not set or has default value`);
            isValid = false;
        } else {
            console.log(`✅ ${varName} is set`);
        }
    });

    if (!isValid) {
        console.log('\n📝 Please configure your email settings using:');
        console.log('   npm run setup-email');
        return false;
    }

    return true;
}

// Function to test SMTP connection
async function testSmtpConnection(envVars) {
    console.log('\n🧪 Testing SMTP Connection...');
    console.log('============================');

    try {
        // Create transporter
        const transporter = createTransport({
            host: envVars.EMAIL_HOST,
            port: parseInt(envVars.EMAIL_PORT),
            secure: envVars.EMAIL_PORT === '465', // true for 465, false for other ports
            auth: {
                user: envVars.EMAIL_USER,
                pass: envVars.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false // Set to true in production
            }
        });

        // Verify connection
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        return true;
    } catch (error) {
        console.log('❌ SMTP connection failed:', error.message);

        // Provide specific error guidance
        if (error.message.includes('authentication')) {
            console.log('\n💡 Tips:');
            console.log('   - Check your email address and password/App Password');
            console.log('   - For Gmail, use an App Password, not your regular password');
            console.log('   - Generate App Password at: https://myaccount.google.com/apppasswords');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
            console.log('\n💡 Tips:');
            console.log('   - Check your SMTP host and port settings');
            console.log('   - Ensure you have internet connectivity');
        }

        return false;
    }
}

// Main validation function
async function validateEmail() {
    console.log('📧 Mindboost Email Configuration Validator');
    console.log('=========================================');

    // Parse .env file
    const envVars = parseEnvFile();
    if (!envVars) {
        process.exit(1);
    }

    // Validate configuration
    if (!validateEmailConfig(envVars)) {
        process.exit(1);
    }

    // Test SMTP connection
    const connectionSuccess = await testSmtpConnection(envVars);

    if (connectionSuccess) {
        console.log('\n🎉 Email configuration is valid and ready to use!');
        console.log('\n📝 Next steps:');
        console.log('   - Restart your development server to apply changes');
        console.log('   - Test the password reset feature to verify emails are sent');
    } else {
        console.log('\n🔧 Please fix the email configuration and run this script again.');
        process.exit(1);
    }
}

// Run validation
validateEmail().catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
});
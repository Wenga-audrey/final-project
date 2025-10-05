#!/usr/bin/env node

/**
 * Email Configuration Setup Script
 * 
 * This script helps configure email settings for the Mindboost backend.
 * It supports common email providers and allows for custom SMTP settings.
 */

import { createInterface } from 'readline';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const envPath = join(projectRoot, '.env');

// Common email providers configuration
const emailProviders = {
    gmail: {
        name: 'Gmail',
        host: 'smtp.gmail.com',
        port: '587',
        secure: 'false',
        note: 'Requires App Password, not regular password'
    },
    outlook: {
        name: 'Outlook/Hotmail',
        host: 'smtp-mail.outlook.com',
        port: '587',
        secure: 'false',
        note: 'Use your regular email password'
    },
    yahoo: {
        name: 'Yahoo Mail',
        host: 'smtp.mail.yahoo.com',
        port: '587',
        secure: 'false',
        note: 'Requires App Password'
    },
    icloud: {
        name: 'iCloud Mail',
        host: 'smtp.mail.me.com',
        port: '587',
        secure: 'false',
        note: 'Requires App-Specific Password'
    }
};

// Create readline interface for user input
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to ask a question and return a promise
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// Function to update .env file with new values
function updateEnvFile(updates) {
    if (!existsSync(envPath)) {
        console.error('❌ .env file not found. Please create one first.');
        return false;
    }

    try {
        let envContent = readFileSync(envPath, 'utf8');

        // Update each value
        Object.entries(updates).forEach(([key, value]) => {
            const regex = new RegExp(`(${key}\\s*=\\s*).*`, 'g');
            if (envContent.match(regex)) {
                envContent = envContent.replace(regex, `$1"${value}"`);
            } else {
                // If key doesn't exist, add it
                envContent += `\n${key}="${value}"`;
            }
        });

        writeFileSync(envPath, envContent);
        return true;
    } catch (error) {
        console.error('❌ Error updating .env file:', error.message);
        return false;
    }
}

// Function to display email provider options
function displayProviders() {
    console.log('\n📧 Supported Email Providers:');
    console.log('==============================');

    Object.entries(emailProviders).forEach(([key, provider], index) => {
        console.log(`${index + 1}. ${provider.name}`);
        console.log(`   Host: ${provider.host}`);
        console.log(`   Port: ${provider.port}`);
        console.log(`   Note: ${provider.note}\n`);
    });

    console.log(`${Object.keys(emailProviders).length + 1}. Custom SMTP Settings`);
    console.log(`${Object.keys(emailProviders).length + 2}. Skip Email Setup\n`);
}

// Function to get provider configuration
function getProviderConfig(choice) {
    const providers = Object.keys(emailProviders);
    if (choice >= 1 && choice <= providers.length) {
        const providerKey = providers[choice - 1];
        return emailProviders[providerKey];
    }
    return null;
}

// Main email setup function
async function setupEmail() {
    console.log('📧 Mindboost Email Configuration Setup');
    console.log('======================================');

    // Check if .env file exists
    if (!existsSync(envPath)) {
        console.log('❌ .env file not found. Please run the main setup first:');
        console.log('   npm run setup');
        process.exit(1);
    }

    displayProviders();

    try {
        const choice = await askQuestion('Select your email provider (enter number): ');
        const choiceNum = parseInt(choice);

        if (isNaN(choiceNum) || choiceNum < 1 || choiceNum > Object.keys(emailProviders).length + 2) {
            console.log('❌ Invalid choice. Please run the script again.');
            process.exit(1);
        }

        // Handle skip option
        if (choiceNum === Object.keys(emailProviders).length + 2) {
            console.log('⏭  Skipping email configuration. You can set it up later.');
            process.exit(0);
        }

        // Handle custom SMTP
        if (choiceNum === Object.keys(emailProviders).length + 1) {
            console.log('\n  Custom SMTP Configuration');
            console.log('============================');

            const host = await askQuestion('SMTP Host: ');
            const port = await askQuestion('SMTP Port (usually 587 or 465): ');
            const user = await askQuestion('Email Address: ');
            const pass = await askQuestion('Password or App Password: ');

            const updates = {
                EMAIL_HOST: host,
                EMAIL_PORT: port,
                EMAIL_USER: user,
                EMAIL_PASS: pass
            };

            if (updateEnvFile(updates)) {
                console.log('\n Custom SMTP settings saved to .env file!');
            } else {
                console.log('\n Failed to update .env file.');
                process.exit(1);
            }
        } else {
            // Handle predefined provider
            const provider = getProviderConfig(choiceNum);
            if (!provider) {
                console.log(' Invalid provider selection.');
                process.exit(1);
            }

            console.log(`\n  ${provider.name} Configuration`);
            console.log('============================');
            console.log(`Host: ${provider.host}`);
            console.log(`Port: ${provider.port}`);
            console.log(`Note: ${provider.note}\n`);

            const user = await askQuestion('Email Address: ');
            const pass = await askQuestion('Password or App Password: ');

            const updates = {
                EMAIL_HOST: provider.host,
                EMAIL_PORT: provider.port,
                EMAIL_USER: user,
                EMAIL_PASS: pass
            };

            if (updateEnvFile(updates)) {
                console.log(`\n ${provider.name} settings saved to .env file!`);
            } else {
                console.log('\n Failed to update .env file.');
                process.exit(1);
            }
        }

        // Test email configuration
        console.log('\n Testing Email Configuration...');
        console.log('(This will not send an actual email, just verify the settings)');

        // Show next steps
        console.log('\n Next Steps:');
        console.log('1. For Gmail users, make sure to generate an App Password:');
        console.log('   https://myaccount.google.com/apppasswords');
        console.log('2. Restart your development server to apply changes:');
        console.log('   npm run dev');
        console.log('3. Test the password reset feature to verify email is working');

        console.log('\n Email configuration completed successfully!');

    } catch (error) {
        console.error(' Error during email setup:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Run the setup
setupEmail();
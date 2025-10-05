#!/usr/bin/env node

/**
 * Cleanup AI Files Script
 * 
 * This script removes redundant AI-related files that are no longer needed
 * after consolidating functionality into the new aiService.js
 */

import { existsSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// List of files to remove
const filesToRemove = [
    'services/ai.js',
    'src/lib/aiQuizGenerator.js',
    'src/routes/Artificial.js',
    'src/lib/googleAI.js'  // Add this line to remove the redundant googleAI.js file
];

console.log('🧹 Cleaning up redundant AI files...');
console.log('====================================');

let removedCount = 0;
let errorCount = 0;

filesToRemove.forEach(file => {
    const filePath = join(projectRoot, file);

    if (existsSync(filePath)) {
        try {
            unlinkSync(filePath);
            console.log(`✅ Removed: ${file}`);
            removedCount++;
        } catch (error) {
            console.log(`❌ Failed to remove: ${file} - ${error.message}`);
            errorCount++;
        }
    } else {
        console.log(`ℹ️  Not found (already removed): ${file}`);
    }
});

console.log('\n📊 Cleanup Summary:');
console.log(`   Removed: ${removedCount} files`);
console.log(`   Errors: ${errorCount} files`);
console.log(`   Skipped: ${filesToRemove.length - removedCount - errorCount} files (not found)`);

if (errorCount === 0) {
    console.log('\n🎉 Cleanup completed successfully!');
    console.log('The AI functionality is now consolidated in src/lib/aiService.js');
} else {
    console.log('\n⚠️  Cleanup completed with some errors.');
    console.log('Please check the errors above and manually remove any remaining files.');
}
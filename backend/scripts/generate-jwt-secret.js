#!/usr/bin/env node

/**
 * Generate a secure JWT secret
 * 
 * This script generates a secure random string that can be used as a JWT secret.
 */

import { randomBytes } from 'crypto';

console.log('🔐 Generating a secure JWT secret...');
console.log('');

// Generate a 64-character hexadecimal string (32 bytes)
const jwtSecret = randomBytes(32).toString('hex');

console.log('Your generated JWT secret:');
console.log(jwtSecret);
console.log('');
console.log('To use this secret, update your .env file:');
console.log('');
console.log(`JWT_SECRET="${jwtSecret}"`);
console.log('');
console.log('Keep this secret safe and never share it publicly!');
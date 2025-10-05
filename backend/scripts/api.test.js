/**
 * Vitest API Tests for MindBoost Backend
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Configuration
const BASE_URL = `http://localhost:${process.env.PORT || 3002}`;

// Test user data
const TEST_USER = {
    firstName: "Test",
    lastName: "User",
    email: `vitest.test.${Date.now()}@example.com`,
    phone: "+237612345678",
    password: "vitestTestPassword123",
    role: "LEARNER",
    examTargets: ["ENAM"]
};

let authToken = '';
let userId = '';

// Utility function for API requests
async function apiRequest(endpoint, method = 'GET', body = null, auth = false) {
    const url = `${BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json'
    };

    if (auth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    return { status: response.status, data, ok: response.ok };
}

describe('MindBoost API Tests', () => {
    describe('Health Check', () => {
        it('GET /health should return 200', async () => {
            const response = await apiRequest('/health', 'GET');
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('status', 'OK');
        });
    });

    describe('Authentication Endpoints', () => {
        it('POST /api/auth/register should create a new user', async () => {
            const response = await apiRequest('/api/auth/register', 'POST', TEST_USER);
            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty('success', true);
            expect(response.data.data).toHaveProperty('user');
            expect(response.data.data).toHaveProperty('token');

            userId = response.data.data.user.id;
        });

        it('POST /api/auth/login should authenticate the user', async () => {
            const loginData = {
                email: TEST_USER.email,
                password: TEST_USER.password
            };

            const response = await apiRequest('/api/auth/login', 'POST', loginData);
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('success', true);
            expect(response.data.data).toHaveProperty('token');
            expect(response.data.data).toHaveProperty('user');

            authToken = response.data.data.token;
        });

        it('POST /api/auth/forgot-password should process forgot password request', async () => {
            const response = await apiRequest('/api/auth/forgot-password', 'POST', {
                email: TEST_USER.email
            });

            // Should always return 200 for security reasons
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('success', true);
        });
    });

    describe('Profile Endpoints', () => {
        it('GET /api/profile should return user profile', async () => {
            // Skip if not authenticated
            if (!authToken) {
                console.log('Skipping profile test - not authenticated');
                return;
            }

            const response = await apiRequest('/api/profile', 'GET', null, true);
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('success', true);
            expect(response.data.data).toHaveProperty('user');
        });

        it('PUT /api/profile should update user profile', async () => {
            // Skip if not authenticated
            if (!authToken) {
                console.log('Skipping profile update test - not authenticated');
                return;
            }

            const updateData = {
                firstName: "Updated",
                lastName: "VitestUser"
            };

            const response = await apiRequest('/api/profile', 'PUT', updateData, true);
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('success', true);
            expect(response.data.data).toHaveProperty('user');
        });
    });

    describe('Preparatory Class Endpoints', () => {
        it('GET /api/prep-classes should return list of classes', async () => {
            // Skip if not authenticated
            if (!authToken) {
                console.log('Skipping prep classes test - not authenticated');
                return;
            }

            const response = await apiRequest('/api/prep-classes', 'GET', null, true);
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('success', true);
        });
    });

    describe('Forum Endpoints', () => {
        it('GET /api/forums/study-groups should return list of study groups', async () => {
            // Skip if not authenticated
            if (!authToken) {
                console.log('Skipping forums test - not authenticated');
                return;
            }

            const response = await apiRequest('/api/forums/study-groups', 'GET', null, true);
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('success', true);
        });
    });

    describe('Learner Endpoints', () => {
        it('GET /api/learner/dashboard should return dashboard data', async () => {
            // Skip if not authenticated
            if (!authToken) {
                console.log('Skipping learner dashboard test - not authenticated');
                return;
            }

            const response = await apiRequest('/api/learner/dashboard', 'GET', null, true);
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('success', true);
        });
    });
});
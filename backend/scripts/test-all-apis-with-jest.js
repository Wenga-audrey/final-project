#!/usr/bin/env node

/**
 * Comprehensive API Test Script using Jest-style approach
 * Tests all API endpoints in the MindBoost application
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Configuration
const BASE_URL = `http://localhost:${process.env.PORT || 3002}`;
const TEST_USER = {
    firstName: "Test",
    lastName: "User",
    email: `test.${Date.now()}@example.com`,
    phone: "+237612345678",
    password: "testPassword123",
    role: "LEARNER",
    examTargets: ["ENAM"]
};

let authToken = '';
let userId = '';
let classId = '';
let subjectId = '';
let groupId = '';

console.log('🚀 Starting Comprehensive API Tests');
console.log('====================================');
console.log('Base URL:', BASE_URL);
console.log('');

// Utility functions
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

    try {
        const response = await fetch(url, options);
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        return { status: response.status, data, ok: response.ok };
    } catch (error) {
        console.error(`Error calling ${endpoint}:`, error.message);
        return { status: 0, error: error.message, ok: false };
    }
}

function expectStatus(response, expectedStatus) {
    if (response.status === expectedStatus) {
        console.log(`  ✅ Expected status ${expectedStatus} - Received ${response.status}`);
        return true;
    } else {
        console.log(`  ❌ Expected status ${expectedStatus} - Received ${response.status}`);
        return false;
    }
}

function expectSuccess(response) {
    if (response.ok) {
        console.log(`  ✅ Request successful - Status ${response.status}`);
        return true;
    } else {
        console.log(`  ❌ Request failed - Status ${response.status}`);
        if (response.data) {
            console.log(`     Error details:`, typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2));
        }
        return false;
    }
}

// Test suites
async function testHealthEndpoint() {
    console.log('--- Testing Health Endpoint ---');
    const response = await apiRequest('/health', 'GET');
    const passed = expectStatus(response, 200);
    console.log('');
    return passed;
}

async function testAuthEndpoints() {
    console.log('--- Testing Authentication Endpoints ---');
    let passedTests = 0;
    let totalTests = 0;

    // Test Registration
    totalTests++;
    console.log('1. Testing User Registration');
    const registerResponse = await apiRequest('/api/auth/register', 'POST', TEST_USER);
    if (expectStatus(registerResponse, 201)) {
        passedTests++;
        userId = registerResponse.data.data.user.id;
        console.log(`   User ID: ${userId}`);
    }

    // Test Login
    totalTests++;
    console.log('2. Testing User Login');
    const loginData = {
        email: TEST_USER.email,
        password: TEST_USER.password
    };
    const loginResponse = await apiRequest('/api/auth/login', 'POST', loginData);
    if (expectSuccess(loginResponse)) {
        passedTests++;
        authToken = loginResponse.data.data.token;
        console.log(`   Auth token: ${authToken.substring(0, 20)}...`);
    }

    // Test Forgot Password
    totalTests++;
    console.log('3. Testing Forgot Password');
    const forgotResponse = await apiRequest('/api/auth/forgot-password', 'POST', {
        email: TEST_USER.email
    });
    // Should always return 200 for security reasons
    if (expectStatus(forgotResponse, 200)) {
        passedTests++;
    } else {
        console.log(`   Expected 200 but got ${forgotResponse.status}`);
        if (forgotResponse.data) {
            console.log(`   Response:`, typeof forgotResponse.data === 'string' ? forgotResponse.data : JSON.stringify(forgotResponse.data, null, 2));
        }
    }

    console.log(`Auth Tests: ${passedTests}/${totalTests} passed\n`);
    return { passed: passedTests, total: totalTests };
}

async function testProfileEndpoints() {
    if (!authToken) {
        console.log('--- Skipping Profile Endpoints (not authenticated) ---\n');
        return { passed: 0, total: 0 };
    }

    console.log('--- Testing Profile Endpoints ---');
    let passedTests = 0;
    let totalTests = 0;

    // Test Get Profile
    totalTests++;
    console.log('1. Testing Get Profile');
    const getProfileResponse = await apiRequest('/api/profile', 'GET', null, true);
    if (expectSuccess(getProfileResponse)) {
        passedTests++;
    }

    // Test Update Profile
    totalTests++;
    console.log('2. Testing Update Profile');
    const updateData = {
        firstName: "Updated",
        lastName: "User"
    };
    const updateProfileResponse = await apiRequest('/api/profile', 'PUT', updateData, true);
    if (expectSuccess(updateProfileResponse)) {
        passedTests++;
    } else {
        console.log(`   Expected success but got status ${updateProfileResponse.status}`);
        if (updateProfileResponse.data) {
            console.log(`   Response:`, typeof updateProfileResponse.data === 'string' ? updateProfileResponse.data : JSON.stringify(updateProfileResponse.data, null, 2));
        }
    }

    console.log(`Profile Tests: ${passedTests}/${totalTests} passed\n`);
    return { passed: passedTests, total: totalTests };
}

async function testPrepClassEndpoints() {
    if (!authToken) {
        console.log('--- Skipping Preparatory Class Endpoints (not authenticated) ---\n');
        return { passed: 0, total: 0 };
    }

    console.log('--- Testing Preparatory Class Endpoints ---');
    let passedTests = 0;
    let totalTests = 0;

    // Test Get All Classes
    totalTests++;
    console.log('1. Testing Get All Preparatory Classes');
    const getAllResponse = await apiRequest('/api/prep-classes', 'GET', null, true);
    if (expectSuccess(getAllResponse)) {
        passedTests++;
        // Store a class ID for later tests if available
        if (Array.isArray(getAllResponse.data) && getAllResponse.data.length > 0) {
            classId = getAllResponse.data[0].id;
            console.log(`   Using class ID: ${classId}`);
        }
    }

    // Test Get Specific Class
    if (classId) {
        totalTests++;
        console.log('2. Testing Get Specific Preparatory Class');
        const getSpecificResponse = await apiRequest(`/api/prep-classes/${classId}`, 'GET', null, true);
        if (expectSuccess(getSpecificResponse)) {
            passedTests++;
            // Store a subject ID for later tests if available
            if (Array.isArray(getSpecificResponse.data.subjects) &&
                getSpecificResponse.data.subjects.length > 0) {
                subjectId = getSpecificResponse.data.subjects[0].id;
                console.log(`   Using subject ID: ${subjectId}`);
            }
        }
    }

    console.log(`Prep Class Tests: ${passedTests}/${totalTests} passed\n`);
    return { passed: passedTests, total: totalTests };
}

async function testSubjectEndpoints() {
    if (!authToken || !subjectId) {
        console.log('--- Skipping Subject Endpoints (not authenticated or no subject ID) ---\n');
        return { passed: 0, total: 0 };
    }

    console.log('--- Testing Subject Endpoints ---');
    let passedTests = 0;
    let totalTests = 0;

    // Test Get Subject Details
    totalTests++;
    console.log('1. Testing Get Subject Details');
    const response = await apiRequest(`/api/subjects/${subjectId}`, 'GET', null, true);
    if (expectSuccess(response)) {
        passedTests++;
    }

    console.log(`Subject Tests: ${passedTests}/${totalTests} passed\n`);
    return { passed: passedTests, total: totalTests };
}

async function testForumEndpoints() {
    if (!authToken) {
        console.log('--- Skipping Forum Endpoints (not authenticated) ---\n');
        return { passed: 0, total: 0 };
    }

    console.log('--- Testing Forum Endpoints ---');
    let passedTests = 0;
    let totalTests = 0;

    // First, try to create a study group
    totalTests++;
    console.log('1. Testing Create Study Group');
    const createGroupData = {
        name: "Test Study Group",
        description: "A test study group for API testing",
        maxMembers: 10,
        classId: classId // Include the classId we retrieved earlier
    };

    const createResponse = await apiRequest('/api/forums/study-groups', 'POST', createGroupData, true);
    if (createResponse.ok && createResponse.data && createResponse.data.data) {
        passedTests++;
        console.log('   ✅ Study group created successfully');
        groupId = createResponse.data.data.id;
        console.log(`   Using group ID: ${groupId}`);
    } else {
        console.log(`   ❌ Failed to create study group - Status ${createResponse.status}`);
        if (createResponse.data) {
            console.log(`   Response:`, typeof createResponse.data === 'string' ? createResponse.data : JSON.stringify(createResponse.data, null, 2));
        }
    }

    // Test Get All Study Groups
    totalTests++;
    console.log('2. Testing Get All Study Groups');
    const getAllResponse = await apiRequest('/api/forums/study-groups', 'GET', null, true);
    if (expectSuccess(getAllResponse)) {
        passedTests++;
        // Store a group ID for later tests if available and we didn't create one
        if (!groupId && getAllResponse.data.data && Array.isArray(getAllResponse.data.data) && getAllResponse.data.data.length > 0) {
            groupId = getAllResponse.data.data[0].id;
            console.log(`   Using group ID: ${groupId}`);
        }
    } else {
        console.log(`   Expected success but got status ${getAllResponse.status}`);
        if (getAllResponse.data) {
            console.log(`   Response:`, typeof getAllResponse.data === 'string' ? getAllResponse.data : JSON.stringify(getAllResponse.data, null, 2));
        }
    }

    // Test Get Specific Study Group (only if we have a group ID)
    if (groupId) {
        totalTests++;
        console.log('3. Testing Get Specific Study Group');
        const getSpecificResponse = await apiRequest(`/api/forums/study-groups/${groupId}`, 'GET', null, true);
        if (expectSuccess(getSpecificResponse)) {
            passedTests++;
        } else {
            console.log(`   Expected success but got status ${getSpecificResponse.status}`);
            if (getSpecificResponse.data) {
                console.log(`   Response:`, typeof getSpecificResponse.data === 'string' ? getSpecificResponse.data : JSON.stringify(getSpecificResponse.data, null, 2));
            }
        }
    } else {
        console.log('   Skipping specific study group test - no group ID available');
    }

    console.log(`Forum Tests: ${passedTests}/${totalTests} passed\n`);
    return { passed: passedTests, total: totalTests };
}

async function testLearnerEndpoints() {
    if (!authToken) {
        console.log('--- Skipping Learner Endpoints (not authenticated) ---\n');
        return { passed: 0, total: 0 };
    }

    console.log('--- Testing Learner Endpoints ---');
    let passedTests = 0;
    let totalTests = 0;

    // Test Get Learner Dashboard
    totalTests++;
    console.log('1. Testing Get Learner Dashboard');
    const dashboardResponse = await apiRequest('/api/learner/dashboard', 'GET', null, true);
    if (expectSuccess(dashboardResponse)) {
        passedTests++;
    }

    // Test Get Learner Context
    totalTests++;
    console.log('2. Testing Get Learner Context');
    const contextResponse = await apiRequest('/api/learner/context', 'GET', null, true);
    if (expectSuccess(contextResponse)) {
        passedTests++;
    }

    // Test Get Recent Quiz Results
    totalTests++;
    console.log('3. Testing Get Recent Quiz Results');
    const quizResponse = await apiRequest('/api/learner/recent-quiz-results', 'GET', null, true);
    if (expectSuccess(quizResponse)) {
        passedTests++;
    }

    console.log(`Learner Tests: ${passedTests}/${totalTests} passed\n`);
    return { passed: passedTests, total: totalTests };
}

async function runAllTests() {
    console.log('🧪 Running All API Tests\n');

    // Test results tracking
    const results = {
        health: false,
        auth: { passed: 0, total: 0 },
        profile: { passed: 0, total: 0 },
        prepClasses: { passed: 0, total: 0 },
        subjects: { passed: 0, total: 0 },
        forums: { passed: 0, total: 0 },
        learner: { passed: 0, total: 0 }
    };

    // Run tests in order
    results.health = await testHealthEndpoint();
    results.auth = await testAuthEndpoints();
    results.profile = await testProfileEndpoints();
    results.prepClasses = await testPrepClassEndpoints();
    results.subjects = await testSubjectEndpoints();
    results.forums = await testForumEndpoints();
    results.learner = await testLearnerEndpoints();

    // Calculate totals
    const totalTests = results.auth.total + results.profile.total +
        results.prepClasses.total + results.subjects.total +
        results.forums.total + results.learner.total +
        (results.health ? 1 : 0);

    const passedTests = results.auth.passed + results.profile.passed +
        results.prepClasses.passed + results.subjects.passed +
        results.forums.passed + results.learner.passed +
        (results.health ? 1 : 0);

    // Summary
    console.log('====================================');
    console.log('🏁 Test Results Summary');
    console.log('====================================');
    console.log(`Health Check: ${results.health ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Authentication: ${results.auth.passed}/${results.auth.total} tests passed`);
    console.log(`Profile: ${results.profile.passed}/${results.profile.total} tests passed`);
    console.log(`Prep Classes: ${results.prepClasses.passed}/${results.prepClasses.total} tests passed`);
    console.log(`Subjects: ${results.subjects.passed}/${results.subjects.total} tests passed`);
    console.log(`Forums: ${results.forums.passed}/${results.forums.total} tests passed`);
    console.log(`Learner: ${results.learner.passed}/${results.learner.total} tests passed`);
    console.log('');
    console.log(`Overall: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
        console.log('🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('❌ Some tests failed. Check the output above for details.');
        process.exit(1);
    }
}

// Run the tests
runAllTests().catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
});
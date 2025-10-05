import { API_CONFIG } from './shared/config.js';
import { apiRequest } from './shared/api.js';

console.log('Testing API URL construction...');

// Test the register endpoint
const registerEndpoint = API_CONFIG.ENDPOINTS.AUTH.REGISTER;
console.log('Register endpoint:', registerEndpoint);

// Test URL construction
const baseUrl = API_CONFIG.BASE_URL;
console.log('Base URL:', baseUrl);

// Manual URL construction test
const manualUrl = `${baseUrl}${registerEndpoint}`;
console.log('Manual URL construction:', manualUrl);

try {
    new URL(manualUrl);
    console.log('Manual URL is valid');
} catch (error) {
    console.error('Manual URL is invalid:', error.message);
}

// Test the apiRequest function
console.log('\nTesting apiRequest function...');
const testUrl = '/api/auth/register';
console.log('Testing with endpoint:', testUrl);

// Since we're in Node.js, we can't actually make the fetch request
// But we can test the URL construction logic
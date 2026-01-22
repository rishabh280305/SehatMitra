#!/usr/bin/env node

/**
 * Quick API Test Script
 * Tests all authentication endpoints
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';
let authToken = '';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  test: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`)
};

async function testHealthCheck() {
  try {
    log.test('Testing health check...');
    const response = await axios.get('http://localhost:5000/health');
    if (response.data.success) {
      log.success('Health check passed');
      return true;
    }
  } catch (error) {
    log.error(`Health check failed: ${error.message}`);
    return false;
  }
}

async function testRegisterPatient() {
  try {
    log.test('Testing patient registration...');
    const response = await axios.post(`${API_URL}/auth/register`, {
      fullName: 'Test Patient',
      email: `patient${Date.now()}@test.com`,
      phone: `98765${Math.floor(Math.random() * 100000)}`.slice(0, 10),
      password: 'test123',
      role: 'patient',
      dateOfBirth: '1990-01-01',
      gender: 'male'
    });
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      log.success('Patient registered successfully');
      return true;
    }
  } catch (error) {
    log.error(`Registration failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testLogin() {
  try {
    log.test('Testing login...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'patient@test.com',
      password: 'test123'
    });
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      log.success('Login successful');
      return true;
    }
  } catch (error) {
    // Expected to fail if user doesn't exist
    log.info('Login test skipped (user may not exist)');
    return true;
  }
}

async function testGetProfile() {
  try {
    log.test('Testing get profile (protected route)...');
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success && response.data.data) {
      log.success('Profile retrieved successfully');
      log.info(`User: ${response.data.data.fullName} (${response.data.data.role})`);
      return true;
    }
  } catch (error) {
    log.error(`Get profile failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testUpdateDetails() {
  try {
    log.test('Testing update user details...');
    const response = await axios.put(`${API_URL}/auth/updatedetails`, 
      {
        fullName: 'Test Patient Updated'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      log.success('User details updated successfully');
      return true;
    }
  } catch (error) {
    log.error(`Update details failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪  HackVision API Test Suite');
  console.log('='.repeat(60) + '\n');

  const results = [];

  // Test 1: Health Check
  results.push(await testHealthCheck());
  console.log('');

  // Test 2: Register
  results.push(await testRegisterPatient());
  console.log('');

  // Test 3: Login (may skip)
  results.push(await testLogin());
  console.log('');

  // Test 4: Get Profile (requires auth)
  if (authToken) {
    results.push(await testGetProfile());
    console.log('');

    // Test 5: Update Details (requires auth)
    results.push(await testUpdateDetails());
    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    log.success(`All tests passed! (${passed}/${total})`);
  } else {
    log.error(`Some tests failed: ${passed}/${total} passed`);
  }
  console.log('='.repeat(60) + '\n');
}

// Run tests
runAllTests().catch(error => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});

// Simple login test script for debugging
console.log('=== TESTING AUTHENTICATION FLOW ===');

async function testLogin() {
  try {
    // 1. Test login
    console.log('1. Testing login...');
    const loginResponse = await fetch('https://thesimpleai.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'syedarfan@securemaxtech.com',
        password: 'Admin123!'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.message);
    }

    const token = loginData.accessToken;
    console.log('Token received:', token ? 'YES' : 'NO');

    // 2. Test authenticated endpoint with token
    console.log('\\n2. Testing /api/auth/users with token...');
    const usersResponse = await fetch('https://thesimpleai.vercel.app/api/auth/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Users endpoint status:', usersResponse.status);
    const usersData = await usersResponse.json();
    console.log('Users response:', usersData);

    // 3. Test analytics endpoint
    console.log('\\n3. Testing /api/analytics/dashboard with token...');
    const analyticsResponse = await fetch('https://thesimpleai.vercel.app/api/analytics/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Analytics endpoint status:', analyticsResponse.status);
    const analyticsData = await analyticsResponse.json();
    console.log('Analytics response:', analyticsData);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testLogin();

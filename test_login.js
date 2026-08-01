const fetch = require('node-fetch');

async function testLogin() {
  console.log('Testing login...');
  
  // 1. Get CSRF token
  let csrfResponse;
  try {
    csrfResponse = await fetch('http://localhost:3003/api/auth/csrf');
  } catch (e) {
    console.error('Server not ready yet. Error:', e.message);
    process.exit(1);
  }
  
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.csrfToken;
  const cookie = csrfResponse.headers.raw()['set-cookie']?.map(c => c.split(';')[0]).join('; ');

  console.log('Got CSRF Token:', csrfToken);

  // 2. Perform Login
  const loginBody = new URLSearchParams();
  loginBody.append('csrfToken', csrfToken);
  loginBody.append('email', 'admin@va-ra.co');
  loginBody.append('password', 'Admin@123456'); // Password from the seed/create script
  loginBody.append('redirect', 'false');

  const loginResponse = await fetch('http://localhost:3003/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookie
    },
    body: loginBody
  });

  const loginData = await loginResponse.json();
  console.log('Login Response:', loginData);

  if (loginData.ok && loginData.url) {
    console.log('✅ LOGIN SUCCESSFUL!');
  } else {
    console.log('❌ LOGIN FAILED!');
  }
}

testLogin();

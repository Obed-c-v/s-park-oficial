const axios = require('axios');

const BACKEND_URL = 'https://spark-backend-8zi1.onrender.com/api';
const DUMMY_AUDIO_B64 = 'UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA';

async function testFullFlow() {
  console.log('1. Attempting to log in to Render Express Backend...');
  let token = '';
  try {
    const loginRes = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'admin@spark.com',
      password: 'admin123'
    });
    token = loginRes.data.token;
    console.log('Login successful! Token retrieved.');
  } catch (err) {
    console.error('Login Error:', err.response ? err.response.data : err.message);
    return;
  }

  console.log('\n2. Testing Express Backend /registros/voz (authenticated)...');
  try {
    const res = await axios.post(`${BACKEND_URL}/registros/voz`, {
      paciente_id: 1,
      audio: DUMMY_AUDIO_B64
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 30000
    });
    console.log('Backend Response (Status 201):', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Backend Error:', err.response ? { status: err.response.status, data: err.response.data } : err.message);
  }
}

testFullFlow();

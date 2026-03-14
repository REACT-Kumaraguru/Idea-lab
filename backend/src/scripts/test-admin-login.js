
import axios from 'axios';

const testLogin = async () => {
  try {
    console.log("Testing Admin Login...");
    const response = await axios.post('http://213.210.37.189:5001/api/admin/login', {
      email: 'admin@example.com',
      password: 'adminpassword'
    });
    console.log("Login Successful:", response.data);
  } catch (error) {
    console.error("Login Failed:", error.response ? error.response.data : error.message);
  }
};

testLogin();

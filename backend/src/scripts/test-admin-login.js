
import axios from "axios";

const API_BASE = process.env.API_BASE || "http://idealab.kct.ac.in/api";

const testLogin = async () => {
  try {
    console.log("Testing Admin Login...");
    const response = await axios.post(`${API_BASE}/admin/login`, {
      email: "admin@example.com",
      password: "adminpassword",
    });
    console.log("Login Successful:", response.data);
  } catch (error) {
    console.error(
      "Login Failed:",
      error.response ? error.response.data : error.message
    );
  }
};

testLogin();

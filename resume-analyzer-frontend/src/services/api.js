import axios from "axios";

// Use environment variable for API base
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
});

export default api;

import axios from "axios";

// One shared axios instance so we don't repeat the base URL everywhere.
// Vite exposes env vars prefixed with VITE_ via import.meta.env.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Interceptor: runs before every request. If we have a saved JWT in
// localStorage, attach it automatically so we never have to remember
// to add the Authorization header manually in each component.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

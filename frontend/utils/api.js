// utils/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://10.47.98.2:4000/api",
  timeout: 5000,
});

export default api;

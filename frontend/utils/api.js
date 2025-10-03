// utils/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://172.16.209.152:4000/api",
  timeout: 5000,
});

export default api;

import axios from "axios";
const token = localStorage.getItem("auth-storage")
  ? JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state.token
  : null;

export const apiClient = axios.create({
  baseURL: "http://localhost:3400/api",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

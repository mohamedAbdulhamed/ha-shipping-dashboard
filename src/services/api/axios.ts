import axios from "axios";

// This is a public API URL, not a credential. Keep secrets out of VITE_* values.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "https://hassan-shipping.runasp.net/api";

export default axios.create({
  baseURL: API_BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

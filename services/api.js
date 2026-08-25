import axios from "axios";
import { API_BASE_URL } from "../constants/config";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (config._token) {
    config.headers.Authorization = `Bearer ${config._token}`;
  }
  return config;
});

export const sendCode = (email) =>
  api.post("/auth/send-code", { email });

export const verifyCode = (email, code) =>
  api.post("/auth/verify-code", { email, code });

export const getItems = (params) =>
  api.get("/items", { params });

export const getItem = (id) =>
  api.get(`/items/${id}`);

export const createItem = (data, token) =>
  api.post("/items", data, { _token: token });

export const uploadImage = (itemId, formData, token) =>
  api.post(`/items/${itemId}/upload-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    _token: token,
  });

export const createClaim = (data, token) =>
  api.post("/claims", data, { _token: token });

export const getClaim = (code, token) =>
  api.get(`/claims/${code}`, { _token: token });

export const getMyClaims = (token) =>
  api.get("/claims", { _token: token });

export const getCategories = () =>
  api.get("/categories");

export default api;

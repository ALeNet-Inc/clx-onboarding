// src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_BASE || "/api";
export const api = (path: string, init?: RequestInit) =>
  fetch(`${API_BASE}${path}`, { credentials: "include", ...init });

import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

export const getAccess = () =>
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
export const getRefresh = () =>
  typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
export const setTokens = (access, refresh) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};
export const clearTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

const isExpired = (token) => {
  try {
    const dec = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    return dec.exp && dec.exp < now - 5;
  } catch {
    return true;
  }
};

axiosInstance.interceptors.request.use(async (config) => {
  const access = getAccess();

  if (access) {
    if (isExpired(access)) {
      const refresh = getRefresh();
      if (refresh) {
        try {
          const r = await axios.post(`${API_URL}/api/token/refresh/`, { refresh });
          setTokens(r.data.access, refresh);
          config.headers.Authorization = `Bearer ${r.data.access}`;
        } catch {
          clearTokens();
        }
      }
    } else {
      config.headers.Authorization = `Bearer ${access}`;
    }
  }

  return config;
});



export default axiosInstance;

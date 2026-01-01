import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { saveToken, getToken, removeToken } from "utils/token";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: getToken(),
      isAuthenticated: !!getToken(),
      bootstrapped: false,

      bootstrap: () => {
        const token = getToken();
        if (token) {
          set({ token, user: jwtDecode(token), isAuthenticated: true });
        }
        set({ bootstrapped: true });
      },

      login: async (username, password) => {
        try {
          const res = await axios.post(`http://127.0.0.1:8000/api/token/`, {
            username,
            password,
          });
          localStorage.setItem("access_token", res.data.access);
          saveToken(res.data.access);
          const user = jwtDecode(res.data.access);
          set({ user, token: res.data.access, isAuthenticated: true });
          return true;
        } catch {
          return false;
        }
      },

      register: async (username, email, password) => {
        try {
          await axios.post(`${API_URL}/auth/register/`, {
            username,
            email,
            password,
          });
          return true;
        } catch {
          return false;
        }
      },

      logout: () => {
        removeToken();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: "auth-store" },
  ),
);

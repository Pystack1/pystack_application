import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/services/api";

// --- Types ---
interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

interface User {
  id: number;
  email: string;
  full_name?: string;
  roles: string[];
  is_active?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, full_name: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string, user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,

      login: async (email, password) => {
        try {
          // api returns parsed JSON directly (no .data needed)
          const loginData = await api.post<LoginResponse>("/auth/login", { email, password });

          const userData = await api.get<User>("/auth/me", {
            headers: { Authorization: `Bearer ${loginData.access_token}` }
          });

          set({
            isAuthenticated: true,
            accessToken: loginData.access_token,
            refreshToken: loginData.refresh_token,
            user: userData,
          });

          return { ok: true };
        } catch (err: any) {
          console.error("Login error:", err);

          // FIX: Extract error from err.message (which now contains the actual backend detail)
          // or from err.response.data as fallback
          let errorMessage = "Login failed. Please try again.";

          if (err?.response?.data?.detail) {
            errorMessage = err.response.data.detail;
          } else if (err?.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err?.message) {
            errorMessage = err.message;
          }

          return {
            ok: false,
            error: errorMessage,
          };
        }
      },

      register: async (email, password, full_name) => {
        try {
          await api.post("/auth/register", { email, password, full_name });
          return { ok: true };
        } catch (err: any) {
          return {
            ok: false,
            error: err.response?.data?.detail || err.response?.data?.message || err.message || "Registration failed",
          };
        }
      },

      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        }),

      setTokens: (accessToken, refreshToken, user) =>
        set({ isAuthenticated: true, accessToken, refreshToken, user }),
    }),
    {
      name: "pystack-auth",
    }
  )
);
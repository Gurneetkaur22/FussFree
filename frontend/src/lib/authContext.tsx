import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_URL } from "./apiConfig";

const API = API_URL;

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("fussfree_token");
    const savedUser = localStorage.getItem("fussfree_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const saveSession = (token: string, user: AuthUser) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("fussfree_token", token);
    localStorage.setItem("fussfree_user", JSON.stringify(user));
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    saveSession(data.token, data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    saveSession(data.token, data.user);
  };

  const adminLogin = async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Admin login failed");
    saveSession(data.token, data.user);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("fussfree_token");
    localStorage.removeItem("fussfree_user");
    // Also clear old sessionStorage admin flag
    sessionStorage.removeItem("fussfree_admin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        adminLogin,
        logout,
        isAdmin: user?.role === "admin",
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Helper to get auth headers for API calls
export function getAuthHeaders(token: string | null) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

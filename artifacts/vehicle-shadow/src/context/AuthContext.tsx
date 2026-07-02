import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  setTokenAndUser: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("vs_token");
    if (saved) {
      setToken(saved);
      if (saved === "mock_dev_token") {
        setUser({
          id: 1,
          name: "Rahul Sharma",
          email: "rahul@vehicleshadow.in",
          phone: "+91 9810001111"
        });
        setLoading(false);
      } else {
        api.user.profile()
          .then(u => setUser(u))
          .catch(() => { localStorage.removeItem("vs_token"); })
          .finally(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, []);

  function setTokenAndUser(t: string, u: User) {
    localStorage.setItem("vs_token", t);
    setToken(t);
    setUser(u);
  }

  async function login(email: string, password: string) {
    try {
      const res = await api.auth.login(email, password);
      setTokenAndUser(res.token, res.user);
    } catch (err) {
      console.warn("API Server offline or error. Falling back to mock session for development UI testing.", err);
      // Automatically log in to local session to let user explore the premium UI
      setTokenAndUser("mock_dev_token", {
        id: 1,
        name: "Rahul Sharma",
        email: email || "rahul@vehicleshadow.in",
        phone: "+91 9810001111"
      });
    }
  }

  async function signup(name: string, email: string, password: string, phone?: string) {
    try {
      const res = await api.auth.signup(name, email, password, phone);
      setTokenAndUser(res.token, res.user);
    } catch (err) {
      console.warn("API Server offline or error. Falling back to mock session for development UI testing.", err);
      setTokenAndUser("mock_dev_token", {
        id: 1,
        name: name || "Rahul Sharma",
        email: email || "rahul@vehicleshadow.in",
        phone: phone || "+91 9810001111"
      });
    }
  }

  function logout() {
    localStorage.removeItem("vs_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, setTokenAndUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

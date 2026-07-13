import { createContext, useContext, useState } from "react";
import api from "../utils/api";

// AuthContext lets any component in the app know "who is logged in"
// without passing props down manually through every layer (avoids prop drilling).
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage so a page refresh doesn't log the user out
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so components just call useAuth() instead of
// importing useContext + AuthContext every time
export const useAuth = () => useContext(AuthContext);

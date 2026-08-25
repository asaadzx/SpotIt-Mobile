import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import * as api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("token").then((stored) => {
      if (stored) {
        setToken(stored);
        try {
          setUser(jwtDecode(stored));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    });
  }, []);

  const login = async (email) => {
    await api.sendCode(email);
  };

  const verify = async (email, code) => {
    const res = await api.verifyCode(email, code);
    const newToken = res.data.token;
    await AsyncStorage.setItem("token", newToken);
    setToken(newToken);
    try {
      setUser(jwtDecode(newToken));
    } catch {
      setUser(null);
    }
    return res.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, verify, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

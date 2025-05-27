import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";

const API_URL = "http://localhost:6543";

export function useAuth() {
  const [user, setUser] = useState(() => {
    const cookieUser = Cookies.get("user");
    return cookieUser ? JSON.parse(cookieUser) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Membaca data user dari cookie
  const readUserFromCookie = useCallback(() => {
    const cookieUser = Cookies.get("user");
    if (cookieUser) {
      try {
        return JSON.parse(cookieUser);
      } catch (e) {
        console.error("Failed to parse user cookie:", e);
        Cookies.remove("user");
        return null;
      }
    }
    return null;
  }, []);

  // Menginisialisasi state user dari cookie saat hook dimuat
  useEffect(() => {
    const initialUser = readUserFromCookie();
    setUser(initialUser);
    setLoading(false);
  }, [readUserFromCookie]);

  // Fungsi untuk login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Login failed.";
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
      }

      Cookies.set("user", JSON.stringify(data.user), {
        sameSite: "Lax",
        expires: 7,
      });
      setUser(data.user);
      setLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
      return { success: false, error: "An unexpected error occurred." };
    }
  };

  // Fungsi untuk registrasi user baru
  const register = async (username, email, password, role = "client") => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Registration failed.";
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
      }

      setLoading(false);
      return { success: true, message: data.message, user: data.user };
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
      return { success: false, error: "An unexpected error occurred." };
    }
  };

  // Fungsi untuk logout user
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Logout failed.");
        setLoading(false);
        return { success: false, error: data.error };
      }

      Cookies.remove("user");
      setUser(null);
      setLoading(false);
      return { success: true, message: "Logout successful." };
    } catch (err) {
      setError("An unexpected error occurred during logout.");
      setLoading(false);
      return {
        success: false,
        error: "An unexpected error occurred during logout.",
      };
    }
  }, []);

  // Memeriksa status sesi user
  const checkSession = useCallback(() => {
    const currentUser = readUserFromCookie();
    const isValid = !!currentUser;

    return {
      isValid,
      user: isValid ? currentUser : null,
    };
  }, [readUserFromCookie]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    checkSession,
  };
}

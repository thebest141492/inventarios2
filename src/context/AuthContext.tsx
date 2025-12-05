import React, { createContext, useContext, useState } from "react";

type User = {
  username: string;
  role: "admin" | "user"; // Puedes agregar más roles aquí
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  register: () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

const fakeDB: { username: string; password: string; role: "admin" | "user" }[] = [
  { username: "admin", password: "admin123", role: "admin" },
  // Puedes agregar usuarios aquí manualmente
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string) => {
    const found = fakeDB.find(u => u.username === username && u.password === password);
    if (found) {
      setUser({ username: found.username, role: found.role });
      return true;
    }
    return false;
  };

  const register = (username: string, password: string) => {
    if (fakeDB.find(u => u.username === username)) return false;
    fakeDB.push({ username, password, role: "user" }); // Por defecto, rol "user"
    setUser({ username, role: "user" });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

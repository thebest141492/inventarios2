"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Función para obtener usuarios de localStorage
  const getUsers = () => {
    if (typeof window === "undefined") return {};
    const users = localStorage.getItem("usuarios");
    return users ? JSON.parse(users) : {};
  };

  // Función para guardar usuarios en localStorage
  const saveUsers = (users: Record<string, string>) => {
    localStorage.setItem("usuarios", JSON.stringify(users));
  };

  // Registro de usuario
  const register = (user: string, pass: string) => {
    const users = getUsers();
    if (users[user]) return false; // Usuario ya existe
    users[user] = pass;
    saveUsers(users);
    return true;
  };

  // Login de usuario
  const login = (user: string, pass: string) => {
    const users = getUsers();
    if (users[user] && users[user] === pass) {
      localStorage.setItem("usuario_actual", user);
      return true;
    }
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (register(username, password)) {
        setError("");
        router.push("/prueba"); // Redirige siempre a /prueba
      } else {
        setError("Usuario ya existe");
      }
    } else {
      if (login(username, password)) {
        setError("");
        router.push("/prueba"); // Redirige siempre a /prueba
      } else {
        setError("Credenciales incorrectas");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col items-center p-10 w-full max-w-md transition-all duration-500">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 rounded-full p-4 mb-2 shadow-lg">
            <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-1 tracking-tight">
            {isRegister ? "Crear Cuenta" : "Bienvenido"}
          </h2>
          <p className="text-gray-500 text-sm">
            {isRegister ? "Regístrate para comenzar" : "Inicia sesión para continuar"}
          </p>
        </div>
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1" htmlFor="usuario">
              Usuario
            </label>
            <div className="flex items-center border rounded-lg px-3 bg-gray-50">
              <svg className="mr-2" width="20" height="20" fill="#888" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
              </svg>
              <input
                id="usuario"
                type="text"
                placeholder="Usuario"
                className="w-full p-2 bg-transparent outline-none"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1" htmlFor="password">
              Contraseña
            </label>
            <div className="flex items-center border rounded-lg px-3 bg-gray-50">
              <svg className="mr-2" width="20" height="20" fill="#888" viewBox="0 0 24 24">
                <path d="M12 17c1.1 0 2-.9 2-2v-3c0-1.1-.9-2-2-2s-2 .9-2 2v3c0 1.1.9 2 2 2zm6-7V7c0-3.3-2.7-6-6-6S6 3.7 6 7v3c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2zm-8-3c0-2.2 1.8-4 4-4s4 1.8 4 4v3H8V7z"/>
              </svg>
              <input
                id="password"
                type="password"
                placeholder="Contraseña"
                className="w-full p-2 bg-transparent outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-bold shadow-lg hover:scale-105 transition-transform mb-2"
            type="submit"
          >
            {isRegister ? "Registrarse" : "Entrar"}
          </button>
        </form>
        <button
          type="button"
          className="w-full text-purple-600 underline font-semibold mt-2 hover:text-blue-600 transition-colors"
          onClick={() => { setIsRegister(!isRegister); setError(""); }}
        >
          {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </button>
      </div>
    </div>
  );
}

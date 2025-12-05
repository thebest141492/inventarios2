// src/components/Menu.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function Menu() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const usuario = localStorage.getItem("usuario_actual");
      if (!usuario) {
        router.push("/login");
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("usuario_actual");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-6">
      {/* Botón cerrar sesión */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full">
          
          {/* Card Dashboard */}
          <Link href="/components/Dashboard">
            <Card className="cursor-pointer hover:shadow-xl transition duration-300">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <h2 className="text-2xl font-bold mb-2">📊 Dashboard</h2>
                <p className="text-gray-600 text-center">
                  Ver el panel principal con estadísticas
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Card EntradaTela */}
          <Link href="/components/Movimientos/EntradaTela">
            <Card className="cursor-pointer hover:shadow-xl transition duration-300">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <h2 className="text-2xl font-bold mb-2">📥 Entrada Tela</h2>
                <p className="text-gray-600 text-center">
                  Registrar nuevas telas en el inventario
                </p>
              </CardContent>
            </Card>
          </Link>

        </div>
      </div>
    </div>
  );
}

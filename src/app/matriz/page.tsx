"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Navbar from "@/components/Layout/Navbar";
import Dashboard from "@/components/Dashboard/Dashboard";
import InventarioView from "@/components/Inventario/InventarioView";
import RegistroTela from "@/components/Registro/RegistroTela";
import EntradaTela from "@/components/Movimientos/EntradaTela";
import SalidaTela from "@/components/Movimientos/SalidaTela";
import HistorialMovimientos from "@/components/Movimientos/HistorialMovimientos";

export default function MatrizPage() {
  const [currentView, setCurrentView] = useState("dashboard");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const usuario = localStorage.getItem("usuario_actual");
      if (!usuario) {
        router.push("/login");
      }
    }
  }, [router]);

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "inventario":
        return <InventarioView />;
      case "registro":
        return <RegistroTela />;
      case "entradas":
        return <EntradaTela />;
      case "salidas":
        return <SalidaTela />;
      case "movimientos":
        return <HistorialMovimientos />;
      default:
        return <Dashboard />;
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case "dashboard":
        return "Dashboard Principal";
      case "inventario":
        return "Inventario de Telas";
      case "registro":
        return "Registrar Nueva Tela";
      case "entradas":
        return "Registrar Entradas";
      case "salidas":
        return "Registrar Salidas";
      case "movimientos":
        return "Historial de Movimientos";
      default:
        return "Dashboard Principal";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔙 Botón volver al menú y cerrar sesión */}
      <div className="flex justify-end items-center gap-2 p-4">
        <Link
          href="/"
          className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition flex items-center gap-2"
        >
          <span>Menú Principal</span>
          <span className="text-lg">🏠</span>
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem("usuario_actual");
            router.push("/login");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
      </div>

      <Navbar currentView={currentView} onViewChange={setCurrentView} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{getViewTitle()}</h1>
          <p className="mt-2 text-gray-600">
            {currentView === "dashboard" &&
              "Resumen general del inventario y estadísticas principales"}
            {currentView === "inventario" &&
              "Visualiza y gestiona todas las telas en el inventario"}
            {currentView === "registro" &&
              "Agrega nuevas telas al sistema de inventario"}
            {currentView === "entradas" &&
              "Registra la entrada de telas al inventario"}
            {currentView === "salidas" &&
              "Registra la salida de telas del inventario"}
            {currentView === "movimientos" &&
              "Consulta el historial completo de movimientos de inventario"}
          </p>
        </div>

        {renderView()}
      </main>
    </div>
  );
}

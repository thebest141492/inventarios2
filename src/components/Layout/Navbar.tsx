'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventario } from '@/context/InventarioContext';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { estadisticas } = useInventario();

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'inventario', label: 'Inventario', icon: '📦' },
    { key: 'registro', label: 'Registrar Tela', icon: '➕' },
    { key: 'entradas', label: 'Entradas', icon: '📥' },
    { key: 'salidas', label: 'Salidas', icon: '📤' },
    { key: 'movimientos', label: 'Movimientos', icon: '📋' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">🧵 Inventario de Telas</h1>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <Button
                  key={item.key}
                  variant={currentView === item.key ? "default" : "ghost"}
                  onClick={() => onViewChange(item.key)}
                  className="flex items-center gap-2"
                >
                  <span>{item.icon}</span>
                  {item.label}
                  {item.key === 'inventario' && estadisticas.stockBajo > 0 && (
                    <Badge variant="destructive" className="ml-1 animate-pulse font-bold ">
                      {estadisticas.stockBajo}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => {
                // Aquí podrías implementar un menú móvil
              }}
            >
              ☰
            </Button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
          {menuItems.map((item) => (
            <Button
              key={item.key}
              variant={currentView === item.key ? "default" : "ghost"}
              onClick={() => onViewChange(item.key)}
              className="w-full justify-start flex items-center gap-2"
            >
              <span>{item.icon}</span>
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}

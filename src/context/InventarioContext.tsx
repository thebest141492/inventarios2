'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Tela, Movimiento, EstadisticasInventario } from '@/types';

interface InventarioContextType {
  telas: Tela[];
  movimientos: Movimiento[];
  estadisticas: EstadisticasInventario;
  agregarTela: (tela: Omit<Tela, 'id' | 'fechaIngreso'>) => void;
  actualizarTela: (id: string, tela: Partial<Tela>) => void;
  eliminarTela: (id: string) => void;
  registrarEntrada: (telaId: string, cantidad: number, motivo: string, responsable: string, observaciones?: string) => void;
  registrarSalida: (telaId: string, cantidad: number, motivo: string, responsable: string, observaciones?: string) => void;
  obtenerTelaPorId: (id: string) => Tela | undefined;
  filtrarTelas: (filtro: string) => Tela[];
}

const InventarioContext = createContext<InventarioContextType | undefined>(undefined);

export const useInventario = () => {
  const context = useContext(InventarioContext);
  if (!context) {
    throw new Error('useInventario debe usarse dentro de InventarioProvider');
  }
  return context;
};

export const InventarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [telas, setTelas] = useState<Tela[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const telasGuardadas = localStorage.getItem('inventario-telas');
    const movimientosGuardados = localStorage.getItem('inventario-movimientos');

    if (telasGuardadas) {
      setTelas(JSON.parse(telasGuardadas));
    }
    if (movimientosGuardados) {
      setMovimientos(JSON.parse(movimientosGuardados));
    }
  }, []);

  // Guardar en localStorage cuando cambien los datos
  useEffect(() => {
    localStorage.setItem('inventario-telas', JSON.stringify(telas));
  }, [telas]);

  useEffect(() => {
    localStorage.setItem('inventario-movimientos', JSON.stringify(movimientos));
  }, [movimientos]);

  const agregarTela = (telaNueva: Omit<Tela, 'id' | 'fechaIngreso'>) => {
    const nuevaTela: Tela = {
      ...telaNueva,
      id: Date.now().toString(),
      fechaIngreso: new Date().toISOString(),
    };
    setTelas(prev => [...prev, nuevaTela]);
  };

  const actualizarTela = (id: string, datosActualizados: Partial<Tela>) => {
    setTelas(prev => prev.map(tela =>
      tela.id === id ? { ...tela, ...datosActualizados } : tela
    ));
  };

  const eliminarTela = (id: string) => {
    setTelas(prev => prev.filter(tela => tela.id !== id));
  };

  const registrarMovimiento = (telaId: string, cantidad: number, tipo: 'entrada' | 'salida', motivo: string, responsable: string, observaciones?: string) => {
    const nuevoMovimiento: Movimiento = {
      id: Date.now().toString(),
      telaId,
      tipo,
      cantidad,
      fecha: new Date().toISOString(),
      motivo,
      responsable,
      observaciones,
    };

    setMovimientos(prev => [...prev, nuevoMovimiento]);

    // Actualizar stock de la tela
    setTelas(prev => prev.map(tela => {
      if (tela.id === telaId) {
        const nuevaCantidad = tipo === 'entrada'
          ? tela.cantidad + cantidad
          : tela.cantidad - cantidad;
        return { ...tela, cantidad: Math.max(0, nuevaCantidad) };
      }
      return tela;
    }));
  };

  const registrarEntrada = (telaId: string, cantidad: number, motivo: string, responsable: string, observaciones?: string) => {
    registrarMovimiento(telaId, cantidad, 'entrada', motivo, responsable, observaciones);
  };

  const registrarSalida = (telaId: string, cantidad: number, motivo: string, responsable: string, observaciones?: string) => {
    registrarMovimiento(telaId, cantidad, 'salida', motivo, responsable, observaciones);
  };

  const obtenerTelaPorId = (id: string): Tela | undefined => {
    return telas.find(tela => tela.id === id);
  };

  const filtrarTelas = (filtro: string): Tela[] => {
    if (!filtro) return telas;
    const filtroLower = filtro.toLowerCase();
    return telas.filter(tela =>
      tela.nombre.toLowerCase().includes(filtroLower) ||
      tela.tipo.toLowerCase().includes(filtroLower) ||
      tela.color.toLowerCase().includes(filtroLower) ||
      tela.material.toLowerCase().includes(filtroLower)
    );
  };

  const estadisticas: EstadisticasInventario = {
    totalTelas: telas.length,
    valorTotal: telas.reduce((total, tela) => total + (tela.cantidad * tela.precioMetro), 0),
    stockBajo: telas.filter(tela => tela.cantidad <= tela.stockMinimo).length,
    movimientosHoy: movimientos.filter(mov => {
      const hoy = new Date().toDateString();
      const fechaMov = new Date(mov.fecha).toDateString();
      return hoy === fechaMov;
    }).length,
  };

  return (
    <InventarioContext.Provider value={{
      telas,
      movimientos,
      estadisticas,
      agregarTela,
      actualizarTela,
      eliminarTela,
      registrarEntrada,
      registrarSalida,
      obtenerTelaPorId,
      filtrarTelas,
    }}>
      {children}
    </InventarioContext.Provider>
  );
};

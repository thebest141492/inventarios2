'use client';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInventario } from '@/context/InventarioContext';
import { CheckCircle, AlertTriangle, XCircle, List as ListIcon, Calendar, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';

export default function InventarioView() {
  const { telas, filtrarTelas } = useInventario();
  const [filtro, setFiltro] = useState('');
  const [stockFilter, setStockFilter] = useState<'todos' | 'agotado' | 'bajo' | 'enStock'>('todos');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [selectedProveedores, setSelectedProveedores] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStockStatus = (cantidad: number, stockMinimo: number) => {
    if (cantidad === 0) return { label: 'AGOTADO', color: 'text-red-700', badge: 'bg-red-700 text-white' };
    if (cantidad <= stockMinimo) return { label: 'STOCK BAJO', color: 'text-orange-600', badge: 'bg-orange-500 text-white' };
    return { label: 'EN STOCK', color: 'text-green-600', badge: 'bg-green-600 text-white' };
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  const fechasConRegistros = telas.map((t) => new Date(t.fechaIngreso).toDateString());
  const filteredSuggestions = Array.from(
    new Set(
      telas
        .map((t) => t.nombre.toUpperCase())
        .filter((nombre) => nombre.includes(filtro))
    )
  );

  const proveedores = Array.from(new Set(telas.map((t) => t.proveedor)));

  const telasFiltradas = filtrarTelas(filtro)
    .filter((tela) => {
      const status = getStockStatus(tela.cantidad, tela.stockMinimo).label;
      if (stockFilter === 'todos') return true;
      if (stockFilter === 'agotado') return status === 'AGOTADO';
      if (stockFilter === 'bajo') return status === 'STOCK BAJO';
      if (stockFilter === 'enStock') return status === 'EN STOCK';
      return true;
    })
    .filter((tela) => {
      if (!selectedDate) return true;
      return new Date(tela.fechaIngreso).toDateString() === selectedDate.toDateString();
    })
    .filter((tela) => {
      if (selectedProveedores.length === 0) return true;
      return selectedProveedores.includes(tela.proveedor);
    });

  const stockButtons = [
    { label: 'Todos', value: 'todos', icon: <ListIcon className="w-4 h-4 mr-1" /> },
    { label: 'En Stock', value: 'enStock', icon: <CheckCircle className="w-4 h-4 mr-1" /> },
    { label: 'Stock Bajo', value: 'bajo', icon: <AlertTriangle className="w-4 h-4 mr-1" /> },
    { label: 'Agotado', value: 'agotado', icon: <XCircle className="w-4 h-4 mr-1" /> },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredSuggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0) {
        setFiltro(filteredSuggestions[selectedSuggestionIndex]);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {/* Fondo sombreado al abrir sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Botón flotante para abrir sidebar */}
      <Button
        className="fixed top-6 left-6 z-40 bg-blue-600 hover:bg-blue-800 text-white rounded-full p-3 shadow-lg"
        onClick={() => setSidebarOpen(true)}
      >
        <ListIcon className="w-5 h-5" />
      </Button>

      {/* Sidebar compacto */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white/80 backdrop-blur-lg p-4 shadow-2xl transform transition-transform duration-300 z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Proveedores</h2>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-gray-600" />
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {proveedores.map((prov) => {
            const selected = selectedProveedores.includes(prov);
            return (
              <div
                key={prov}
                onClick={() => {
                  if (selected) {
                    setSelectedProveedores(selectedProveedores.filter((p) => p !== prov));
                  } else {
                    setSelectedProveedores([...selectedProveedores, prov]);
                  }
                }}
                className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-all duration-200 text-sm ${
                  selected
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-white/60 hover:bg-blue-100 text-gray-800'
                }`}
              >
                <span className="truncate">{prov}</span>
                {selected && <CheckCircle className="w-4 h-4" />}
              </div>
            );
          })}
        </div>

        {selectedProveedores.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="mt-4 w-full text-sm py-1"
            onClick={() => {
              setSelectedProveedores([]);
              setSidebarOpen(false);
            }}
          >
            Limpiar selección
          </Button>
        )}
      </aside>

      {/* Contenido principal */}
      <div className="ml-0">
        {/* Sección superior de filtros */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Filtro de nombre */}
          <div className="flex items-center gap-2 relative">
            <Input
              placeholder="Buscar telas..."
              value={filtro}
              onChange={(e) => {
                setFiltro(e.target.value.toUpperCase());
                setShowSuggestions(true);
                setSelectedSuggestionIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={handleKeyDown}
              className="w-64"
            />
            <Button
              onClick={() => setFiltro('')}
              className="bg-red-600 hover:bg-red-800 text-white px-3 py-2 rounded"
            >
              Limpiar
            </Button>
            {showSuggestions && filtro && filteredSuggestions.length > 0 && (
              <ul className="absolute top-full left-0 w-64 bg-white border border-gray-300 rounded shadow-md z-50 max-h-60 overflow-auto">
                {filteredSuggestions.map((nombre, index) => (
                  <li
                    key={nombre}
                    className={`px-3 py-2 cursor-pointer ${
                      index === selectedSuggestionIndex ? 'bg-blue-200' : 'hover:bg-blue-100'
                    }`}
                    onMouseDown={() => {
                      setFiltro(nombre);
                      setShowSuggestions(false);
                      setSelectedSuggestionIndex(-1);
                    }}
                  >
                    {nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Filtros de stock + fecha */}
          <div className="flex gap-2 md:ml-auto items-center">
            {stockButtons.map((btn) => (
              <Button
                key={btn.value}
                size="sm"
                variant={stockFilter === btn.value ? 'default' : 'outline'}
                onClick={() => setStockFilter(btn.value as any)}
                className="flex items-center transition-transform transform hover:scale-105"
              >
                {btn.icon} {btn.label}
              </Button>
            ))}

            <div className="relative">
              <Button
                onClick={() => setCalendarOpen(!calendarOpen)}
                className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded flex items-center"
              >
                <Calendar className="w-4 h-4 mr-2" /> Filtrar por fecha
              </Button>
              {calendarOpen && (
                <div
                  ref={calendarRef}
                  className="absolute z-50 mt-2 w-80 bg-white rounded-2xl shadow-lg p-4 right-0"
                >
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date || undefined);
                      setCalendarOpen(false);
                    }}
                    locale={es}
                    modifiers={{
                      registro: (day: Date) => fechasConRegistros.includes(day.toDateString()),
                    }}
                    modifiersClassNames={{
                      registro: 'bg-green-300 text-black rounded-full',
                    }}
                  />
                  {selectedDate && (
                    <Button
                      variant="destructive"
                      className="mt-2 w-full"
                      onClick={() => {
                        setSelectedDate(undefined);
                        setCalendarOpen(false);
                      }}
                    >
                      Quitar filtro
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid de telas */}
        {telasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 col-span-full min-h-[60vh]">
            <div className="text-6xl mb-6">🧵</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
              {telas.length === 0 ? 'No hay telas registradas' : 'No se encontraron telas'}
            </h3>
            <p className="text-gray-800 text-center max-w-md">
              {telas.length === 0
                ? 'Comienza agregando tu primera tela al inventario'
                : 'Intenta con un término de búsqueda, proveedor o fecha diferente'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {telasFiltradas.map((tela) => {
              const stockStatus = getStockStatus(tela.cantidad, tela.stockMinimo);
              const valorTotal = tela.cantidad * tela.precioMetro;
              return (
                <Card
                  key={tela.id}
                  className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-transform hover:scale-[1.03] bg-white border"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-2xl bg-gray-100 flex items-center justify-center">
                    <img
                      src={tela.imagen}
                      alt={tela.nombre}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 hover:scale-105"
                    />
                    <Badge
                      variant="default"
                      className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-md shadow-sm ${stockStatus.badge}`}
                    >
                      {stockStatus.label}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold truncate">{tela.nombre}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{tela.tipo}</span>
                      <span>•</span>
                      <span>{tela.color}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Material:</span>
                      <span className="font-medium">{tela.material}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Proveedor:</span>
                      <span className="font-medium">{tela.proveedor}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Stock actual:</span>
                        <span className={`text-lg font-bold ${stockStatus.color}`}>{formatNumber(tela.cantidad)} m</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Precio/metro:</span>
                        <span className="font-medium">{formatCurrency(tela.precioMetro)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Valor total:</span>
                        <span className="font-bold">{formatCurrency(valorTotal)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Stock mínimo:</span>
                      <span>{tela.stockMinimo} m</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Fecha ingreso:</span>
                      <span>{new Date(tela.fechaIngreso).toLocaleDateString()}</span>
                    </div>
                    {tela.observaciones && (
                      <div className="border-t pt-2">
                        <p className="text-xs text-muted-foreground italic">{tela.observaciones}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        📝 Editar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        📋 Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

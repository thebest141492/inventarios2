'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useInventario } from '@/context/InventarioContext';

export default function SalidaTela() {
  const { telas, registrarSalida } = useInventario();
  const [formData, setFormData] = useState({
    telaId: '',
    cantidad: 0,
    motivo: '',
    responsable: '',
    observaciones: '',
  });
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultadosRef = useRef<HTMLDivElement>(null);

  const motivosSalida = [
    'VENTA A CLIENTE',
    'USO EN PRODUCCIÓN',
    'MUESTRA A CLIENTE',
    'DEFECTO ENCONTRADO',
    'TRANSFERENCIA',
    'DEVOLUCIÓN A PROVEEDOR',
    'OTRO'
  ];

  const telasDisponibles = telas.filter(tela => tela.cantidad > 0);
  const filteredTelas = query
    ? telasDisponibles.filter(tela =>
        tela.nombre.toUpperCase().includes(query.toUpperCase())
      )
    : [];

  const telaSeleccionada = telas.find(t => t.id === formData.telaId);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value.toUpperCase() : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.telaId || !formData.cantidad || !formData.motivo || !formData.responsable) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    if (formData.cantidad <= 0) {
      alert('La cantidad debe ser mayor a cero');
      return;
    }

    if (telaSeleccionada && formData.cantidad > telaSeleccionada.cantidad) {
      alert('No hay suficiente stock disponible');
      return;
    }

    registrarSalida(
      formData.telaId,
      formData.cantidad,
      formData.motivo,
      formData.responsable,
      formData.observaciones
    );

    setFormData({
      telaId: '',
      cantidad: 0,
      motivo: '',
      responsable: '',
      observaciones: '',
    });
    setQuery('');
    setHighlightedIndex(0);
    alert('Salida registrada exitosamente');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredTelas.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredTelas.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredTelas.length) % filteredTelas.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const tela = filteredTelas[highlightedIndex];
      if (tela) {
        handleInputChange('telaId', tela.id);
        setQuery('');
        setHighlightedIndex(0);
      }
    } else if (e.key === 'Escape') {
      setQuery('');
      setHighlightedIndex(0);
    }
  };

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📤</span>
            Registrar Salida de Tela
          </CardTitle>
          <CardDescription>
            Registra la salida de tela del inventario
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Selección de tela con búsqueda y teclado */}
            <div className="space-y-2 relative">
              <Label htmlFor="tela">Seleccionar Tela *</Label>
              <Input
                id="tela"
                ref={inputRef}
                value={telaSeleccionada ? telaSeleccionada.nombre : query}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // convierte a mayúsculas
                  setQuery(value);
                  setFormData(prev => ({ ...prev, telaId: '' }));
                }}
                onKeyDown={handleKeyDown}
                placeholder="Busca la tela..."
                autoComplete="off"
              />
              {query && (
                <div
                  ref={resultadosRef}
                  className="absolute z-10 w-full bg-white border rounded mt-1 max-h-48 overflow-auto shadow-md"
                >
                  {filteredTelas.length > 0 ? (
                    filteredTelas.map((tela, index) => (
                      <div
                        key={tela.id}
                        className={`p-2 cursor-pointer flex justify-between items-center ${
                          index === highlightedIndex ? 'bg-blue-100' : ''
                        }`}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onClick={() => {
                          handleInputChange('telaId', tela.id);
                          setQuery('');
                          setHighlightedIndex(0);
                        }}
                      >
                        <span>{tela.nombre}</span>
                        <Badge variant="outline">{tela.color}</Badge>
                        <span className={`text-sm ${
                          tela.cantidad <= tela.stockMinimo ? 'text-red-600 font-bold' : 'text-muted-foreground'
                        }`}>
                          ({tela.cantidad}m disponibles)
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">No se encontraron resultados.</div>
                  )}
                </div>
              )}
            </div>

            {/* Información de la tela seleccionada */}
            {telaSeleccionada && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-2">Información de la Tela:</h4>
                <div className="text-sm text-orange-800 space-y-1">
                  <p><strong>Tipo:</strong> {telaSeleccionada.tipo}</p>
                  <p><strong>Material:</strong> {telaSeleccionada.material}</p>
                  <p><strong>Stock disponible:</strong> {telaSeleccionada.cantidad} metros</p>
                  <p><strong>Stock mínimo:</strong> {telaSeleccionada.stockMinimo} metros</p>
                  <p><strong>Precio por metro:</strong> ${telaSeleccionada.precioMetro.toFixed(2)}</p>
                  {telaSeleccionada.cantidad <= telaSeleccionada.stockMinimo && (
                    <p className="text-red-600 font-bold">⚠️ Stock bajo - Necesita reposición</p>
                  )}
                </div>
              </div>
            )}

            {/* Cantidad y motivo */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad (metros) *</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="0.1"
                  step="0.1"
                  max={telaSeleccionada?.cantidad || undefined}
                  value={formData.cantidad === 0 ? '' : formData.cantidad} // quitar el cero inicial
                  onChange={(e) => handleInputChange('cantidad', parseFloat(e.target.value) || 0)}
                  placeholder=" "
                />
                {telaSeleccionada && (
                  <p className="text-xs text-muted-foreground">
                    Máximo disponible: {telaSeleccionada.cantidad} metros
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo de Salida *</Label>
                <select
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => handleInputChange('motivo', e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="">Selecciona el motivo</option>
                  {motivosSalida.map((motivo) => (
                    <option key={motivo} value={motivo}>{motivo}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Responsable */}
            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable *</Label>
              <Input
                id="responsable"
                value={formData.responsable}
                onChange={(e) => handleInputChange('responsable', e.target.value)}
                placeholder="Nombre del responsable"
              />
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                placeholder="Notas adicionales sobre la salida..."
                rows={3}
              />
            </div>

            {/* Resumen */}
            {telaSeleccionada && formData.cantidad > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Resumen de la Salida:</h4>
                <div className="text-sm text-red-800 space-y-1">
                  <p><strong>Stock actual:</strong> {telaSeleccionada.cantidad} metros</p>
                  <p><strong>Cantidad a retirar:</strong> -{formData.cantidad} metros</p>
                  <p><strong>Stock resultante:</strong> {telaSeleccionada.cantidad - formData.cantidad} metros</p>
                  <p><strong>Valor de la salida:</strong> ${(formData.cantidad * telaSeleccionada.precioMetro).toFixed(2)}</p>
                  {(telaSeleccionada.cantidad - formData.cantidad) <= telaSeleccionada.stockMinimo && (
                    <p className="text-red-600 font-bold">⚠️ El stock resultante estará por debajo del mínimo</p>
                  )}
                </div>
              </div>
            )}

            {/* Validación de stock */}
            {telaSeleccionada && formData.cantidad > telaSeleccionada.cantidad && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <p className="text-red-800 font-medium">
                  ❌ Error: No hay suficiente stock disponible
                </p>
                <p className="text-red-700 text-sm">
                  Stock disponible: {telaSeleccionada.cantidad} metros
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={!telaSeleccionada || formData.cantidad > telaSeleccionada.cantidad || formData.cantidad <= 0}
              >
                ✅ Registrar Salida
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    telaId: '',
                    cantidad: 0,
                    motivo: '',
                    responsable: '',
                    observaciones: '',
                  });
                  setQuery('');
                  setHighlightedIndex(0);
                }}
              >
                🔄 Limpiar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

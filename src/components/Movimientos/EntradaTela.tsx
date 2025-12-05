'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useInventario } from '@/context/InventarioContext';

export default function EntradaTela() {
  const { telas, registrarEntrada } = useInventario();
  const [formData, setFormData] = useState({
    telaId: '',
    cantidad: 0,
    motivo: '',
    responsable: '',
    observaciones: '',
  });

  const motivosEntrada = [
    'COMPRA NUEVA',
    'DEVOLUCIÓN DE CLIENTE',
    'AJUSTE DE INVENTARIO',
    'TRANSFERENCIA',
    'REPARACIÓN DE STOCK',
    'OTRO'
  ];

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

    registrarEntrada(
      formData.telaId,
      formData.cantidad,
      formData.motivo,
      formData.responsable,
      formData.observaciones
    );

    // Resetear formulario
    setFormData({
      telaId: '',
      cantidad: 0,
      motivo: '',
      responsable: '',
      observaciones: '',
    });

    alert('Entrada registrada exitosamente');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📥</span>
            Registrar Entrada de Tela
          </CardTitle>
          <CardDescription>
            Registra la entrada de tela al inventario
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selección de tela */}
            <div className="space-y-2">
              <Label htmlFor="tela">Seleccionar Tela *</Label>
              <Select value={formData.telaId} onValueChange={(value) => handleInputChange('telaId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la tela" />
                </SelectTrigger>
                <SelectContent>
                  {telas.map((tela) => (
                    <SelectItem key={tela.id} value={tela.id}>
                      <div className="flex items-center gap-2">
                        <span>{tela.nombre}</span>
                        <Badge variant="outline">{tela.color}</Badge>
                        <span className="text-muted-foreground">({tela.cantidad}m)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Información de la tela seleccionada */}
            {telaSeleccionada && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Información de la Tela:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Tipo:</strong> {telaSeleccionada.tipo}</p>
                  <p><strong>Material:</strong> {telaSeleccionada.material}</p>
                  <p><strong>Stock actual:</strong> {telaSeleccionada.cantidad} metros</p>
                  <p><strong>Precio por metro:</strong> ${telaSeleccionada.precioMetro.toFixed(2)}</p>
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
                  value={formData.cantidad}
                  onChange={(e) => handleInputChange('cantidad', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo de Entrada *</Label>
                <Select value={formData.motivo} onValueChange={(value) => handleInputChange('motivo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {motivosEntrada.map((motivo) => (
                      <SelectItem key={motivo} value={motivo}>
                        {motivo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                placeholder="Notas adicionales sobre la entrada..."
                rows={3}
              />
            </div>

            {/* Resumen */}
            {telaSeleccionada && formData.cantidad > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Resumen de la Entrada:</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Stock actual:</strong> {telaSeleccionada.cantidad} metros</p>
                  <p><strong>Cantidad a agregar:</strong> +{formData.cantidad} metros</p>
                  <p><strong>Stock resultante:</strong> {telaSeleccionada.cantidad + formData.cantidad} metros</p>
                  <p><strong>Valor de la entrada:</strong> ${(formData.cantidad * telaSeleccionada.precioMetro).toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                ✅ Registrar Entrada
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

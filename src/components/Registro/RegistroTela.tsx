'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInventario } from '@/context/InventarioContext';
import { Tela } from '@/types';

export default function RegistroTela() {
  const { agregarTela, actualizarTela, eliminarTela, telas } = useInventario();
  const [editingTelaId, setEditingTelaId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    color: '',
    material: '',
    cantidad: '',
    precioMetro: '',
    imagen: '',
    proveedor: '',
    stockMinimo: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const tiposTela = [
    'Algodón', 'Lino', 'Seda', 'Lana', 'Poliéster', 'Nylon',
    'Rayón', 'Denim', 'Jersey', 'Terciopelo', 'Chiffón', 'Otro'
  ];

  const handleInputChange = (field: string, value: string | number) => {
    const camposEnMayusculas = ['nombre', 'color', 'material', 'proveedor', 'observaciones'];
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' && camposEnMayusculas.includes(field)
        ? value.toUpperCase()
        : value
    }));
    setErrors(prev => ({ ...prev, [field]: false })); // limpiar error al escribir
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, imagen: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevosErrores: { [key: string]: boolean } = {};
    if (!formData.nombre) nuevosErrores.nombre = true;
    if (!formData.tipo) nuevosErrores.tipo = true;
    if (!formData.color) nuevosErrores.color = true;
    if (!formData.material) nuevosErrores.material = true;

    setErrors(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      alert('⚠️ Por favor, completa todos los campos obligatorios');
      return;
    }

    const dataToSave = {
      ...formData,
      cantidad: formData.cantidad ? parseFloat(formData.cantidad) : 0,
      precioMetro: formData.precioMetro ? parseFloat(formData.precioMetro) : 0,
      stockMinimo: formData.stockMinimo ? parseInt(formData.stockMinimo) : 0,
      imagen: formData.imagen || '/images/no-disponible.png', // asigna imagen por defecto si no hay
    };

    if (editingTelaId) {
      actualizarTela(editingTelaId, dataToSave);
      alert('Tela actualizada exitosamente');
      setEditingTelaId(null);
    } else {
      agregarTela(dataToSave);
      alert('Tela registrada exitosamente');
    }

    setFormData({
      nombre: '',
      tipo: '',
      color: '',
      material: '',
      cantidad: '',
      precioMetro: '',
      imagen: '',
      proveedor: '',
      stockMinimo: '',
      observaciones: '',
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleSeleccionarTela = (tela: Tela) => {
    setEditingTelaId(tela.id);
    setFormData({
      nombre: tela.nombre ?? '',
      tipo: tela.tipo ?? '',
      color: tela.color ?? '',
      material: tela.material ?? '',
      cantidad: tela.cantidad?.toString() ?? '',
      precioMetro: tela.precioMetro?.toString() ?? '',
      imagen: tela.imagen ?? '',
      proveedor: tela.proveedor ?? '',
      stockMinimo: tela.stockMinimo?.toString() ?? '',
      observaciones: tela.observaciones ?? '',
    });
    setImagePreview(tela.imagen ?? '');
  };

  const handleCancelarEdicion = () => {
    setEditingTelaId(null);
    setFormData({
      nombre: '',
      tipo: '',
      color: '',
      material: '',
      cantidad: '',
      precioMetro: '',
      imagen: '',
      proveedor: '',
      stockMinimo: '',
      observaciones: '',
    });
    setImageFile(null);
    setImagePreview('');
    setErrors({});
  };

  return (
    <div className="flex max-w-5xl mx-auto gap-6">
      {/* Columna izquierda */}
      <div className="w-1/4 border p-4 rounded-lg bg-gray-50 h-[calc(100vh-2rem)] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Telas Registradas</h2>
        <Input
          placeholder="Buscar tela..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <div className="space-y-2">
          {telas
            .filter(tela => tela.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(tela => (
              <div
                key={tela.id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-blue-100 transition ${
                  editingTelaId === tela.id ? 'bg-blue-200 font-medium' : 'bg-white'
                }`}
                onClick={() => handleSeleccionarTela(tela)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={tela.imagen || ''} alt={tela.nombre} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {tela.nombre ? tela.nombre.substring(0, 2).toUpperCase() : '🧵'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{tela.nombre}</p>
                  <p className="text-xs text-muted-foreground">{tela.tipo} - {tela.color}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Columna derecha */}
      <div className="w-3/4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🧵</span>
              {editingTelaId ? 'Editar Tela Seleccionada' : 'Registrar Nueva Tela'}
            </CardTitle>
            <CardDescription>
              {editingTelaId ? 'Modifica la información de la tela seleccionada' : 'Agrega una nueva tela al inventario'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Imagen */}
              <div className="space-y-2">
                <Label>Imagen de la Tela</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
  <AvatarImage
    src={imagePreview || '/images/no-disponible.png'}
    alt={formData.nombre || 'No disponible'}
  />
  <AvatarFallback>
    <img src="/images/no-disponible.png" alt="No disponible" className="h-full w-full object-cover" />
  </AvatarFallback>
</Avatar>

                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Sube una imagen de la tela (opcional)
                    </p>
                  </div>
                </div>
              </div>

              {/* Información básica */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    Nombre de la Tela <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ej: Algodón Premium"
                    className={errors.nombre ? "border-red-500" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">
                    Tipo de Tela <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => handleInputChange('tipo', value)}
                  >
                    <SelectTrigger className={errors.tipo ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposTela.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">
                    Color <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="Ej: Azul marino"
                    className={errors.color ? "border-red-500" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material">
                    Material <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="material"
                    value={formData.material}
                    onChange={(e) => handleInputChange('material', e.target.value)}
                    placeholder="Ej: 100% Algodón"
                    className={errors.material ? "border-red-500" : ""}
                  />
                </div>
              </div>

              {/* Stock y precios */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad Inicial (metros)</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.cantidad}
                    onChange={(e) => handleInputChange('cantidad', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precioMetro">Precio por Metro ($)</Label>
                  <Input
                    id="precioMetro"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precioMetro}
                    onChange={(e) => handleInputChange('precioMetro', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockMinimo">Stock Mínimo (metros)</Label>
                  <Input
                    id="stockMinimo"
                    type="number"
                    min="0"
                    value={formData.stockMinimo}
                    onChange={(e) => handleInputChange('stockMinimo', e.target.value)}
                  />
                </div>
              </div>

              {/* Proveedor */}
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input
                  id="proveedor"
                  value={formData.proveedor}
                  onChange={(e) => handleInputChange('proveedor', e.target.value)}
                  placeholder="Nombre del proveedor"
                />
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  placeholder="Notas adicionales sobre la tela..."
                  rows={3}
                />
              </div>

              {/* Botones */}
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  {editingTelaId ? '💾 Guardar Cambios' : '✅ Registrar Tela'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={editingTelaId ? handleCancelarEdicion : () => {
                    setFormData({
                      nombre: '',
                      tipo: '',
                      color: '',
                      material: '',
                      cantidad: '',
                      precioMetro: '',
                      imagen: '',
                      proveedor: '',
                      stockMinimo: '',
                      observaciones: '',
                    });
                    setImagePreview('');
                    setErrors({});
                  }}
                >
                  🔄 {editingTelaId ? 'Cancelar Edición' : 'Limpiar'}
                </Button>

                {editingTelaId && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de eliminar esta tela?')) {
                        eliminarTela(editingTelaId);
                        handleCancelarEdicion();
                        alert('Tela eliminada exitosamente');
                      }
                    }}
                  >
                    🗑️ Eliminar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

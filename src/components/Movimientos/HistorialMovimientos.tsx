'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInventario } from '@/context/InventarioContext';

export default function HistorialMovimientos() {
  const { movimientos, telas } = useInventario();
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroFecha, setFiltroFecha] = useState<string>('');
  const [filtroTela, setFiltroTela] = useState<string>('');

  const movimientosFiltrados = movimientos
    .filter(mov => {
      if (filtroTipo !== 'todos' && mov.tipo !== filtroTipo) return false;
      if (filtroFecha && !mov.fecha.includes(filtroFecha)) return false;
      if (filtroTela) {
        const tela = telas.find(t => t.id === mov.telaId);
        const nombreTela = tela?.nombre.toLowerCase() || '';
        return nombreTela.includes(filtroTela.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const estadisticasMovimientos = {
    totalEntradas: movimientos.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.cantidad, 0),
    totalSalidas: movimientos.filter(m => m.tipo === 'salida').reduce((sum, m) => sum + m.cantidad, 0),
    movimientosHoy: movimientos.filter(m => {
      const hoy = new Date().toDateString();
      const fechaMov = new Date(m.fecha).toDateString();
      return hoy === fechaMov;
    }).length,
    movimientosUltimos7Dias: movimientos.filter(m => {
      const hace7Dias = new Date();
      hace7Dias.setDate(hace7Dias.getDate() - 7);
      return new Date(m.fecha) >= hace7Dias;
    }).length
  };

  const exportarMovimientos = () => {
    const csv = [
      ['Fecha', 'Tela', 'Tipo', 'Cantidad', 'Motivo', 'Responsable', 'Observaciones'],
      ...movimientosFiltrados.map(mov => {
        const tela = telas.find(t => t.id === mov.telaId);
        return [
          formatDate(mov.fecha),
          tela?.nombre || 'Tela no encontrada',
          mov.tipo,
          mov.cantidad.toString(),
          mov.motivo,
          mov.responsable,
          mov.observaciones || ''
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movimientos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <span className="text-xl">📥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{estadisticasMovimientos.totalEntradas} metros
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salidas</CardTitle>
            <span className="text-xl">📤</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{estadisticasMovimientos.totalSalidas} metros
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoy</CardTitle>
            <span className="text-xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticasMovimientos.movimientosHoy}
            </div>
            <p className="text-xs text-muted-foreground">movimientos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Últimos 7 días</CardTitle>
            <span className="text-xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticasMovimientos.movimientosUltimos7Dias}
            </div>
            <p className="text-xs text-muted-foreground">movimientos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔍</span>
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Movimiento</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="salida">Salidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha</label>
              <Input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Tela</label>
              <Input
                placeholder="Nombre de tela..."
                value={filtroTela}
                onChange={(e) => setFiltroTela(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Acciones</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFiltroTipo('todos');
                    setFiltroFecha('');
                    setFiltroTela('');
                  }}
                  className="flex-1"
                >
                  🔄 Limpiar
                </Button>
                <Button variant="outline" onClick={exportarMovimientos} className="flex-1">
                  📥 Exportar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de movimientos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📋</span>
            Historial de Movimientos
          </CardTitle>
          <CardDescription>
            {movimientosFiltrados.length} de {movimientos.length} movimientos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {movimientosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay movimientos
              </h3>
              <p className="text-gray-500">
                {movimientos.length === 0
                  ? 'No hay movimientos registrados en el sistema'
                  : 'No se encontraron movimientos con los filtros aplicados'
                }
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tela</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientosFiltrados.map((movimiento) => {
                    const tela = telas.find(t => t.id === movimiento.telaId);
                    return (
                      <TableRow key={movimiento.id}>
                        <TableCell className="font-medium">
                          {formatDate(movimiento.fecha)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tela?.nombre || 'Tela no encontrada'}</p>
                            {tela && (
                              <p className="text-sm text-muted-foreground">
                                {tela.color} - {tela.material}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={movimiento.tipo === 'entrada' ? 'default' : 'secondary'}
                          >
                            {movimiento.tipo === 'entrada' ? '📥 Entrada' : '📤 Salida'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${
                            movimiento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {movimiento.tipo === 'entrada' ? '+' : '-'}{movimiento.cantidad} m
                          </span>
                          {tela && movimiento.precioUnitario && (
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(movimiento.cantidad * tela.precioMetro)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>{movimiento.motivo}</TableCell>
                        <TableCell>{movimiento.responsable}</TableCell>
                        <TableCell>
                          {movimiento.observaciones && (
                            <span className="text-sm text-muted-foreground italic">
                              {movimiento.observaciones}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

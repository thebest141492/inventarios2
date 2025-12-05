'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInventario } from '@/context/InventarioContext';

export default function Dashboard() {
  const { estadisticas, telas, movimientos } = useInventario();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const telasStockBajo = telas.filter(tela => tela.cantidad <= tela.stockMinimo);
  const ultimosMovimientos = movimientos
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);

  // Iconos para tipos de movimiento
  const movimientoIcono = (tipo: string) => {
    if (tipo === 'entrada') return <span className="text-green-600">⬆️</span>;
    if (tipo === 'salida') return <span className="text-red-600">⬇️</span>;
    return <span>🔄</span>;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Estadísticas principales */}
        <Card className="bg-gradient-to-br from-blue-50 to-white shadow-lg hover:shadow-2xl transition-shadow duration-300 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Telas</CardTitle>
            <span className="text-[38px] drop-shadow">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-900">{estadisticas.totalTelas}</div>
            <p className="text-xs text-muted-foreground">
              Diferentes tipos de telas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white shadow-lg hover:shadow-2xl transition-shadow duration-300 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <span className="text-[38px] drop-shadow">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-yellow-700">{formatCurrency(estadisticas.valorTotal)}</div>
            <p className="text-xs text-muted-foreground">
              Valor del inventario total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white shadow-lg hover:shadow-2xl transition-shadow duration-300 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <span className="text-[38px] drop-shadow">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-red-600 animate-pulse">{estadisticas.stockBajo}</div>
            <p className="text-xs text-muted-foreground">
              Telas con stock mínimo
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white shadow-lg hover:shadow-2xl transition-shadow duration-300 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos Hoy</CardTitle>
            <span className="text-[38px] drop-shadow">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-green-700">{estadisticas.movimientosHoy}</div>
            <p className="text-xs text-muted-foreground">
              Entradas y salidas de hoy
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Alertas de Stock Bajo */}
        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-[20px] animate-bounce">⚠️</span>
              <span className="tracking-wide">Alertas de Stock Bajo</span>
            </CardTitle>
            <CardDescription>
              Telas que necesitan reposición
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {telasStockBajo.length === 0 ? (
              <p className="text-muted-foreground">No hay alertas de stock bajo</p>
            ) : (
              <div className="space-y-3">
                {telasStockBajo.map((tela) => (
                  <div
                    key={tela.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-red-100 via-red-50 to-white rounded-lg border border-red-400 shadow-sm hover:scale-[1.02] transition-transform duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-red-500 text-xl animate-pulse">⚡</span>
                      <div>
                        <p className="font-semibold">{tela.nombre}</p>
                        <p className="text-xs text-muted-foreground">{tela.color} - {tela.material}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="animate-fade-in">
                        {tela.cantidad} m disponibles
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mínimo: {tela.stockMinimo} m
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimos Movimientos con Timeline */}
        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="animate-fade-in">📋</span>
              <span className="tracking-wide">Últimos Movimientos</span>
            </CardTitle>
            <CardDescription>
              Actividad reciente en el inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ultimosMovimientos.length === 0 ? (
              <p className="text-muted-foreground">No hay movimientos registrados</p>
            ) : (
              <div className="relative pl-8">
                {/* Línea vertical del timeline, ahora con gradiente dinámico */}
                <div className="absolute left-3 top-0 bottom-0 w-1 rounded-full z-0"
                  style={{
                    background: `linear-gradient(
                      to bottom,
                      ${ultimosMovimientos[0]?.tipo === 'entrada' ? '#bbf7d0' : '#fecaca'} 0%,
                      ${ultimosMovimientos.some(m => m.tipo === 'entrada') ? '#bbf7d0' : '#fecaca'} 50%,
                      ${ultimosMovimientos.some(m => m.tipo === 'salida') ? '#fecaca' : '#bbf7d0'} 100%
                    )`
                  }}
                />
                <div className="space-y-8">
                  {ultimosMovimientos.map((movimiento, idx) => {
                    const tela = telas.find(t => t.id === movimiento.telaId);
                    const isEntrada = movimiento.tipo === 'entrada';
                    return (
                      <div
                        key={movimiento.id}
                        className="relative flex items-start gap-3 group transition-transform duration-200 hover:scale-[1.01]"
                      >
                        {/* Punto del timeline más grande y colorido */}
                        <span
                          className={`absolute -left-8 top-2 w-6 h-6 rounded-full border-4 shadow-lg flex items-center justify-center transition-all duration-200
                            ${isEntrada
                              ? 'bg-green-200 border-green-500 group-hover:scale-110'
                              : 'bg-red-200 border-red-500 group-hover:scale-110'
                            }`}
                        >
                          {movimientoIcono(movimiento.tipo)}
                        </span>
                        <div className={`flex-1 rounded-lg border shadow-md p-4 transition group-hover:shadow-xl
                          ${isEntrada
                            ? 'bg-gradient-to-r from-green-50 to-white border-green-100'
                            : 'bg-gradient-to-r from-red-50 to-white border-red-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{tela?.nombre || 'Tela no encontrada'}</p>
                              <p className="text-xs text-muted-foreground">{tela?.color} {tela?.material && `- ${tela.material}`}</p>
                            </div>
                            <Badge
                              variant={isEntrada ? 'default' : 'secondary'}
                              className={isEntrada ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                            >
                              {isEntrada ? '+' : '-'}{movimiento.cantidad} m
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">{movimiento.motivo}</span>
                            <span className="text-xs text-gray-400">{new Date(movimiento.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Animaciones personalizadas */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px);}
          to { opacity: 1; transform: none;}
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </div>
  );
}

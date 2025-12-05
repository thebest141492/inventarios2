export interface Tela {
  id: string;
  nombre: string;
  tipo: string;
  color: string;
  material: string;
  cantidad: number;
  precioMetro: number;
  imagen?: string;
  proveedor: string;
  fechaIngreso: string;
  stockMinimo: number;
  observaciones?: string;
}

export interface Movimiento {
  id: string;
  telaId: string;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  fecha: string;
  motivo: string;
  responsable: string;
  observaciones?: string;
  precioUnitario?: number;
}

export interface EstadisticasInventario {
  totalTelas: number;
  valorTotal: number;
  stockBajo: number;
  movimientosHoy: number;
}

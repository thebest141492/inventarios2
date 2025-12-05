'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

// ===== Tipos =====
type EstadoBase = 'en-curso' | 'completo' | 'bloqueado';

type Fila = {
  id: string;
  modelo: string;
  cliente: string;
  descripcion: string;
  cantidad: number;
  inicio: string; // ISO YYYY-MM-DD
  fin: string; // ISO YYYY-MM-DD
  estado: EstadoBase; // estado ingresado manual (completo, en-curso o bloqueado)
};

// ===== Utils de fecha =====
const toISO = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const diffDays = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
const daysArray = (start: Date, end: Date) => {
  const days: Date[] = [];
  const s = new Date(start);
  const e = new Date(end);
  for (let d = s; d <= e; d = addDays(d, 1)) days.push(new Date(d));
  return days;
};

// ===== Página =====
export default function CronogramaPage() {
  const hoy = new Date();

  const [rows, setRows] = useState<Fila[]>([
    {
      id: 'G024P10621',
      modelo: 'G024P10621',
      cliente: 'CUADROS SANTA PLAYA',
      descripcion: 'Ventas Pedido',
      cantidad: 900,
      inicio: '2024-01-01',
      fin: '2024-03-01',
      estado: 'completo',
    },
    {
      id: 'G024Q10612',
      modelo: 'G024Q10612',
      cliente: 'CUADROS SANTA PLAYA',
      descripcion: 'PP',
      cantidad: 900,
      inicio: toISO(addDays(hoy, -10)),
      fin: toISO(addDays(hoy, +5)),
      estado: 'en-curso',
    },
    {
      id: 'G024P10623',
      modelo: 'G024P10623',
      cliente: 'PINOS NAVIDEÑOS PLAYA',
      descripcion: 'PP',
      cantidad: 500,
      inicio: toISO(addDays(hoy, -20)),
      fin: toISO(addDays(hoy, -2)),
      estado: 'en-curso',
    },
  ]);

  const [form, setForm] = useState<Omit<Fila, 'id'>>({
    modelo: '',
    cliente: '',
    descripcion: '',
    cantidad: 0,
    inicio: toISO(hoy),
    fin: toISO(addDays(hoy, 7)),
    estado: 'en-curso',
  });

  // Rango de calendario en función de las filas
  const { minDate, maxDate } = useMemo(() => {
    if (rows.length === 0) return { minDate: new Date(), maxDate: new Date() };
    const starts = rows.map((r) => new Date(r.inicio).getTime());
    const ends = rows.map((r) => new Date(r.fin).getTime());
    return {
      minDate: new Date(Math.min(...starts)),
      maxDate: new Date(Math.max(...ends)),
    };
  }, [rows]);

  const allDays = useMemo(() => daysArray(minDate, maxDate), [minDate, maxDate]);

  // ===== Config de columnas izquierdas (estilo Excel) =====
  const COLS = [
    { key: 'modelo', title: 'MODELO', w: 150 },
    { key: 'cliente', title: 'CLIENTE', w: 200 },
    { key: 'descripcion', title: 'DESCRIPCIÓN', w: 220 },
    { key: 'cantidad', title: 'CANT', w: 90 },
    { key: 'inicio', title: 'FECHA INI', w: 120 },
    { key: 'fin', title: 'FECHA FIN', w: 120 },
    { key: 'dias', title: 'DÍAS RESTAN', w: 120 },
    { key: 'estado', title: 'ESTADO', w: 120 },
  ] as const;

  const LEFT_COLS = COLS.length; // 8
  const DAY_COL_WIDTH = 40; // px

  // Acumulado de left para sticky
  const leftOffset = (idx: number) => COLS.slice(0, idx).reduce((acc, c) => acc + c.w, 0);

  // Estilo del grid principal (8 columnas fijas + días)
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `${COLS.map((c) => `${c.w}px`).join(' ')} repeat(${allDays.length}, ${DAY_COL_WIDTH}px)`,
  };

  // Estado calculado y KPIs
  const estadoCalculado = (r: Fila): 'Completo' | 'En tiempo' | 'Vencido' | 'Bloqueado' => {
    if (r.estado === 'completo') return 'Completo';
    if (r.estado === 'bloqueado') return 'Bloqueado';
    const fin = new Date(r.fin);
    return hoy > fin ? 'Vencido' : 'En tiempo';
  };

  const diasRestantes = (r: Fila) => Math.max(0, diffDays(hoy, new Date(r.fin)));

  const kpis = useMemo(() => {
    const total = rows.length;
    const completos = rows.filter((r) => estadoCalculado(r) === 'Completo').length;
    const vencidos = rows.filter((r) => estadoCalculado(r) === 'Vencido').length;
    const enCurso = rows.filter((r) => estadoCalculado(r) === 'En tiempo').length;
    const avance = total === 0 ? 0 : Math.round((completos / total) * 100);
    return { total, completos, vencidos, enCurso, avance };
  }, [rows]);

  // Barra Gantt: de qué columna a cuál
  const colIndexes = (inicioISO: string, finISO: string) => {
    const startIdx = Math.max(0, diffDays(minDate, new Date(inicioISO)));
    const endIdx = Math.max(0, diffDays(minDate, new Date(finISO)));
    // +LEFT_COLS para saltar las columnas fijas, +1/+2 por líneas del grid
    return { from: LEFT_COLS + startIdx + 1, to: LEFT_COLS + endIdx + 2 };
  };

  const badgeClass = (estado: ReturnType<typeof estadoCalculado>) =>
    estado === 'Completo'
      ? 'bg-emerald-500 text-white'
      : estado === 'Vencido'
      ? 'bg-red-500 text-white'
      : estado === 'Bloqueado'
      ? 'bg-zinc-500 text-white'
      : 'bg-blue-500 text-white';

  const barClass = (estado: ReturnType<typeof estadoCalculado>) =>
    estado === 'Completo'
      ? 'bg-emerald-500'
      : estado === 'Vencido'
      ? 'bg-red-500'
      : estado === 'Bloqueado'
      ? 'bg-zinc-400'
      : 'bg-blue-500';

  // Alta de fila
  const addRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.modelo.trim()) return;
    if (new Date(form.fin) < new Date(form.inicio)) return alert('La fecha fin no puede ser menor que inicio.');
    const nuevo: Fila = { id: `F-${Math.random().toString(36).slice(2, 7)}`, ...form };
    setRows((prev) => [...prev, nuevo]);
    setForm({ modelo: '', cliente: '', descripcion: '', cantidad: 0, inicio: toISO(hoy), fin: toISO(addDays(hoy, 7)), estado: 'en-curso' });
  };

  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back to menu */}
        <div className="flex justify-end">
          <Link href="/" className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition flex items-center gap-2">
            <span>Menú Principal</span>
            <span className="text-lg">🏠</span>
          </Link>
        </div>

        {/* Encabezado y KPIs */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cronograma de Producción</h1>
            <p className="text-gray-600">Visualización tipo Gantt con columnas estilo Excel.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-sky-50 p-3 text-center border">
              <div className="text-2xl font-bold">{kpis.total}</div>
              <div className="text-xs text-gray-500">Modelos</div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-center border">
              <div className="text-2xl font-bold">{kpis.enCurso}</div>
              <div className="text-xs text-gray-500">En tiempo</div>
            </div>
            <div className="rounded-2xl bg-rose-50 p-3 text-center border">
              <div className="text-2xl font-bold">{kpis.vencidos}</div>
              <div className="text-xs text-gray-500">Atrasado</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-center border">
              <div className="text-2xl font-bold">{kpis.avance}%</div>
              <div className="text-xs text-gray-500">% Avance</div>
            </div>
          </div>
        </header>

        {/* Formulario */}
        <form onSubmit={addRow} className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end bg-gray-50 p-4 rounded-2xl border">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Modelo</label>
            <input className="w-full rounded-xl border p-2" value={form.modelo} onChange={(e) => setForm((f) => ({ ...f, modelo: e.target.value }))} placeholder="G024P10xxx" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <input className="w-full rounded-xl border p-2" value={form.cliente} onChange={(e) => setForm((f) => ({ ...f, cliente: e.target.value }))} placeholder="Cliente" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <input className="w-full rounded-xl border p-2" value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} placeholder="PP / Pedido / ..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cantidad</label>
            <input type="number" className="w-full rounded-xl border p-2" value={form.cantidad} onChange={(e) => setForm((f) => ({ ...f, cantidad: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Inicio</label>
            <input type="date" className="w-full rounded-xl border p-2" value={form.inicio} onChange={(e) => setForm((f) => ({ ...f, inicio: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fin</label>
            <input type="date" className="w-full rounded-xl border p-2" value={form.fin} onChange={(e) => setForm((f) => ({ ...f, fin: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select className="w-full rounded-xl border p-2" value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as EstadoBase }))}>
              <option value="en-curso">En curso</option>
              <option value="completo">Completo</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
          </div>
          <div className="md:col-span-7">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">Agregar</button>
          </div>
        </form>

        {/* Leyenda */}
        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 inline-block rounded-full bg-blue-500" /> En tiempo</span>
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 inline-block rounded-full bg-emerald-500" /> Completo</span>
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 inline-block rounded-full bg-red-500" /> Vencido</span>
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 inline-block rounded-full bg-zinc-400" /> Bloqueado</span>
        </div>

        {/* Gantt */}
        <div className="border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {/* Encabezado */}
            <div style={gridStyle} className="border-b bg-gray-50 text-xs font-semibold">
              {COLS.map((c, i) => (
                <div key={c.key} className="p-3 border-l sticky z-20 bg-gray-50" style={{ left: leftOffset(i) }}>
                  {c.title}
                </div>
              ))}
              {allDays.map((d, idx) => {
                const label = d.getDate() === 1 ? `${d.toLocaleString('es', { month: 'short' })} ${d.getDate()}` : `${d.getDate()}`;
                return (
                  <div key={idx} className="p-2 text-gray-600 text-center border-l" title={d.toLocaleDateString('es')}>
                    {label}
                  </div>
                );
              })}
            </div>

            {/* Filas */}
            <div style={gridStyle}>
              {rows.map((r, rowIdx) => {
                const est = estadoCalculado(r);
                const fromTo = colIndexes(r.inicio, r.fin);
                return (
                  <>
                    {/* Celdas fijas (sticky) */}
                    <div key={`${r.id}-modelo`} className="p-3 border-t border-l sticky bg-white z-10" style={{ left: leftOffset(0) }}>{r.modelo}</div>
                    <div key={`${r.id}-cliente`} className="p-3 border-t border-l sticky bg-white z-10" style={{ left: leftOffset(1) }}>{r.cliente}</div>
                    <div key={`${r.id}-desc`} className="p-3 border-t border-l sticky bg-white z-10" style={{ left: leftOffset(2) }}>{r.descripcion}</div>
                    <div key={`${r.id}-cant`} className="p-3 border-t border-l sticky bg-white z-10 text-right" style={{ left: leftOffset(3) }}>{r.cantidad.toLocaleString('es')}</div>
                    <div key={`${r.id}-ini`} className="p-3 border-t border-l sticky bg-white z-10" style={{ left: leftOffset(4) }}>{r.inicio}</div>
                    <div key={`${r.id}-fin`} className="p-3 border-t border-l sticky bg-white z-10" style={{ left: leftOffset(5) }}>{r.fin}</div>
                    <div key={`${r.id}-dias`} className="p-3 border-t border-l sticky bg-white z-10 text-right" style={{ left: leftOffset(6) }}>{diasRestantes(r)}</div>
                    <div key={`${r.id}-estado`} className="p-3 border-t border-l sticky bg-white z-10" style={{ left: leftOffset(7) }}>
                      <span className={`px-2 py-1 rounded-full text-xs ${badgeClass(est)}`}>{est}</span>
                    </div>

                    {/* Celdas de días (para cuadrícula) */}
                    {allDays.map((_, i) => (
                      <div key={`${r.id}-day-${i}`} className={`border-t border-l h-10 ${rowIdx % 2 ? 'bg-white' : 'bg-gray-50'}`} />
                    ))}

                    {/* Barra Gantt */}
                    <div
                      key={`${r.id}-bar`}
                      className={`h-7 rounded-full ${barClass(est)} shadow-md self-center`}
                      style={{ gridColumn: `${fromTo.from} / ${fromTo.to}`, marginTop: '-34px' }}
                      title={`${r.modelo} • ${r.inicio} → ${r.fin}`}
                    />

                    {/* Botón eliminar - posicionado sobre primera columna */}
                    <div key={`${r.id}-actions`} className="p-3 border-t border-l sticky bg-white z-10" style={{ left: leftOffset(0) }}>
                      <button onClick={() => removeRow(r.id)} className="text-xs text-red-600 hover:underline">Eliminar</button>
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500">Rango mostrado: {toISO(minDate)} a {toISO(maxDate)} • Desplázate horizontalmente para ver más días.</p>
      </div>
    </div>
  );
}

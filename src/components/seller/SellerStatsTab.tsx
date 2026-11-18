import React, { useState } from 'react';
import { Business, Product, Order } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  DollarSign,
  Package,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Star,
  Plus,
  Download
} from 'lucide-react';

interface SellerStatsTabProps {
  biz: Business;
  bizProducts: Product[];
  sellerOrders: Order[];
  onGoToCatalog: () => void;
}

export const SellerStatsTab: React.FC<SellerStatsTabProps> = ({
  biz,
  bizProducts,
  sellerOrders,
  onGoToCatalog
}) => {
  const { formatCurrency } = useApp();
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const now = new Date();
  const periodOrders = sellerOrders.filter((o) => {
    if (periodFilter === 'all') return true;
    const d = new Date(o.createdAt);
    if (isNaN(d.getTime())) return true;
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
    if (periodFilter === 'today') return diffHours <= 24;
    if (periodFilter === 'week') return diffHours <= 24 * 7;
    if (periodFilter === 'month') return diffHours <= 24 * 30;
    return true;
  });

  const nonCancelledOrders = periodOrders.filter((o) => o.status !== 'cancelled');
  const deliveredOrders = periodOrders.filter((o) => o.status === 'delivered');
  const cancelledOrders = periodOrders.filter((o) => o.status === 'cancelled');

  const grossSalesBs = nonCancelledOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const commissionRate = Number(biz.commissionRate ?? 10);
  const commissionBs = nonCancelledOrders.reduce((sum, o) => {
    if (o.settlement) return sum + o.settlement.platformCommissionBs;
    return sum + Number((((Number(o.subtotal) || Number(o.total) || 0) * commissionRate) / 100).toFixed(2));
  }, 0);
  const netRevenueBs = nonCancelledOrders.reduce((sum, o) => {
    if (o.settlement) return sum + o.settlement.storeNetBs;
    return sum + Math.max(0, Number(((Number(o.subtotal) || Number(o.total) || 0) * (1 - commissionRate / 100)).toFixed(2)));
  }, 0);
  const avgTicketBs = nonCancelledOrders.length > 0 ? grossSalesBs / nonCancelledOrders.length : 0;

  const whatsappOrdersCount = periodOrders.filter((o) => o.orderChannel === 'whatsapp').length;
  const appOrdersCount = periodOrders.length - whatsappOrdersCount;

  const lowStockProducts = bizProducts.filter((p) => p.stockCount <= 5);
  const activeOffersCount = bizProducts.filter((p) => p.isOfferOfTheDay).length;

  // Top ordered products aggregation
  const productCounts: Record<string, { name: string; qty: number; revenueBs: number }> = {};
  nonCancelledOrders.forEach((order) => {
    order.items.forEach((item) => {
      const id = item.product.id;
      const unitBs = item.itemTotalBs ?? item.product.price;
      if (!productCounts[id]) {
        productCounts[id] = { name: item.product.name, qty: 0, revenueBs: 0 };
      }
      productCounts[id].qty += item.quantity;
      productCounts[id].revenueBs += unitBs * item.quantity;
    });
  });
  const topProducts = Object.values(productCounts)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const handleDownloadCsv = () => {
    const headers = ['Orden', 'Fecha', 'Cliente', 'Canal', 'Estado', 'Subtotal Bs', 'Comision Plataforma Bs', 'Neto Comercio Bs', 'Total Orden Bs'];
    const rows = periodOrders.map((o) => {
      const sub = Number(o.subtotal || o.total || 0);
      const comm = o.settlement ? o.settlement.platformCommissionBs : Number(((sub * commissionRate) / 100).toFixed(2));
      const net = o.settlement ? o.settlement.storeNetBs : Number((sub - comm).toFixed(2));
      return [
        o.id,
        `"${o.createdAt}"`,
        `"${o.customerName}"`,
        o.orderChannel || 'app',
        o.status,
        sub.toFixed(2),
        comm.toFixed(2),
        net.toFixed(2),
        Number(o.total || 0).toFixed(2)
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `estado_cuenta_${biz.id}_${periodFilter}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#D4021D]" />
            <span>Métricas y Finanzas de {biz.name}</span>
          </h3>
          <p className="text-xs text-slate-500">
            Resumen en Bolívares (Bs.) y Dólares ($ USD) de ventas, comisiones y liquidación neta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
            {[
              { id: 'today', label: 'Hoy' },
              { id: 'week', label: 'Semana' },
              { id: 'month', label: 'Mes' },
              { id: 'all', label: 'Todo' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodFilter(p.id as any)}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                  periodFilter === p.id ? 'bg-[#D4021D] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Estado de Cuenta CSV</span>
          </button>

          <button
            type="button"
            onClick={onGoToCatalog}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Productos</span>
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Ventas Totales</span>
            <DollarSign className="w-4 h-4 text-[#D4021D]" />
          </div>
          <p className="text-lg font-black text-slate-900 tabular-nums">
            {formatCurrency(grossSalesBs).bs}
          </p>
          <p className="text-xs font-bold text-emerald-700 tabular-nums">
            {formatCurrency(grossSalesBs).usd}
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
            <span>Saldo Neto a Depositar</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-black text-emerald-950 tabular-nums">
            {formatCurrency(netRevenueBs).bs}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold">
            Comisión {commissionRate}%: {formatCurrency(commissionBs).bs}
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Pedidos Recibidos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-black text-slate-900 tabular-nums">
            {periodOrders.length} pedidos
          </p>
          <p className="text-[11px] text-slate-600">
            ✓ {deliveredOrders.length} entregados · ✕ {cancelledOrders.length} cancelados
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Ticket Promedio y Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-lg font-black text-slate-900 tabular-nums">
            {formatCurrency(avgTicketBs).bs}
          </p>
          <p className="text-[11px] text-slate-600">
            ⭐ {biz.rating.toFixed(1)} ({biz.reviewsCount} reseñas)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Channel Breakdown & Top Products */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-4 shadow-xs">
          <h4 className="font-extrabold text-slate-900 text-sm">
            Canales de Venta y Productos Más Pedidos
          </h4>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800 font-bold block">💬 Vía WhatsApp</span>
              <span className="text-xl font-black text-emerald-950">{whatsappOrdersCount}</span>
              <span className="text-[11px] text-emerald-700 block">pedidos recibidos</span>
            </div>
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
              <span className="text-[#D4021D] font-bold block">📱 Vía App Marketplace</span>
              <span className="text-xl font-black text-slate-950">{appOrdersCount}</span>
              <span className="text-[11px] text-red-700 block">pedidos recibidos</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase text-slate-500">Top Productos Vendidos</p>
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                Aún no hay ventas registradas para calcular el ranking de productos.
              </p>
            ) : (
              topProducts.map((tp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-[#D4021D] text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 truncate">{tp.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-800 block">{tp.qty} uds</span>
                    <span className="text-[10px] text-[#D4021D] font-bold tabular-nums">
                      {formatCurrency(tp.revenueBs).bs}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Inventory Health */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#D4021D]" />
              <span>Estado de Inventario ({bizProducts.length} productos)</span>
            </h4>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              🔥 {activeOffersCount} ofertas activas
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {bizProducts.length === 0
                  ? 'Aún no tienes productos cargados. Empieza agregando tu catálogo.'
                  : 'Todo tu catálogo tiene stock saludable (más de 5 unidades por producto).'}
              </span>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <p className="text-[11px] font-bold uppercase text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Productos con Stock Bajo o Agotados ({lowStockProducts.length})
              </p>
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs"
                >
                  <span className="font-bold text-slate-900 truncate">{p.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0 ${
                      p.stockCount <= 0
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-200 text-amber-950'
                    }`}
                  >
                    {p.stockCount <= 0 ? 'Agotado (0)' : `${p.stockCount} uds`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {cancelledOrders.length > 0 && (
            <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200 text-xs flex items-center gap-2 text-red-800">
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                Tienes <strong>{cancelledOrders.length}</strong> pedido(s) cancelado(s) en tu historial.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

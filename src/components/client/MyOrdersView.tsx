import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Clock,
  CheckCircle2,
  Package,
  Bike,
  Store,
  MapPin,
  Phone,
  MessageCircle,
  ShoppingBag,
  ExternalLink,
  Star,
  Printer,
  X,
  Check,
  Building
} from 'lucide-react';

export const MyOrdersView: React.FC = () => {
  const { orders, businesses, openWhatsAppWithPrompt, setActiveClientTab, rateOrder } = useApp();

  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const getStatusStepInfo = (status: OrderStatus) => {
    switch (status) {
      case 'preparing':
        return { step: 1, label: 'En Preparación 👨‍🍳', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'ready':
        return { step: 2, label: 'Listo para Entrega 📦', color: 'text-slate-800 bg-slate-100 border-slate-300' };
      case 'on_the_way':
        return { step: 3, label: 'En Camino 🛵', color: 'text-[#D4021D] bg-red-50 border-red-200' };
      case 'delivered':
        return { step: 4, label: 'Entregado ✓', color: 'text-slate-900 bg-slate-100 border-slate-300' };
      default:
        return { step: 0, label: 'Cancelado', color: 'text-red-700 bg-red-50 border-red-200' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-6 py-4 space-y-4 pb-24 md:pb-12 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900">Historial de Pedidos</h2>
          <p className="text-xs text-slate-500">Rastreo en tiempo real y detalles de tus compras</p>
        </div>
        <button
          onClick={() => setActiveClientTab('explore')}
          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#D4021D] border border-red-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          + Nuevo Pedido
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-3">
          <div className="text-5xl">🛍️</div>
          <h3 className="font-bold text-slate-900 text-base">Aún no tienes pedidos registrados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explora las farmacias y restaurantes en el mapa para realizar tu primer pedido con entrega inmediata o recojo en sucursal.
          </p>
          <button
            onClick={() => setActiveClientTab('explore')}
            className="mt-2 px-5 py-2 bg-[#D4021D] hover:bg-[#b50218] text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
          >
            Explorar en el Mapa
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusStepInfo(order.status);
            const biz = businesses.find((b) => b.id === order.businessId);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 p-4 md:p-5 shadow-xs space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
                      {order.businessLogo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#D4021D]">
                          #{order.id}
                        </span>
                        <span className="text-slate-500 text-xs">· {order.createdAt}</span>
                        {order.orderChannel && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            order.orderChannel === 'whatsapp'
                              ? 'bg-slate-100 text-slate-800 border border-slate-300'
                              : 'bg-red-50 text-[#D4021D] border border-red-200'
                          }`}>
                            {order.orderChannel === 'whatsapp' ? '💬 Vía WhatsApp' : '📱 Vía App'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm md:text-base">
                        {order.businessName}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full border text-xs font-bold ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {/* Progress Steps Timeline */}
                <div className="py-2">
                  <div className="grid grid-cols-4 gap-1 relative">
                    {[
                      { step: 1, title: 'Preparando' },
                      { step: 2, title: 'Listo' },
                      { step: 3, title: 'En Camino' },
                      { step: 4, title: 'Entregado' }
                    ].map((s) => {
                      const isPassed = statusInfo.step >= s.step;
                      return (
                        <div key={s.step} className="flex flex-col items-center text-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                              isPassed
                                ? 'bg-[#D4021D] text-white shadow-md shadow-[#D4021D]/30'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {isPassed ? '✓' : s.step}
                          </div>
                          <span
                            className={`text-[10px] font-semibold ${
                              isPassed ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {s.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items and Details */}
                <div className="bg-slate-50 rounded-2xl p-3 space-y-2 border border-slate-200 text-xs">
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-700">
                        <span>
                          <span className="text-[#D4021D] font-bold mr-1.5">{item.quantity}x</span>
                          {item.product.name}
                        </span>
                        <span className="font-semibold text-slate-900">
                          Bs. {item.product.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-600">
                    <span>
                      Modalidad: <strong className="text-slate-900 capitalize">{order.deliveryType === 'delivery' ? '🛵 A Domicilio' : '🏬 Recoger en Sucursal'}</strong>
                    </span>
                    <span className="text-sm font-black text-[#D4021D]">
                      Total: Bs. {order.total}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{order.deliveryAddress}</span>
                  </div>

                  {/* Payment reference info */}
                  {order.paymentReference && (
                    <div className="flex justify-between items-center bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-[11px] font-mono text-amber-950">
                      <span>Ref. de Pago Móvil/Transferencia:</span>
                      <strong>{order.paymentReference}</strong>
                    </div>
                  )}

                  {/* Live Driver Tracking Card */}
                  {order.status === 'on_the_way' && order.driverName && (
                    <div className="p-3 bg-gradient-to-r from-red-50 via-orange-50 to-emerald-50 rounded-2xl border border-red-200 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#D4021D] text-white flex items-center justify-center font-bold">
                            <Bike className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-slate-900 text-xs">
                                Repartidor Asignado: {order.driverName}
                              </p>
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                {order.driverStep === 'heading_to_store'
                                  ? '🏪 Hacia la tienda'
                                  : order.driverStep === 'picked_up'
                                  ? '📦 Pedido en mano'
                                  : order.driverStep === 'heading_to_client'
                                  ? '🛵 En camino a tu puerta'
                                  : 'En ruta'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">
                              Moto: {order.driverVehicle || 'Motocicleta'}
                            </p>
                          </div>
                        </div>

                        {order.driverPhone && (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${order.driverPhone}`}
                              className="px-2.5 py-1.5 bg-white border border-red-300 text-[#D4021D] font-bold text-[11px] rounded-xl hover:bg-red-50 transition-all flex items-center gap-1 shadow-2xs"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Llamar</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => openWhatsAppWithPrompt(order.driverPhone!, `¡Hola ${order.driverName}! Te escribo sobre mi pedido #${order.id} en ConForce.`)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Customer Review Display */}
                  {order.review && (
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-900">
                      <div className="flex items-center gap-1 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Tu Calificación: {order.review.rating} de 5 estrellas</span>
                      </div>
                      {order.review.comment && (
                        <p className="text-[11px] text-slate-600 italic">"{order.review.comment}"</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Direct Action Contact & Rating */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    Pago: <span className="text-slate-900 font-semibold capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Botón Ver / Imprimir Recibo */}
                    <button
                      type="button"
                      onClick={() => setReceiptOrder(order)}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-300 transition-all cursor-pointer shadow-2xs"
                      title="Ver o imprimir recibo de compra"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Recibo</span>
                    </button>

                    {/* Botón Calificar si ya fue entregado y no tiene review */}
                    {order.status === 'delivered' && !order.review && (
                      <button
                        type="button"
                        onClick={() => {
                          setRatingOrder(order);
                          setSelectedStars(5);
                          setRatingComment('');
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Calificar</span>
                      </button>
                    )}

                    {biz && (
                      <button
                        onClick={() => openWhatsAppWithPrompt(`Hola, consulto por mi pedido #${order.id}`, biz.id)}
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#D4021D]" />
                        <span>WhatsApp Tienda</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Calificar Pedido y Comercio */}
      {ratingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-black text-slate-900 text-sm">Calificar Pedido #{ratingOrder.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setRatingOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs text-slate-600">¿Cómo fue tu experiencia con <strong>{ratingOrder.businessName}</strong>?</p>
              {/* Star selector */}
              <div className="flex items-center justify-center gap-2 py-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStars(s)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        selectedStars >= s
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold text-amber-800">
                {selectedStars === 5
                  ? '⭐ ¡Excelente servicio!'
                  : selectedStars === 4
                  ? '⭐ Muy bueno'
                  : selectedStars === 3
                  ? '⭐ Aceptable'
                  : selectedStars === 2
                  ? '⭐ Regular'
                  : '⭐ Malo'}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase">Comentario o Reseña (opcional)</label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Escribe tu opinión sobre los productos, rapidez o entrega..."
                rows={3}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 resize-none focus:outline-none focus:border-[#D4021D]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRatingOrder(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  rateOrder(ratingOrder.id, selectedStars, ratingComment);
                  setRatingOrder(null);
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Publicar Calificación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Recibo / Factura de Compra para el Cliente */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-[#D4021D]" />
                Comprobante Digital de Compra
              </span>
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-[11px] text-slate-800 space-y-2">
              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <h4 className="font-black text-xs text-slate-900">{receiptOrder.businessName}</h4>
                <p className="text-[10px] text-slate-500">CON FORCE MARKETPLACE VENEZUELA</p>
                <p className="text-[10px] font-bold text-[#D4021D]">ORDEN #{receiptOrder.id}</p>
                <p className="text-[9px] text-slate-400">{receiptOrder.createdAt}</p>
              </div>

              <div className="space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <p><strong>Comprador:</strong> {receiptOrder.customerName}</p>
                <p><strong>Teléfono:</strong> {receiptOrder.customerPhone}</p>
                <p><strong>Dirección:</strong> {receiptOrder.deliveryAddress}</p>
              </div>

              <div className="space-y-1 border-b border-dashed border-slate-300 pb-2">
                {receiptOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.quantity}x {it.product.name}</span>
                    <span>Bs. {it.product.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 text-right pt-1">
                <p>Subtotal: Bs. {receiptOrder.subtotal}</p>
                <p>Envío: Bs. {receiptOrder.deliveryFee}</p>
                <p className="text-xs font-black text-slate-900 pt-1 border-t border-slate-300 flex justify-between">
                  <span>TOTAL PAGADO:</span>
                  <span>Bs. {receiptOrder.total}</span>
                </p>
                <p className="text-[10px] text-left pt-1">
                  <strong>Forma de pago:</strong> {receiptOrder.paymentMethod.replace('_', ' ').toUpperCase()}
                  {receiptOrder.paymentReference && ` (Ref: ${receiptOrder.paymentReference})`}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-[#D4021D] hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

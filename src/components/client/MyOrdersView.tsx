import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Bike,
  MapPin,
  MessageCircle,
  Star,
  Printer,
  X,
  RotateCcw,
  ShieldCheck,
  HeadphonesIcon
} from 'lucide-react';

export const MyOrdersView: React.FC = () => {
  const {
    orders,
    businesses,
    openWhatsAppWithPrompt,
    setActiveClientTab,
    rateOrder,
    reorderItems,
    createSupportTicket,
    currentUser,
    formatCurrency
  } = useApp();

  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [driverStars, setDriverStars] = useState<number>(5);
  const [driverComment, setDriverComment] = useState<string>('');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [supportOrder, setSupportOrder] = useState<Order | null>(null);
  const [supportSubject, setSupportSubject] = useState<string>('Consulta sobre entrega');
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3200);
  };

  const getStatusStepInfo = (status: OrderStatus) => {
    switch (status) {
      case 'pending_confirmation':
        return { step: 1, label: 'Pendiente Confirmación ⏳', color: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'preparing':
        return { step: 2, label: 'En Preparación 👨‍🍳', color: 'text-orange-800 bg-orange-50 border-orange-200' };
      case 'ready':
        return { step: 3, label: 'Listo / Asignando Moto 📦', color: 'text-slate-800 bg-slate-100 border-slate-300' };
      case 'on_the_way':
        return { step: 4, label: 'En Camino 🛵', color: 'text-[#D4021D] bg-red-50 border-red-200' };
      case 'delivered':
        return { step: 5, label: 'Entregado ✓', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      default:
        return { step: 0, label: 'Cancelado', color: 'text-red-700 bg-red-50 border-red-200' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-6 py-4 space-y-4 pb-24 md:pb-12 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900">Historial de Pedidos</h2>
          <p className="text-xs text-slate-500">Rastreo en 6 fases, PIN de entrega y detalles de tus compras</p>
        </div>
        <button
          onClick={() => setActiveClientTab('explore')}
          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#D4021D] border border-red-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          + Nuevo Pedido
        </button>
      </div>

      {feedbackToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900">
          {feedbackToast}
        </div>
      )}

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
            const isActiveOrder = order.status !== 'delivered' && order.status !== 'cancelled';

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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#D4021D]">
                          #{order.id}
                        </span>
                        <span className="text-slate-500 text-xs">· {order.createdAt}</span>
                        {order.prepTimeMinutes && order.status === 'preparing' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200">
                            ⏱️ Prep: ~{order.prepTimeMinutes} min
                          </span>
                        )}
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

                {/* Progress Steps Timeline (5-stage visual bar) */}
                {order.status !== 'cancelled' && (
                  <div className="py-1">
                    <div className="grid grid-cols-5 gap-1 relative">
                      {[
                        { step: 1, title: 'Confirmar' },
                        { step: 2, title: 'Preparando' },
                        { step: 3, title: 'Listo' },
                        { step: 4, title: 'En Camino' },
                        { step: 5, title: 'Entregado' }
                      ].map((s) => {
                        const isPassed = statusInfo.step >= s.step;
                        return (
                          <div key={s.step} className="flex flex-col items-center text-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 transition-all ${
                                isPassed
                                  ? 'bg-[#D4021D] text-white shadow-sm shadow-[#D4021D]/30'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200'
                              }`}
                            >
                              {isPassed ? '✓' : s.step}
                            </div>
                            <span
                              className={`text-[10px] font-semibold leading-tight ${
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
                )}

                {/* Security Delivery PIN Banner */}
                {isActiveOrder && order.deliveryType === 'delivery' && order.deliveryPin && (
                  <div className="p-2.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Dicta este <strong>PIN de Seguridad</strong> al repartidor al recibir:</span>
                    </div>
                    <span className="font-mono text-base font-black tracking-widest bg-white/15 px-3 py-0.5 rounded-xl text-amber-300">
                      {order.deliveryPin}
                    </span>
                  </div>
                )}

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
                          {formatCurrency((item.itemTotalBs ?? item.product.price) * item.quantity).formatted}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-600">
                    <span>
                      Modalidad: <strong className="text-slate-900 capitalize">{order.deliveryType === 'delivery' ? '🛵 A Domicilio' : '🏬 Recoger en Sucursal'}</strong>
                    </span>
                    <span className="text-sm font-black text-[#D4021D]">
                      Total: {formatCurrency(order.total).formatted}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{order.deliveryAddress}</span>
                  </div>

                  {order.paymentReference && (
                    <div className="flex justify-between items-center bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-[11px] font-mono text-amber-950">
                      <span>Ref. de Pago Móvil/Transferencia:</span>
                      <strong>{order.paymentReference}</strong>
                    </div>
                  )}

                  {order.refundAmount && order.refundAmount > 0 && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 font-semibold">
                      💳 Reembolso emitido: {formatCurrency(order.refundAmount).formatted}
                      {order.refundReason ? ` · ${order.refundReason}` : ''}
                    </div>
                  )}

                  {order.cancellationReason && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-800 font-semibold">
                      ✕ Motivo de cancelación: {order.cancellationReason}
                    </div>
                  )}

                  {/* Live Driver Tracking Card with Masked Chat */}
                  {order.status === 'on_the_way' && order.driverName && (
                    <div className="p-3 bg-gradient-to-r from-red-50 via-orange-50 to-emerald-50 rounded-2xl border border-red-200 space-y-2">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#D4021D] text-white flex items-center justify-center font-bold">
                            <Bike className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-extrabold text-slate-900 text-xs">
                                Repartidor: {order.driverName}
                              </p>
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                {order.driverStep === 'heading_to_store'
                                  ? '🏪 Hacia la tienda'
                                  : order.driverStep === 'picked_up'
                                  ? '📦 Pedido en mano'
                                  : order.driverStep === 'heading_to_client'
                                  ? '🛵 En camino a tu puerta'
                                  : order.driverStep === 'arrived_at_client'
                                  ? '📍 ¡Llegó a tu domicilio!'
                                  : 'En ruta'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">
                              Vehículo: {order.driverVehicle || 'Motocicleta'} · Número protegido por privacidad
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSupportOrder(order);
                            setSupportSubject(`Mensaje enmascarado al repartidor (${order.driverName})`);
                            setSupportMessage('');
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Chat Enmascarado</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Customer Review Display */}
                  {order.review && (
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-900">
                      <div className="flex items-center gap-3 flex-wrap font-bold">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          Comercio: {order.review.rating}/5
                        </span>
                        {order.review.driverRating && (
                          <span className="flex items-center gap-1">
                            🛵 Repartidor: {order.review.driverRating}/5
                          </span>
                        )}
                      </div>
                      {order.review.comment && (
                        <p className="text-[11px] text-slate-600 italic">"{order.review.comment}"</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Direct Action Contact, Reorder, Support & Rating */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    Pago: <span className="text-slate-900 font-semibold capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const res = reorderItems(order.id);
                        notify(res.message);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#D4021D] bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-xl border border-red-200 transition-all cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Volver a pedir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSupportOrder(order);
                        setSupportSubject(`Ayuda con Pedido #${order.id}`);
                        setSupportMessage('');
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-300 transition-all cursor-pointer shadow-2xs"
                    >
                      <HeadphonesIcon className="w-3.5 h-3.5" />
                      <span>Soporte</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReceiptOrder(order)}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-300 transition-all cursor-pointer shadow-2xs"
                      title="Ver o imprimir recibo de compra"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Recibo</span>
                    </button>

                    {order.status === 'delivered' && !order.review && (
                      <button
                        type="button"
                        onClick={() => {
                          setRatingOrder(order);
                          setSelectedStars(5);
                          setRatingComment('');
                          setDriverStars(5);
                          setDriverComment('');
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Calificar</span>
                      </button>
                    )}

                    {biz && (
                      <button
                        onClick={() => openWhatsAppWithPrompt(`¡Hola ${biz.name}! Consulto sobre el estatus de mi pedido #${order.id}`, biz.id)}
                        className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
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

      {/* MODAL: Dual Rating (Comercio + Repartidor) */}
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
              <div className="flex items-center justify-center gap-2 py-2">
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
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase">Reseña al Comercio (opcional)</label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Calidad de la comida, empaque y tiempo..."
                rows={2}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 resize-none focus:outline-none focus:border-[#D4021D]"
              />
            </div>

            {ratingOrder.driverName && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <p className="text-xs text-slate-700 font-bold text-center">
                  🛵 Califica a tu repartidor: {ratingOrder.driverName}
                </p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDriverStars(s)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          driverStars >= s
                            ? 'fill-emerald-500 text-emerald-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={driverComment}
                  onChange={(e) => setDriverComment(e.target.value)}
                  placeholder="Comentario al repartidor (opcional)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#D4021D]"
                />
              </div>
            )}

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
                  rateOrder(
                    ratingOrder.id,
                    selectedStars,
                    ratingComment,
                    ratingOrder.driverName ? driverStars : undefined,
                    ratingOrder.driverName ? driverComment : undefined
                  );
                  setRatingOrder(null);
                  notify('¡Gracias por tu calificación!');
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Publicar Calificación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Chat Enmascarado / Ticket de Soporte */}
      {supportOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Centro de Mensajes y Soporte</h3>
              <button type="button" onClick={() => setSupportOrder(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600">
              Tu número real está protegido. Envía indicaciones al repartidor o reporta un inconveniente al equipo de soporte.
            </p>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-600">Asunto</label>
              <input
                type="text"
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-600">Mensaje</label>
              <textarea
                rows={3}
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Ej: Estoy en la puerta azul / Falta un producto..."
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSupportOrder(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!supportMessage.trim()) return;
                  createSupportTicket({
                    orderId: supportOrder.id,
                    requesterName: currentUser?.name || supportOrder.customerName,
                    requesterRole: 'client',
                    subject: supportSubject,
                    message: supportMessage.trim()
                  });
                  setSupportOrder(null);
                  notify('✓ Mensaje / Ticket enviado con éxito. Soporte responderá pronto.');
                }}
                className="flex-1 py-2 bg-[#D4021D] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Enviar Mensaje
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
                <p className="text-[10px] text-slate-500">CONFORCE MARKETPLACE VENEZUELA</p>
                <p className="text-[10px] font-bold text-[#D4021D]">ORDEN #{receiptOrder.id}</p>
                <p className="text-[9px] text-slate-400">{receiptOrder.createdAt}</p>
              </div>

              <div className="space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <p><strong>Comprador:</strong> {receiptOrder.customerName}</p>
                <p><strong>Dirección:</strong> {receiptOrder.deliveryAddress}</p>
              </div>

              <div className="space-y-1 border-b border-dashed border-slate-300 pb-2">
                {receiptOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.quantity}x {it.product.name}</span>
                    <span>Bs. {(it.itemTotalBs ?? it.product.price) * it.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 text-right pt-1">
                <p>Subtotal: Bs. {receiptOrder.subtotal}</p>
                <p>Envío: Bs. {receiptOrder.deliveryFee}</p>
                {receiptOrder.discountAmount && <p>Descuento: -Bs. {receiptOrder.discountAmount}</p>}
                {receiptOrder.driverTip && <p>Propina: Bs. {receiptOrder.driverTip}</p>}
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

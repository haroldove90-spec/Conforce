import React, { useState } from 'react';
import { Business, Product, Order, DriverProfile, PaymentMethod, CartItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatVenezuelanWhatsAppNumber } from '../../utils/urlUtils';
import { resolveProductImage, buildSafeProductPlaceholder } from '../../utils/imageUtils';
import {
  Bike,
  CheckCircle2,
  MapPin,
  Phone,
  Plus,
  Minus,
  Package,
  MessageCircle,
  UserCheck,
  Navigation,
  Clock3,
  AlertCircle,
  Send
} from 'lucide-react';

interface SellerDispatchTabProps {
  biz: Business;
  bizProducts: Product[];
  sellerOrders: Order[];
  onOpenNewProduct: () => void;
}

export const SellerDispatchTab: React.FC<SellerDispatchTabProps> = ({
  biz,
  bizProducts,
  sellerOrders,
  onOpenNewProduct
}) => {
  const {
    drivers,
    createOrder,
    assignOrderDriver,
    formatCurrency
  } = useApp();

  const [dispatchMode, setDispatchMode] = useState<'new_products' | 'existing_order'>('new_products');
  const [selectedExistingOrderId, setSelectedExistingOrderId] = useState<string>('');
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryFeeBs, setDeliveryFeeBs] = useState<number>(45);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pago_movil');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const pendingAssignableOrders = sellerOrders.filter(
    (o) => (o.status === 'preparing' || o.status === 'ready') && !o.driverId
  );

  const activeInRouteOrders = sellerOrders.filter((o) => o.status === 'on_the_way');

  const activeDrivers = drivers.filter((d) => d.status === 'active');
  const sortedDrivers = [...activeDrivers].sort((a, b) => {
    if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
    return b.rating - a.rating;
  });

  const selectedDriver: DriverProfile | undefined = sortedDrivers.find((d) => d.id === selectedDriverId);

  const selectedProductEntries = bizProducts
    .map((prod) => ({
      product: prod,
      quantity: selectedQuantities[prod.id] || 0
    }))
    .filter((entry) => entry.quantity > 0);

  const manualSubtotal = selectedProductEntries.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const manualTotal = manualSubtotal + (Number(deliveryFeeBs) || 0);

  const adjustProductQty = (productId: string, delta: number) => {
    setSelectedQuantities((prev) => {
      const next = Math.max(0, (prev[productId] || 0) + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleAssignToCourier = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedDriver) {
      setFeedback({ type: 'error', text: 'Selecciona un mensajero en moto de la lista para asignarle el despacho.' });
      return;
    }

    if (dispatchMode === 'existing_order') {
      const targetOrder = pendingAssignableOrders.find((o) => o.id === selectedExistingOrderId);
      if (!targetOrder) {
        setFeedback({ type: 'error', text: 'Selecciona un pedido pendiente válido para asignar.' });
        return;
      }

      assignOrderDriver(targetOrder.id, {
        id: selectedDriver.id,
        name: selectedDriver.fullName,
        phone: selectedDriver.phone,
        vehicle: `${selectedDriver.motorcycleBrandModel} - Placa ${selectedDriver.plateNumber}`
      });

      setSelectedExistingOrderId('');
      setFeedback({
        type: 'success',
        text: `✓ Pedido #${targetOrder.id} asignado a ${selectedDriver.fullName}. Ya aparece en el panel del Mensajero.`
      });
      return;
    }

    // New dispatch from selected products (e.g. WhatsApp or store walk-in order)
    if (selectedProductEntries.length === 0) {
      setFeedback({
        type: 'error',
        text: 'Selecciona al menos 1 producto de tu catálogo para asignar al mensajero.'
      });
      return;
    }
    if (!customerName.trim() || !deliveryAddress.trim()) {
      setFeedback({
        type: 'error',
        text: 'Ingresa el nombre del cliente y la dirección de entrega.'
      });
      return;
    }

    const items: CartItem[] = selectedProductEntries.map((entry) => ({
      product: entry.product,
      quantity: entry.quantity,
      businessId: biz.id,
      itemTotalBs: entry.product.price
    }));

    const created = createOrder(
      {
        businessId: biz.id,
        businessName: biz.name,
        businessLogo: biz.logo,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || '+58 412 0000000',
        items,
        subtotal: manualSubtotal,
        deliveryFee: Number(deliveryFeeBs) || 0,
        serviceFee: 0,
        serviceFeeRate: 0,
        total: manualTotal,
        deliveryType: 'delivery',
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod,
        orderChannel: 'whatsapp',
        status: 'on_the_way',
        notes: dispatchNotes.trim() || 'Despacho asignado directamente por el comercio'
      },
      { preserveCart: true }
    );

    assignOrderDriver(created.id, {
      id: selectedDriver.id,
      name: selectedDriver.fullName,
      phone: selectedDriver.phone,
      vehicle: `${selectedDriver.motorcycleBrandModel} - Placa ${selectedDriver.plateNumber}`
    });

    setSelectedQuantities({});
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setDispatchNotes('');
    setFeedback({
      type: 'success',
      text: `✓ Despacho #${created.id} creado con ${items.length} producto(s) y asignado a ${selectedDriver.fullName}.`
    });
  };

  const getDriverStepText = (step?: Order['driverStep']) => {
    switch (step) {
      case 'heading_to_store':
        return 'En camino a recoger en tienda';
      case 'picked_up':
        return 'Productos retirados en maleta';
      case 'heading_to_client':
        return 'En ruta al domicilio del cliente';
      case 'delivered':
        return 'Entregado';
      default:
        return 'Asignado al mensajero';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg">
              Mensajeros y Asignación de Despachos
            </h3>
            <p className="text-xs text-zinc-400">
              Asigna productos de tu catálogo o pedidos pendientes directamente a los motorizados disponibles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
            {sortedDrivers.filter((d) => d.isAvailable).length} En Línea ahora
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
            {activeInRouteOrders.length} En Ruta
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Assignment Form */}
        <form
          onSubmit={handleAssignToCourier}
          className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-xs"
        >
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setDispatchMode('new_products')}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                dispatchMode === 'new_products'
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Asignar Productos (Nuevo Despacho)</span>
            </button>
            <button
              type="button"
              onClick={() => setDispatchMode('existing_order')}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                dispatchMode === 'existing_order'
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock3 className="w-3.5 h-3.5" />
              <span>Asignar Pedido Pendiente ({pendingAssignableOrders.length})</span>
            </button>
          </div>

          {dispatchMode === 'new_products' ? (
            <div className="space-y-4">
              {/* Step 1: Select Products */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-black uppercase text-slate-700">
                    1. Selecciona los Productos a Despachar
                  </label>
                  <span className="text-[11px] font-bold text-[#D4021D]">
                    {selectedProductEntries.length} seleccionado(s)
                  </span>
                </div>

                {bizProducts.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                    <p className="text-xs text-slate-600 font-medium">
                      Primero da de alta productos en tu catálogo para poder asignarlos a un mensajero.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenNewProduct}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#D4021D] text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nuevo Producto</span>
                    </button>
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {bizProducts.map((prod) => {
                      const qty = selectedQuantities[prod.id] || 0;
                      return (
                        <div
                          key={prod.id}
                          className={`flex items-center justify-between gap-2 p-2 rounded-2xl border transition-all ${
                            qty > 0
                              ? 'bg-red-50/60 border-red-300'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={resolveProductImage(prod.image, prod.images, prod.name)}
                              alt={prod.name}
                              onError={(e) => {
                                e.currentTarget.src = buildSafeProductPlaceholder(prod.name);
                              }}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 bg-white border border-slate-200"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-slate-900 truncate">{prod.name}</p>
                              <p className="text-[11px] text-[#D4021D] font-extrabold tabular-nums">
                                {formatCurrency(prod.price).formatted}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => adjustProductQty(prod.id, -1)}
                              disabled={qty === 0}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-black text-slate-900 tabular-nums">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => adjustProductQty(prod.id, 1)}
                              className="w-7 h-7 rounded-lg bg-[#D4021D] text-white flex items-center justify-center hover:bg-red-700 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 2: Client Delivery Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej: María Pérez (Pedido WhatsApp)"
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#D4021D]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600">
                    Teléfono / WhatsApp del Cliente
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+58 412 1234567"
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#D4021D]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-600">
                    Dirección Exacta de Entrega *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Urbanización, calle, edificio o punto de referencia"
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#D4021D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600">
                    Tarifa del Mensajero (Bs.)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={deliveryFeeBs}
                    onChange={(e) => setDeliveryFeeBs(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-[#D4021D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600">
                    Método de Cobro
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-[#D4021D]"
                  >
                    <option value="pago_movil">📲 Pago Móvil</option>
                    <option value="cash_on_delivery">💵 Efectivo contra entrega</option>
                    <option value="bank_transfer">🏦 Transferencia</option>
                    <option value="pos_terminal">📟 Punto de Venta</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-600">
                    Instrucciones para el Mensajero (Opcional)
                  </label>
                  <input
                    type="text"
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    placeholder="Ej: Ya pagado por Pago Móvil, solo entregar / Cobrar en destino"
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#D4021D]"
                  />
                </div>
              </div>

              {selectedProductEntries.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">
                    Total del Despacho (Productos + Envío):
                  </span>
                  <span className="font-black text-sm text-[#D4021D] tabular-nums">
                    {formatCurrency(manualTotal).formatted}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-slate-700 block">
                1. Elige un Pedido Pendiente sin Mensajero
              </label>

              {pendingAssignableOrders.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                  <Clock3 className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">
                    No hay pedidos pendientes esperando mensajero
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Puedes usar la pestaña &quot;Asignar Productos (Nuevo Despacho)&quot; para enviar un pedido de WhatsApp o de tienda.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {pendingAssignableOrders.map((ord) => (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => setSelectedExistingOrderId(ord.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        selectedExistingOrderId === ord.id
                          ? 'bg-red-50 border-[#D4021D] ring-1 ring-[#D4021D]'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-[#D4021D]">#{ord.id}</span>
                        <span className="text-xs font-black text-slate-900 tabular-nums">
                          {formatCurrency(ord.total).formatted}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-1">
                        {ord.customerName} · {ord.customerPhone}
                      </p>
                      <p className="text-[11px] text-slate-600 truncate">📍 {ord.deliveryAddress}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {ord.items.map((i) => `${i.quantity}x ${i.product.name}`).join(', ')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Pick Courier */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="text-[11px] font-black uppercase text-slate-700 block">
              2. Selecciona el Mensajero en Moto *
            </label>

            {sortedDrivers.length === 0 ? (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                No hay mensajeros activos registrados aún en la flota.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sortedDrivers.map((drv) => {
                  const isSelected = selectedDriverId === drv.id;
                  return (
                    <button
                      key={drv.id}
                      type="button"
                      onClick={() => setSelectedDriverId(drv.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          🛵 {drv.fullName}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                            drv.isAvailable
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {drv.isAvailable ? 'En Línea' : 'Offline'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 truncate mt-0.5">
                        {drv.motorcycleBrandModel} · Placa {drv.plateNumber}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        📍 {drv.city || 'Venezuela'} · ⭐ {drv.rating.toFixed(1)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#D4021D] hover:bg-red-700 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Send className="w-4 h-4" />
            <span>
              {dispatchMode === 'new_products'
                ? 'Crear Despacho y Asignar al Mensajero'
                : 'Asignar Pedido al Mensajero'}
            </span>
          </button>
        </form>

        {/* RIGHT COLUMN: Active Couriers + Active Deliveries */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active In-Route Deliveries */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-[#D4021D]" />
                <span>Despachos en Ruta ({activeInRouteOrders.length})</span>
              </h4>
            </div>

            {activeInRouteOrders.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 rounded-2xl p-4 text-center border border-slate-200">
                No tienes despachos en camino en este momento.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {activeInRouteOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[#D4021D]">#{ord.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {getDriverStepText(ord.driverStep)}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900">
                      🛵 {ord.driverName || 'Mensajero asignado'}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      👤 Cliente: {ord.customerName} · 📍 {ord.deliveryAddress}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-extrabold text-slate-900 tabular-nums">
                        {formatCurrency(ord.total).formatted}
                      </span>
                      {ord.driverPhone && (
                        <a
                          href={`https://wa.me/${formatVenezuelanWhatsAppNumber(ord.driverPhone)}?text=${encodeURIComponent(
                            `Hola ${ord.driverName}, consulta sobre el despacho #${ord.id} de ${biz.name}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold"
                        >
                          <MessageCircle className="w-3 h-3" /> WhatsApp Moto
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Courier Fleet Directory */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Flota de Mensajeros ({drivers.length})</span>
            </h4>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {drivers.map((drv) => (
                <div
                  key={drv.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 truncate">{drv.fullName}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          drv.status !== 'active'
                            ? 'bg-amber-100 text-amber-800'
                            : drv.isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {drv.status !== 'active'
                          ? 'Por aprobar'
                          : drv.isAvailable
                          ? 'En Línea'
                          : 'Desconectado'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">
                      {drv.motorcycleBrandModel} · {drv.plateNumber}
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-[#D4021D]" /> {drv.city || 'Venezuela'}
                      </span>
                      <span>· {drv.totalDeliveries} entregas</span>
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/${formatVenezuelanWhatsAppNumber(drv.phone)}?text=${encodeURIComponent(
                      `Hola ${drv.fullName}, te contactamos desde *${biz.name}* para coordinar una entrega.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition-all shrink-0"
                    title="Contactar mensajero por WhatsApp"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

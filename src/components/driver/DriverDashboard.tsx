import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DriverStep, DriverVehicleType } from '../../types';
import {
  Bike,
  CheckCircle2,
  Navigation as NavIcon,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  Store,
  User,
  ExternalLink,
  ShieldCheck,
  Package,
  Power,
  Camera,
  Trash2,
  Eye,
  FileCheck2,
  X,
  Lock,
  LifeBuoy,
  Sparkles,
  Wallet
} from 'lucide-react';
import { compressAndEncodeImage } from '../../utils/imageUtils';

export const DriverDashboard: React.FC = () => {
  const {
    currentDriverProfile,
    drivers,
    orders,
    businesses,
    payoutRequests,
    toggleDriverAvailability,
    acceptOrderAsDriver,
    advanceDriverDeliveryStep,
    requestDriverPayout,
    createSupportTicket,
    calculateDistance,
    formatCurrency,
    openDriverRegistration,
    updateDriverProfile
  } = useApp();

  const [activeTab, setActiveTab] = useState<'deliveries' | 'history' | 'wallet' | 'profile'>('deliveries');
  const [slideProgress, setSlideProgress] = useState(0);
  const [stepToast, setStepToast] = useState<{ ok: boolean; msg: string } | null>(null);

  // Delivery Verification Modal (PIN or Contactless Photo)
  const [deliveryModalOrderId, setDeliveryModalOrderId] = useState<string | null>(null);
  const [deliveryPinInput, setDeliveryPinInput] = useState('');
  const [deliveryProofPhoto, setDeliveryProofPhoto] = useState<string | undefined>(undefined);
  const [deliveryValidationError, setDeliveryValidationError] = useState<string | null>(null);

  // Wallet Payout state
  const [withdrawAmountInput, setWithdrawAmountInput] = useState('');
  const [payoutFeedback, setPayoutFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Support ticket quick modal
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');

  const [previewPhoto, setPreviewPhoto] = useState<{ title: string; url: string } | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const driver = currentDriverProfile || drivers[0];

  // Active delivery assigned to this driver
  const activeOrder = orders.find(
    (o) => o.driverId === driver?.id && (o.status === 'on_the_way' || o.status === 'ready' || o.status === 'preparing')
  );

  // Available orders pool looking for courier
  const availableOrders = orders.filter(
    (o) =>
      o.deliveryType === 'delivery' &&
      (o.status === 'ready' || o.status === 'preparing') &&
      !o.driverId
  );

  // Completed orders delivered by this driver
  const completedOrders = orders.filter(
    (o) => o.driverId === driver?.id && o.status === 'delivered'
  );

  const driverPayoutHistory = payoutRequests.filter((p) => p.driverId === driver?.id);

  const tipsTotal = driver?.tipsBalance || 0;
  const bonusTotal = driver?.bonusBalance || 0;
  const codDebt = driver?.cashCollectedDebt || 0;
  const netWithdrawableBs = Math.max(0, (driver?.earningsBalance || 0) + tipsTotal + bonusTotal - codDebt);

  const getStepProgress = (step?: DriverStep) => {
    switch (step) {
      case 'heading_to_store':
      case 'assigned':
        return { percent: 25, label: '1. En camino al restaurante / comercio', stepNum: 1, nextLabel: 'Desliza al llegar y recoger el pedido' };
      case 'picked_up':
        return { percent: 50, label: '2. Pedido recogido en maleta', stepNum: 2, nextLabel: 'Desliza para iniciar ruta al cliente' };
      case 'heading_to_client':
        return { percent: 75, label: '3. En ruta al domicilio del cliente', stepNum: 3, nextLabel: 'Desliza al llegar al punto de entrega' };
      case 'arrived_at_client':
        return { percent: 90, label: '4. En la puerta del domicilio', stepNum: 4, nextLabel: 'Desliza para validar PIN / Foto y Entregar' };
      case 'delivered':
        return { percent: 100, label: '5. Entregado con éxito', stepNum: 5, nextLabel: 'Completado' };
      default:
        return { percent: 20, label: '1. Carrera asignada', stepNum: 1, nextLabel: 'Desliza al recoger el pedido' };
    }
  };

  const triggerStepProgression = (orderId: string, currentStep?: DriverStep) => {
    setSlideProgress(0);
    if (!currentStep || currentStep === 'assigned' || currentStep === 'heading_to_store') {
      const res = advanceDriverDeliveryStep(orderId, 'picked_up');
      if (res.message) setStepToast({ ok: res.success, msg: res.message });
    } else if (currentStep === 'picked_up') {
      const res = advanceDriverDeliveryStep(orderId, 'heading_to_client');
      if (res.message) setStepToast({ ok: res.success, msg: res.message });
    } else if (currentStep === 'heading_to_client') {
      const res = advanceDriverDeliveryStep(orderId, 'arrived_at_client');
      if (res.message) setStepToast({ ok: res.success, msg: res.message });
    } else if (currentStep === 'arrived_at_client') {
      setDeliveryPinInput('');
      setDeliveryProofPhoto(undefined);
      setDeliveryValidationError(null);
      setDeliveryModalOrderId(orderId);
    }
    setTimeout(() => setStepToast(null), 4000);
  };

  const handleConfirmDeliveryWithValidation = () => {
    if (!deliveryModalOrderId) return;
    if (!deliveryPinInput.trim() && !deliveryProofPhoto) {
      setDeliveryValidationError('Ingresa el PIN de 4 dígitos del cliente o adjunta una foto de entrega.');
      return;
    }
    const res = advanceDriverDeliveryStep(deliveryModalOrderId, 'delivered', {
      pin: deliveryPinInput.trim() || undefined,
      proofPhoto: deliveryProofPhoto
    });
    if (!res.success) {
      setDeliveryValidationError(res.message || 'PIN de seguridad incorrecto.');
      return;
    }
    setDeliveryModalOrderId(null);
    setStepToast({ ok: true, msg: res.message || '¡Entrega validada y liquidada en tu billetera!' });
    setTimeout(() => setStepToast(null), 5000);
  };

  const vehicleBadgeLabel = (v?: DriverVehicleType) => {
    if (v === 'bicicleta') return '🚲 Bicicleta';
    if (v === 'auto') return '🚗 Auto';
    return '🛵 Moto';
  };

  if (!driver) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center space-y-4">
        <Bike className="w-16 h-16 text-emerald-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No hay perfil de mensajero activo</h2>
        <p className="text-sm text-slate-600">
          Registra tus datos y los de tu motocicleta para comenzar a recibir despachos.
        </p>
        <button
          onClick={openDriverRegistration}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md"
        >
          Registrarme como Mensajero en Moto
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 pb-24 space-y-4">
      
      {/* Top Motorcycle Bar - High Contrast for Handlebar mount */}
      <div className="bg-slate-950 text-white rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-base sm:text-lg text-white">
                  {driver.fullName}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold">
                  ⭐ {driver.rating.toFixed(1)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold">
                  {vehicleBadgeLabel(driver.vehicleType)}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {driver.motorcycleBrandModel} · Placa <strong className="text-white">{driver.plateNumber}</strong>
              </p>
            </div>
          </div>

          {/* Availability Toggle button */}
          <button
            onClick={() => toggleDriverAvailability(driver.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl font-bold text-xs transition-all shadow-md cursor-pointer ${
              driver.isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
            }`}
            title="Cambiar estado de disponibilidad"
          >
            <Power className="w-4 h-4" />
            <span className="hidden sm:inline">
              {driver.isAvailable ? 'En Línea (Disponible)' : 'Desconectado'}
            </span>
            <span className="sm:hidden">
              {driver.isAvailable ? 'En Línea' : 'Offline'}
            </span>
            <span className={`w-2 h-2 rounded-full ${driver.isAvailable ? 'bg-white animate-pulse' : 'bg-zinc-500'}`} />
          </button>
        </div>

        {/* Quick Driver Stats Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
          <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Ganancias en Bs.</span>
            <span className="font-extrabold text-sm sm:text-base text-emerald-400">
              Bs. {driver.earningsBalance.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Entregas Totales</span>
            <span className="font-extrabold text-sm sm:text-base text-white">
              {driver.totalDeliveries}
            </span>
          </div>
          <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Estado Cuenta</span>
            <span className="font-bold text-xs text-emerald-400 capitalize">
              {driver.status === 'active' ? 'Aprobado ✓' : driver.status}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'deliveries'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Despachos ({activeOrder ? 1 : availableOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Historial ({completedOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'wallet'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Billetera Bs.</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Mi Moto</span>
        </button>
      </div>

      {/* TAB 1: DESPACHOS EN VIVO */}
      {activeTab === 'deliveries' && (
        <div className="space-y-4">
          
          {/* Active order running */}
          {activeOrder && (
            <div className="bg-white border-2 border-emerald-500 rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Carrera Activa en Curso · #{activeOrder.id}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs">
                  + Bs. {activeOrder.deliveryFee || 45} de ganancia
                </span>
              </div>

              {stepToast && (
                <div
                  className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                    stepToast.ok
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{stepToast.msg}</span>
                </div>
              )}

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-slate-800">
                  <span>Paso {getStepProgress(activeOrder.driverStep).stepNum} de 5:</span>
                  <span className="text-emerald-700">{getStepProgress(activeOrder.driverStep).label}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${getStepProgress(activeOrder.driverStep).percent}%` }}
                  />
                </div>
              </div>

              {activeOrder.paymentMethod === 'cash_on_delivery' && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                  <span className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    Cobro Contra Entrega (Efectivo):
                  </span>
                  <span className="font-black text-sm">
                    {formatCurrency(activeOrder.total).formatted}
                  </span>
                </div>
              )}

              {/* Origin and Destination Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Store origin */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">1. Retiro en Tienda</span>
                    <span className="text-xs">{activeOrder.businessLogo || '🏬'}</span>
                  </div>
                  <p className="font-extrabold text-sm text-slate-900">{activeOrder.businessName}</p>
                  <p className="text-slate-600 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#D4021D] shrink-0" />
                    <span>Sede comercial asignada</span>
                  </p>
                </div>

                {/* Customer destination */}
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 uppercase text-[10px]">2. Entrega al Cliente</span>
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="font-extrabold text-sm text-slate-900">{activeOrder.customerName}</p>
                  <p className="text-slate-700 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{activeOrder.deliveryAddress}</span>
                  </p>
                  {activeOrder.notes && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                      <strong>Nota:</strong> {activeOrder.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact & Navigation Actions (Anchor links without window.open) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeOrder.deliveryAddress || activeOrder.businessName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                >
                  <NavIcon className="w-4 h-4 text-emerald-400" />
                  <span>Google Maps</span>
                </a>
                <a
                  href={`https://waze.com/ul?q=${encodeURIComponent(activeOrder.deliveryAddress || activeOrder.businessName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Waze</span>
                </a>
                <a
                  href={`tel:${activeOrder.customerPhone}`}
                  className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Llamar (Puente)</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSupportModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-colors cursor-pointer"
                >
                  <LifeBuoy className="w-4 h-4" />
                  <span>Soporte</span>
                </button>
              </div>

              {/* Interactive Slide-to-Confirm Step Control */}
              <div className="pt-2 space-y-2.5">
                <div className="p-3 bg-emerald-950 text-white rounded-2xl border border-emerald-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-300 uppercase text-[10px] tracking-wider">
                      Control Deslizante de Entrega
                    </span>
                    <span>{slideProgress}%</span>
                  </div>
                  <p className="text-xs font-bold text-white">
                    👉 {getStepProgress(activeOrder.driverStep).nextLabel}
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={slideProgress}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSlideProgress(val);
                      if (val >= 90) {
                        triggerStepProgression(activeOrder.id, activeOrder.driverStep);
                      }
                    }}
                    onMouseUp={() => {
                      if (slideProgress < 90) setSlideProgress(0);
                    }}
                    onTouchEnd={() => {
                      if (slideProgress < 90) setSlideProgress(0);
                    }}
                    className="w-full accent-emerald-400 h-3 bg-emerald-900 rounded-lg cursor-grab active:cursor-grabbing"
                  />
                  <div className="flex items-center justify-between text-[10px] text-emerald-300/80">
                    <span>Desliza a la derecha para confirmar →</span>
                    <button
                      type="button"
                      onClick={() => triggerStepProgression(activeOrder.id, activeOrder.driverStep)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      Confirmar Paso
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Available orders board for pickup */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Pedidos Disponibles para Despacho</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {availableOrders.length}
                </span>
              </h2>
            </div>

            {availableOrders.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-2">
                <Bike className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700 text-sm">
                  {driver.isAvailable ? 'No hay despachos pendientes en este momento' : 'Estás en modo Desconectado'}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {driver.isAvailable
                    ? 'Los nuevos pedidos de restaurantes y farmacias aparecerán aquí automáticamente en tiempo real.'
                    : 'Activa tu disponibilidad en la barra superior para recibir avisos de carreras.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableOrders.map((ord) => {
                  const biz = businesses.find((b) => b.id === ord.businessId);
                  const distKm = biz?.coordinates ? calculateDistance(biz.coordinates) : 1.8;
                  const estimatedEarn = (ord.deliveryFee || 45) + (ord.driverTip || 0);
                  return (
                    <div
                      key={ord.id}
                      className="p-4 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl shadow-xs space-y-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                              #{ord.id}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-bold">
                              📍 {distKm.toFixed(1)} km
                            </span>
                            {(ord.driverTip || 0) > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                                🎁 Propina +{formatCurrency(ord.driverTip || 0).formatted}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-sm text-slate-900 mt-1">
                            {ord.businessName}
                          </h3>
                          <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#D4021D] shrink-0" />
                            <span className="truncate">{ord.deliveryAddress}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="block font-extrabold text-sm text-emerald-600">
                            + {formatCurrency(estimatedEarn).formatted}
                          </span>
                          <span className="text-[10px] text-slate-400">Ganancia Est.</span>
                        </div>
                      </div>

                      <div className="p-2 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                        <span>{ord.items.length} prod. ({ord.customerName})</span>
                        <span className="font-semibold text-slate-800">
                          {ord.paymentMethod === 'cash_on_delivery' ? '💵 Efectivo:' : 'Total:'}{' '}
                          {formatCurrency(ord.total).formatted}
                        </span>
                      </div>

                      <button
                        onClick={() => acceptOrderAsDriver(ord.id, driver.id)}
                        disabled={Boolean(activeOrder)}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Bike className="w-4 h-4" />
                        <span>{activeOrder ? 'Ya tienes una carrera en curso' : 'Aceptar Solicitud y Despachar'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: HISTORIAL DE CARRERAS */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">
            Historial de Despachos Realizados ({completedOrders.length})
          </h2>
          {completedOrders.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">
              Aún no tienes despachos completados con este usuario.
            </p>
          ) : (
            <div className="space-y-2">
              {completedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">#{ord.id} · {ord.businessName}</span>
                    <p className="text-slate-500 text-[11px]">
                      Entregado a {ord.customerName} · {ord.deliveryAddress}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-emerald-600 text-sm">
                      + Bs. {ord.deliveryFee || 45}
                    </span>
                    <span className="block text-[10px] text-slate-400">Completado ✓</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BILLETERA, PROPINAS, EFECTIVO COD & RETIROS */}
      {activeTab === 'wallet' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-5">
          <div className="p-6 bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-2xl space-y-4 shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">
                  Saldo Neto Retirable por Pago Móvil
                </span>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                  {formatCurrency(netWithdrawableBs).formatted}
                </div>
              </div>
              <Wallet className="w-7 h-7 text-emerald-400 opacity-80" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-xs">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-400">Por Viajes</span>
                <span className="font-bold text-white">{formatCurrency(driver.earningsBalance).formatted}</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-400">Propinas 100%</span>
                <span className="font-bold text-amber-400">+ {formatCurrency(tipsTotal).formatted}</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-400">Bonos por Meta</span>
                <span className="font-bold text-sky-400">+ {formatCurrency(bonusTotal).formatted}</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-400">Efectivo Cobrado</span>
                <span className="font-bold text-rose-400">- {formatCurrency(codDebt).formatted}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Datos Bancarios para Liquidación (Pago Móvil)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Banco</span>
                <span className="font-semibold text-slate-800">{driver.bankName || 'Banesco (0134)'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Teléfono</span>
                <span className="font-semibold text-slate-800">{driver.bankPhone || driver.phone}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Cédula Titular</span>
                <span className="font-semibold text-slate-800">{driver.bankIdNumber || driver.ciDni}</span>
              </div>
            </div>
          </div>

          {payoutFeedback && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                payoutFeedback.ok
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{payoutFeedback.msg}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              min={1}
              max={netWithdrawableBs}
              placeholder={`Monto en Bs. (máx. ${Math.round(netWithdrawableBs)})`}
              value={withdrawAmountInput}
              onChange={(e) => setWithdrawAmountInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => {
                const amount = Number(withdrawAmountInput) || netWithdrawableBs;
                const res = requestDriverPayout(driver.id, amount);
                setPayoutFeedback({ ok: res.success, msg: res.message });
                if (res.success) setWithdrawAmountInput('');
              }}
              disabled={netWithdrawableBs <= 0}
              className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition-colors cursor-pointer shadow-md"
            >
              Solicitar Retiro Pago Móvil
            </button>
          </div>

          {driverPayoutHistory.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs uppercase">Historial de Retiros</h4>
              <div className="space-y-1.5">
                {driverPayoutHistory.map((pr) => (
                  <div
                    key={pr.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{formatCurrency(pr.amountBs).formatted}</span>
                      <span className="block text-[10px] text-slate-500">
                        {pr.bankName} · {new Date(pr.requestedAt).toLocaleDateString('es-VE')}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pr.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : pr.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {pr.status === 'paid' ? 'Pagado ✓' : pr.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MI MOTO, DOCUMENTOS & PERFIL */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-6 text-xs">
          {/* Driver Header with Avatar */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 border-2 border-emerald-500 shadow-md flex items-center justify-center">
                {driver.avatarUrl ? (
                  <img
                    src={driver.avatarUrl}
                    alt={driver.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Bike className="w-10 h-10 text-emerald-600" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-110">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setUploadingField('avatarUrl');
                      const b64 = await compressAndEncodeImage(file, 800, 800, 0.85);
                      await updateDriverProfile(driver.id, { avatarUrl: b64 });
                    } finally {
                      setUploadingField(null);
                    }
                  }}
                />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">{driver.fullName}</h2>
                <span className="text-xs text-slate-400">@{driver.username}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    driver.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : driver.status === 'pending_approval'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {driver.status === 'active' ? 'Mensajero Habilitado ✓' : driver.status === 'pending_approval' ? 'En Revisión' : 'Inactivo'}
                </span>
              </div>
              <p className="text-slate-600">
                C.I. <strong>{driver.ciDni}</strong> · Tel: {driver.phone} · {driver.city || 'Caracas'}
              </p>
              <p className="text-slate-500 text-[11px]">
                {driver.totalDeliveries} despachos entregados · Calificación: ⭐ {driver.rating.toFixed(1)} / 5.0
              </p>
            </div>
          </div>

          {/* Vehículo y Datos Operativos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Vehículo & Modalidad</span>
              <p className="font-extrabold text-slate-900 text-sm">{driver.motorcycleBrandModel}</p>
              <p className="text-slate-600">Placa: <strong>{driver.plateNumber}</strong></p>
              <div className="flex gap-1 pt-1">
                {(['moto', 'bicicleta', 'auto'] as DriverVehicleType[]).map((vt) => (
                  <button
                    key={vt}
                    type="button"
                    onClick={() => updateDriverProfile(driver.id, { vehicleType: vt })}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                      (driver.vehicleType || 'moto') === vt
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {vt === 'moto' ? '🛵 Moto' : vt === 'bicicleta' ? '🚲 Bici' : '🚗 Auto'}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Licencia de Conducir</span>
              <p className="font-semibold text-slate-800">{driver.driverLicense || 'En trámite / Verificada'}</p>
              <p className="text-slate-500 text-[11px]">Cálculo de rutas optimizado para {vehicleBadgeLabel(driver.vehicleType)}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Pago Móvil Asignado</span>
              <p className="font-semibold text-slate-800">{driver.bankName || 'Banesco'}</p>
              <p className="text-slate-600 text-[11px]">{driver.bankPhone || driver.phone}</p>
            </div>
          </div>

          {/* Galería de Documentos & Fotos Oficiales */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Documentación & Fotografías Oficiales</span>
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Toma fotos desde la cámara de tu teléfono para mantener tus documentos actualizados y validados ante Superadmin.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'idDocumentPhoto',
                  title: 'Cédula de Identidad',
                  photoUrl: driver.idDocumentPhoto,
                  desc: 'Documento C.I. laminado'
                },
                {
                  id: 'licensePhoto',
                  title: 'Licencia de Conducir',
                  photoUrl: driver.licensePhoto,
                  desc: 'Licencia 2da/3ra grado'
                },
                {
                  id: 'motorcyclePhoto',
                  title: 'Foto Moto con Placa',
                  photoUrl: driver.motorcyclePhoto,
                  desc: 'Vehículo con placa visible'
                },
                {
                  id: 'vehicleDocPhoto',
                  title: 'Carnet de Circulación',
                  photoUrl: driver.vehicleDocPhoto,
                  desc: 'Título o carnet INTT'
                }
              ].map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{doc.title}</span>
                      <span className="text-[10px] text-slate-500">{doc.desc}</span>
                    </div>
                    {doc.photoUrl && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold shrink-0">
                        <FileCheck2 className="w-2.5 h-2.5" />
                        OK
                      </span>
                    )}
                  </div>

                  {doc.photoUrl ? (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                      <img
                        src={doc.photoUrl}
                        alt={doc.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewPhoto({ title: doc.title, url: doc.photoUrl! })}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
                          title="Ver en grande"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <label className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer">
                          <Camera className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                setUploadingField(doc.id);
                                const b64 = await compressAndEncodeImage(file, 1200, 1200, 0.82);
                                await updateDriverProfile(driver.id, { [doc.id]: b64 });
                              } finally {
                                setUploadingField(null);
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => updateDriverProfile(driver.id, { [doc.id]: undefined })}
                          className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg cursor-pointer"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="h-28 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer bg-white hover:bg-emerald-50/30 transition-colors p-2 text-center">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                        {uploadingField === doc.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                      <span className="font-bold text-[11px] text-slate-700">
                        {uploadingField === doc.id ? 'Subiendo...' : 'Tomar Foto'}
                      </span>
                      <span className="text-[9px] text-slate-400">Cámara / Archivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploadingField(doc.id);
                            const b64 = await compressAndEncodeImage(file, 1200, 1200, 0.82);
                            await updateDriverProfile(driver.id, { [doc.id]: b64 });
                          } finally {
                            setUploadingField(null);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Validación de Entrega (PIN 4 dígitos o Foto de Evidencia) */}
      {deliveryModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Validar Entrega al Cliente
                </h3>
              </div>
              <button
                onClick={() => setDeliveryModalOrderId(null)}
                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600">
              Solicita al cliente su <strong>PIN de seguridad de 4 dígitos</strong> o toma una{' '}
              <strong>foto de evidencia</strong> (entrega sin contacto) para finalizar el pedido #{deliveryModalOrderId}.
            </p>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Código PIN del Cliente (4 dígitos)
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="Ej. 4829"
                value={deliveryPinInput}
                onChange={(e) => {
                  setDeliveryPinInput(e.target.value);
                  setDeliveryValidationError(null);
                }}
                className="w-full px-4 py-3 text-center text-lg tracking-[0.35em] font-black bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-800">
                O Foto de Evidencia (Entrega sin contacto)
              </label>
              {deliveryProofPhoto ? (
                <div className="relative h-32 rounded-xl overflow-hidden border border-slate-300">
                  <img src={deliveryProofPhoto} alt="Evidencia entrega" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setDeliveryProofPhoto(undefined)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer text-slate-600 font-bold">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Tomar / Subir Foto de Entrega</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const b64 = await compressAndEncodeImage(file, 1000, 1000, 0.8);
                      setDeliveryProofPhoto(b64);
                      setDeliveryValidationError(null);
                    }}
                  />
                </label>
              )}
            </div>

            {deliveryValidationError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold">
                {deliveryValidationError}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeliveryModalOrderId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeliveryWithValidation}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl cursor-pointer shadow-md"
              >
                Confirmar Entrega ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Soporte Operativo del Repartidor */}
      {supportModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-5 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-amber-600" />
                Reportar Incidencia · Pedido #{activeOrder.id}
              </h3>
              <button
                onClick={() => setSupportModalOpen(false)}
                className="p-1 rounded-full bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Ej. Cliente no responde en puerta, dirección imprecisa o retraso en local..."
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!supportMessage.trim()) return;
                  createSupportTicket({
                    orderId: activeOrder.id,
                    requesterName: driver.fullName,
                    requesterRole: 'driver',
                    subject: `Incidencia Repartidor Pedido #${activeOrder.id}`,
                    message: supportMessage.trim()
                  });
                  setSupportMessage('');
                  setSupportModalOpen(false);
                  setStepToast({ ok: true, msg: 'Ticket enviado a Superadmin Soporte.' });
                  setTimeout(() => setStepToast(null), 3500);
                }}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Enviar a Soporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview de Foto en Grande */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-4 text-white shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-sm text-white">{previewPhoto.title}</h3>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="text-right">
              <button
                onClick={() => setPreviewPhoto(null)}
                className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 cursor-pointer"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

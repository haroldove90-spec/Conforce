import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, DriverStep } from '../../types';
import {
  Bike,
  CheckCircle2,
  Navigation as NavIcon,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  Store,
  User,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Package,
  Power,
  RefreshCw
} from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const {
    currentDriverProfile,
    drivers,
    orders,
    toggleDriverAvailability,
    acceptOrderAsDriver,
    advanceDriverDeliveryStep,
    openExternalNavigation,
    currentUser,
    openDriverRegistration
  } = useApp();

  const [activeTab, setActiveTab] = useState<'deliveries' | 'history' | 'wallet' | 'profile'>('deliveries');
  const [payoutRequested, setPayoutRequested] = useState(false);

  const driver = currentDriverProfile || drivers[0];

  // Active delivery assigned to this driver
  const activeOrder = orders.find(
    o => o.driverId === driver?.id && o.status === 'on_the_way'
  );

  // Available orders pool looking for courier (deliveryType === 'delivery', status is ready or preparing, not yet assigned to another driver)
  const availableOrders = orders.filter(
    o => o.deliveryType === 'delivery' && (o.status === 'ready' || o.status === 'preparing') && !o.driverId
  );

  // Completed orders delivered by this driver
  const completedOrders = orders.filter(
    o => o.driverId === driver?.id && o.status === 'delivered'
  );

  const getStepProgress = (step?: DriverStep) => {
    switch (step) {
      case 'heading_to_store':
        return { percent: 25, label: 'En camino a la tienda', stepNum: 1 };
      case 'picked_up':
        return { percent: 50, label: 'Pedido retirado y en maleta', stepNum: 2 };
      case 'heading_to_client':
        return { percent: 75, label: 'En ruta al domicilio del cliente', stepNum: 3 };
      case 'delivered':
        return { percent: 100, label: 'Entregado con éxito', stepNum: 4 };
      default:
        return { percent: 15, label: 'Carrera asignada', stepNum: 1 };
    }
  };

  const handleAdvanceStep = (orderId: string, currentStep?: DriverStep) => {
    if (!currentStep || currentStep === 'assigned' || currentStep === 'heading_to_store') {
      advanceDriverDeliveryStep(orderId, 'picked_up');
    } else if (currentStep === 'picked_up') {
      advanceDriverDeliveryStep(orderId, 'heading_to_client');
    } else if (currentStep === 'heading_to_client') {
      advanceDriverDeliveryStep(orderId, 'delivered');
    }
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
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-white">
                  {driver.fullName}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold">
                  ⭐ {driver.rating.toFixed(1)}
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

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-slate-800">
                  <span>Paso {getStepProgress(activeOrder.driverStep).stepNum} de 4:</span>
                  <span className="text-emerald-700">{getStepProgress(activeOrder.driverStep).label}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${getStepProgress(activeOrder.driverStep).percent}%` }}
                  />
                </div>
              </div>

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

              {/* Contact & Navigation Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    const addressQuery = encodeURIComponent(activeOrder.deliveryAddress || activeOrder.businessName);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`, '_blank');
                  }}
                  className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <NavIcon className="w-4 h-4 text-emerald-400" />
                  <span>Google Maps</span>
                </button>
                <button
                  onClick={() => {
                    const addressQuery = encodeURIComponent(activeOrder.deliveryAddress || activeOrder.businessName);
                    window.open(`https://waze.com/ul?q=${addressQuery}`, '_blank');
                  }}
                  className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Waze</span>
                </button>
                <a
                  href={`tel:${activeOrder.customerPhone}`}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Llamar Cliente</span>
                </a>
              </div>

              {/* Big tactile step progression button */}
              <div className="pt-2">
                {(!activeOrder.driverStep || activeOrder.driverStep === 'assigned' || activeOrder.driverStep === 'heading_to_store') && (
                  <button
                    onClick={() => handleAdvanceStep(activeOrder.id, activeOrder.driverStep)}
                    className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-base transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Store className="w-5 h-5" />
                    <span>1. ¡Llegué a la Tienda a Retirar el Pedido!</span>
                  </button>
                )}

                {activeOrder.driverStep === 'picked_up' && (
                  <button
                    onClick={() => handleAdvanceStep(activeOrder.id, activeOrder.driverStep)}
                    className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-extrabold text-base transition-all shadow-lg shadow-indigo-950/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Package className="w-5 h-5" />
                    <span>2. ¡Pedido en Maleta, Voy en Ruta al Cliente!</span>
                  </button>
                )}

                {activeOrder.driverStep === 'heading_to_client' && (
                  <button
                    onClick={() => handleAdvanceStep(activeOrder.id, activeOrder.driverStep)}
                    className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-base transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    <span>3. ¡Pedido Entregado con Éxito al Cliente!</span>
                  </button>
                )}
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
                {availableOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl shadow-xs space-y-3 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          #{ord.id}
                        </span>
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
                          + Bs. {ord.deliveryFee || 45}
                        </span>
                        <span className="text-[10px] text-slate-400">Tarifa Mensajero</span>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                      <span>{ord.items.length} productos ({ord.customerName})</span>
                      <span className="font-semibold text-slate-800">
                        Total Pedido: Bs. {ord.total.toLocaleString('es-VE')}
                      </span>
                    </div>

                    <button
                      onClick={() => acceptOrderAsDriver(ord.id, driver.id)}
                      disabled={Boolean(activeOrder)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Bike className="w-4 h-4" />
                      <span>{activeOrder ? 'Ya tienes una carrera en curso' : 'Aceptar Carrera y Despachar'}</span>
                    </button>
                  </div>
                ))}
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

      {/* TAB 3: BILLETERA & PAGO MÓVIL */}
      {activeTab === 'wallet' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-5">
          <div className="p-6 bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-2xl space-y-2 shadow-md">
            <span className="text-xs text-slate-400 font-semibold uppercase">Saldo Disponible para Pago Móvil</span>
            <div className="text-3xl font-extrabold text-emerald-400">
              Bs. {driver.earningsBalance.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400">
              Acumulado de tarifas por despachos completados exitosamente.
            </p>
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

          {payoutRequested ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                ¡Solicitud de retiro registrada! Finanzas procesará tu transferencia a través de Pago Móvil en las próximas 2 horas hábiles.
              </span>
            </div>
          ) : (
            <button
              onClick={() => setPayoutRequested(true)}
              disabled={driver.earningsBalance <= 0}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition-colors cursor-pointer shadow-md"
            >
              Solicitar Pago Móvil de Mis Ganancias (Bs. {driver.earningsBalance.toLocaleString('es-VE')})
            </button>
          )}
        </div>
      )}

      {/* TAB 4: MI MOTO & PERFIL */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 text-xs">
          <h2 className="text-base font-extrabold text-slate-900">
            Ficha del Mensajero y Motocicleta
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Conductor</span>
              <p className="font-extrabold text-slate-900 text-sm">{driver.fullName}</p>
              <p className="text-slate-600">C.I. {driver.ciDni}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Vehículo</span>
              <p className="font-extrabold text-slate-900 text-sm">{driver.motorcycleBrandModel}</p>
              <p className="text-slate-600">Placa: <strong>{driver.plateNumber}</strong></p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Licencia de Conducir</span>
              <p className="font-semibold text-slate-800">{driver.driverLicense || 'Verificada en sede'}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Ciudad / Cobertura</span>
              <p className="font-semibold text-slate-800">{driver.city || 'Caracas'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

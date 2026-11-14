import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeliveryType, PaymentMethod, OrderChannel } from '../../types';
import confetti from 'canvas-confetti';
import { openWhatsAppDirect } from '../../utils/urlUtils';
import { resolveProductImage, buildSafeProductPlaceholder } from '../../utils/imageUtils';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MapPin,
  LocateFixed,
  Building,
  CreditCard,
  Banknote,
  SmartphoneNfc,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Smartphone,
  Send,
  AlertCircle,
  LogIn
} from 'lucide-react';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  onOrderSuccess
}) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    cartServiceFee,
    createOrder,
    businesses,
    userLocation,
    userAddressLabel,
    savedAddresses,
    currentUser,
    setIsClientAuthModalOpen,
    setClientAuthIntent,
    exchangeRateUsd,
    formatCurrency
  } = useApp();

  // Channel Selection: Default to 'whatsapp' (Los pedidos se realizan al WhatsApp del negocio)
  const [checkoutChannel, setCheckoutChannel] = useState<OrderChannel>('whatsapp');
  
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [addressChoice, setAddressChoice] = useState<'current_gps' | 'saved' | 'custom'>('current_gps');
  const [customAddress, setCustomAddress] = useState<string>(currentUser?.address || '');
  const [selectedSavedAddrId, setSelectedSavedAddrId] = useState<string>(savedAddresses[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pago_movil');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>(currentUser?.name || 'Cliente');
  const [customerPhone, setCustomerPhone] = useState<string>(currentUser?.phone || '+58 412 1234567');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [pendingAuthChannel, setPendingAuthChannel] = useState<OrderChannel | null>(null);

  // Sync user details if user signs in or registers while drawer is open
  React.useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
      if (currentUser.address) {
        setCustomAddress(currentUser.address);
        setAddressChoice('custom');
      }
    }
  }, [currentUser]);

  // Resume checkout automatically once the user completes login/registration
  React.useEffect(() => {
    if (isOpen && currentUser && pendingAuthChannel && cart.length > 0 && !isSubmitting) {
      const channel = pendingAuthChannel;
      setPendingAuthChannel(null);
      handlePlaceOrder(channel);
    }
  }, [currentUser, isOpen, pendingAuthChannel]);

  if (!isOpen) return null;

  // Group cart items by business so multi-store carts never mix orders
  const businessIdsInCart = Array.from(new Set(cart.map((i) => i.businessId).filter(Boolean)));
  const hasMultipleBusinesses = businessIdsInCart.length > 1;
  const primaryBusinessId = cart[0]?.businessId;
  const targetBusiness = businesses.find((b) => b.id === primaryBusinessId);

  const deliveryFee = deliveryType === 'pickup' ? 0 : 35;
  const serviceFee = cartServiceFee;
  const grandTotal = cartSubtotal + deliveryFee + serviceFee;

  const getResolvedAddress = () => {
    if (deliveryType === 'pickup') {
      return `Recoger en Sucursal: ${targetBusiness?.address || 'Mostrador principal'}`;
    }
    if (addressChoice === 'current_gps') {
      return userAddressLabel || 'Ubicación GPS actual';
    }
    if (addressChoice === 'saved') {
      const saved = savedAddresses.find((a) => a.id === selectedSavedAddrId);
      return saved ? `${saved.label}: ${saved.address}` : 'Dirección guardada';
    }
    return customAddress.trim() || 'Dirección personalizada especificada';
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'pago_movil':
        return 'Pago Móvil Interbancario';
      case 'bank_transfer':
        return 'Transferencia Bancaria / Zelle';
      case 'card':
        return 'Tarjeta de Débito/Crédito Online';
      case 'cash_on_delivery':
        return 'Efectivo contra entrega';
      case 'pos_terminal':
        return 'Punto de Venta POS al recibir';
      default:
        return 'Pago directo';
    }
  };

  const buildWhatsAppMessage = (
    itemsSubset = cart,
    bizTarget = targetBusiness
  ) => {
    const bizName = bizTarget?.name || 'Comercio';
    const address = getResolvedAddress();
    const subsetSubtotal = itemsSubset.reduce(
      (s, item) => s + (item.itemTotalBs ?? item.product.price) * item.quantity,
      0
    );
    const subsetServiceFee = subsetSubtotal > 0 ? Math.max(10, Math.round(subsetSubtotal * 0.05)) : 0;
    const subsetTotal = subsetSubtotal + deliveryFee + subsetServiceFee;
    const grandTotalUsd = exchangeRateUsd > 0 ? (subsetTotal / exchangeRateUsd).toFixed(2) : undefined;
    const subtotalUsd = exchangeRateUsd > 0 ? (subsetSubtotal / exchangeRateUsd).toFixed(2) : undefined;

    const itemsList = itemsSubset
      .map((item) => {
        const itemUnitPrice = item.itemTotalBs ?? item.product.price;
        const itemLineTotal = itemUnitPrice * item.quantity;
        const itemUsd = exchangeRateUsd > 0 ? (itemLineTotal / exchangeRateUsd).toFixed(2) : undefined;

        let line = `• ${item.quantity}x *${item.product.name}* - Bs. ${itemLineTotal.toLocaleString('es-VE')}${itemUsd ? ` ($${itemUsd} USD)` : ''}`;
        if (item.selectedVariantOption) {
          line += `\n  🏷️ _${item.selectedVariantOption.variantName}: ${item.selectedVariantOption.optionLabel}_`;
        }
        if (item.selectedExtras && item.selectedExtras.length > 0) {
          line += `\n  ➕ _Extras: ${item.selectedExtras.map(e => `${e.name} (+Bs. ${e.price})`).join(', ')}_`;
        }
        if (item.kitchenNotes) {
          line += `\n  📝 _Nota: "${item.kitchenNotes}"_`;
        }
        return line;
      })
      .join('\n\n');

    return `🛍️ *NUEVO PEDIDO - CONFORCE MARKETPLACE*
🏪 *Tienda Destino:* ${bizName}
👤 *Cliente:* ${customerName.trim() || 'Cliente'} (${customerPhone.trim() || 'Sin teléfono'})
📍 *Modalidad:* ${deliveryType === 'pickup' ? '🏬 Retiro en Tienda' : '🛵 Despacho en Moto a Domicilio'}
📍 *Dirección de Entrega:* ${address}

📦 *DETALLE DE PRODUCTOS:*
${itemsList}

─────────────────────────
💵 *Subtotal:* Bs. ${subsetSubtotal.toLocaleString('es-VE')}${subtotalUsd ? ` ($${subtotalUsd} USD)` : ''}
🛵 *Costo Envío en Moto:* ${deliveryFee === 0 ? 'Gratis' : `Bs. ${deliveryFee.toLocaleString('es-VE')}`}
🛡️ *Tarifa de Servicio (5%):* Bs. ${subsetServiceFee.toLocaleString('es-VE')}
💰 *TOTAL A PAGAR:* Bs. ${subsetTotal.toLocaleString('es-VE')}${grandTotalUsd ? ` ($${grandTotalUsd} USD)` : ''}
─────────────────────────
💳 *Forma de Pago:* ${getPaymentMethodLabel(paymentMethod)}
${paymentReference.trim() ? `🔢 *Nro. de Referencia:* ${paymentReference.trim()}\n` : ''}${orderNotes.trim() ? `📝 *Instrucciones Especiales:* ${orderNotes.trim()}\n` : ''}
_Enviado directamente desde ConForce Marketplace Venezuela_`;
  };

  const handlePlaceOrder = (channelOverride?: OrderChannel) => {
    if (cart.length === 0 || !targetBusiness) return;

    const channelToUse = channelOverride || checkoutChannel;

    // Si el usuario no ha iniciado sesión o no está registrado, abrir modal de autenticación de cliente
    if (!currentUser) {
      setPendingAuthChannel(channelToUse);
      setClientAuthIntent('order_checkout');
      setIsClientAuthModalOpen(true);
      return;
    }

    const finalDeliveryAddress = getResolvedAddress();
    setIsSubmitting(true);

    setTimeout(() => {
      const groupedByBiz = businessIdsInCart.map((bId) => ({
        biz: businesses.find((b) => b.id === bId) || targetBusiness,
        items: cart.filter((i) => i.businessId === bId)
      }));

      let lastOrderId = '';

      groupedByBiz.forEach(({ biz: storeBiz, items: storeItems }) => {
        const sub = storeItems.reduce(
          (s, i) => s + (i.itemTotalBs ?? i.product.price) * i.quantity,
          0
        );
        const svc = sub > 0 ? Math.max(10, Math.round(sub * 0.05)) : 0;
        const tot = sub + deliveryFee + svc;

        const created = createOrder({
          businessId: storeBiz.id,
          businessName: storeBiz.name,
          businessLogo: storeBiz.logo,
          customerName: customerName.trim() || currentUser.name || 'Cliente ConForce',
          customerPhone: customerPhone.trim() || currentUser.phone || '+58 412 1234567',
          items: [...storeItems],
          subtotal: sub,
          deliveryFee,
          serviceFee: svc,
          serviceFeeRate: 0.05,
          total: tot,
          deliveryType,
          deliveryAddress: finalDeliveryAddress,
          deliveryCoordinates: userLocation || undefined,
          paymentMethod,
          paymentReference: paymentReference.trim() || undefined,
          orderChannel: channelToUse,
          status: 'preparing',
          notes: orderNotes
        });
        lastOrderId = created.id;

        if (channelToUse === 'whatsapp') {
          const rawMsg = buildWhatsAppMessage(storeItems, storeBiz);
          const bizPhone = storeBiz.whatsapp || storeBiz.phone;
          openWhatsAppDirect(bizPhone, rawMsg);
        }
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }

      setIsSubmitting(false);
      onClose();
      onOrderSuccess(lastOrderId);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full h-full md:max-w-lg bg-white text-slate-900 flex flex-col shadow-2xl border-l border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#D4021D] text-white flex items-center justify-center text-base shadow-xs">
              🛒
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Carrito & Checkout</h3>
              {targetBusiness ? (
                <p className="text-xs text-slate-500 truncate">
                  Tienda: <span className="text-[#D4021D] font-bold">{targetBusiness.name}</span>
                </p>
              ) : (
                <p className="text-xs text-slate-500">Completa tu orden</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white">
            <div className="w-16 h-16 rounded-3xl bg-red-50 text-[#D4021D] flex items-center justify-center text-3xl mb-3 border border-red-200">
              🛍️
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">Tu carrito está vacío</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Agrega productos desde la vitrina de tiendas o desde el mapa para continuar con tu compra.
            </p>
            <button
              onClick={onClose}
              className="mt-5 px-6 py-2.5 bg-[#D4021D] hover:bg-[#b50218] text-white font-bold rounded-2xl text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              Explorar Tiendas
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            
            {/* 🌟 1. SELECTOR DE CANAL DE COMPRA: APP VS WHATSAPP */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4021D]" />
                <span>¿Cómo deseas realizar tu compra?</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {/* Opción A: Vía App Móvil */}
                <button
                  onClick={() => setCheckoutChannel('app')}
                  className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                    checkoutChannel === 'app'
                      ? 'bg-red-50/50 border-[#D4021D] text-slate-900 shadow-xs ring-1 ring-[#D4021D]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-[#D4021D] text-white flex items-center justify-center shadow-xs">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">App Móvil</p>
                    <p className="text-[10px] text-[#D4021D] font-semibold">En línea & En vivo</p>
                  </div>
                </button>

                {/* Opción B: Vía WhatsApp (Recomendado) */}
                <button
                  onClick={() => setCheckoutChannel('whatsapp')}
                  className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer relative ${
                    checkoutChannel === 'whatsapp'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs ring-2 ring-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase">
                    Directo
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <MessageCircle className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">WhatsApp del Negocio</p>
                    <p className="text-[10px] text-emerald-700 font-bold">Despacho y pedido directo</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Account Detection Box */}
            {!currentUser ? (
              <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-red-950 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#D4021D] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 text-xs">Registro de Cliente Obligatorio</p>
                    <p className="text-slate-600 text-[11px] truncate">
                      Inicia sesión o crea tu cuenta para enviar y rastrear tu pedido.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setClientAuthIntent('order_checkout');
                    setIsClientAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#D4021D] hover:bg-red-700 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                >
                  Entrar / Registrarme
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    Cliente verificado: <strong>{currentUser.name}</strong> (@{currentUser.username})
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                  Listo para pedir
                </span>
              </div>
            )}

            {hasMultipleBusinesses && (
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Tienes productos de <strong>{businessIdsInCart.length} comercios distintos</strong>. Se generará y enviará un pedido separado al WhatsApp de cada negocio.
                </span>
              </div>
            )}

            {/* 2. Items List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Resumen de Productos ({cart.length})</span>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Vaciar
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {cart.map((item, idx) => {
                  const unitPriceBs = item.itemTotalBs ?? item.product.price;
                  const lineTotalBs = unitPriceBs * item.quantity;
                  return (
                    <div
                      key={`${item.product.id}-${idx}`}
                      className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200/90 shadow-2xs"
                    >
                      <img
                        src={resolveProductImage(item.product.image, item.product.images, item.product.name)}
                        alt={item.product.name}
                        onError={(e) => {
                          e.currentTarget.src = buildSafeProductPlaceholder(item.product.name);
                        }}
                        className="w-11 h-11 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-slate-900 text-xs truncate">
                          {item.product.name}
                        </h5>
                        {item.selectedVariantOption && (
                          <p className="text-[10px] text-slate-500 truncate">
                            {item.selectedVariantOption.variantName}: {item.selectedVariantOption.optionLabel}
                          </p>
                        )}
                        <span className="text-xs text-[#D4021D] font-extrabold tabular-nums">
                          {formatCurrency(lineTotalBs).formatted}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-0.5 shadow-2xs">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, idx)}
                          className="text-slate-500 hover:text-slate-900 cursor-pointer p-0.5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 min-w-[12px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, idx)}
                          className="text-slate-500 hover:text-slate-900 cursor-pointer p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Modalidad: Recoger vs Domicilio */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                Modalidad de Entrega
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
                    deliveryType === 'delivery'
                      ? 'bg-red-50/50 border-[#D4021D] text-slate-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">🛵</span>
                  <span className="text-xs font-bold">Envío a Domicilio</span>
                  <span className="text-[10px] text-[#D4021D] font-bold tabular-nums">
                    +{formatCurrency(35).formatted}
                  </span>
                </button>

                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
                    deliveryType === 'pickup'
                      ? 'bg-slate-100 border-slate-400 text-slate-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">🏬</span>
                  <span className="text-xs font-bold">Recoger en Sucursal</span>
                  <span className="text-[10px] text-slate-700 font-bold">Gratis</span>
                </button>
              </div>
            </div>

            {/* 4. Dirección de Entrega (si es delivery) */}
            {deliveryType === 'delivery' && (
              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4021D]" />
                  Dirección de Entrega
                </span>

                <div className="space-y-1.5">
                  {/* Choice 1: Current GPS */}
                  <label
                    onClick={() => setAddressChoice('current_gps')}
                    className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer text-xs ${
                      addressChoice === 'current_gps'
                        ? 'bg-white border-[#D4021D] text-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={addressChoice === 'current_gps'}
                      onChange={() => setAddressChoice('current_gps')}
                      className="accent-[#D4021D]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate">📍 Posición GPS actual</p>
                      <p className="text-[10px] text-slate-500 truncate">{userAddressLabel}</p>
                    </div>
                  </label>

                  {/* Choice 2: Saved Addresses */}
                  {savedAddresses.length > 0 && (
                    <label
                      onClick={() => setAddressChoice('saved')}
                      className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer text-xs ${
                        addressChoice === 'saved'
                          ? 'bg-white border-[#D4021D] text-slate-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={addressChoice === 'saved'}
                        onChange={() => setAddressChoice('saved')}
                        className="accent-[#D4021D] mt-1"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">Direcciones Guardadas</p>
                        <select
                          value={selectedSavedAddrId}
                          onChange={(e) => {
                            setSelectedSavedAddrId(e.target.value);
                            setAddressChoice('saved');
                          }}
                          className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#D4021D]"
                        >
                          {savedAddresses.map((addr) => (
                            <option key={addr.id} value={addr.id}>
                              {addr.label}: {addr.address}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>
                  )}

                  {/* Choice 3: Custom */}
                  <label
                    onClick={() => setAddressChoice('custom')}
                    className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer text-xs ${
                      addressChoice === 'custom'
                        ? 'bg-white border-[#D4021D] text-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={addressChoice === 'custom'}
                      onChange={() => setAddressChoice('custom')}
                      className="accent-[#D4021D] mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">Escribir otra dirección</p>
                      {addressChoice === 'custom' && (
                        <input
                          type="text"
                          value={customAddress}
                          onChange={(e) => setCustomAddress(e.target.value)}
                          placeholder="Calle, número, colonia, referencias..."
                          className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#D4021D]"
                        />
                      )}
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* 5. Método de Pago */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  Forma de Pago
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ✓ Bolívares (Bs.)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pago_movil')}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'pago_movil'
                      ? 'bg-red-50/70 border-[#D4021D] text-slate-900 shadow-2xs ring-1 ring-[#D4021D]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#D4021D]" />
                  <span className="text-[11px] font-bold">Pago Móvil</span>
                  <span className="text-[9px] text-slate-400">Interbancario</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'bank_transfer'
                      ? 'bg-red-50/70 border-[#D4021D] text-slate-900 shadow-2xs ring-1 ring-[#D4021D]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building className="w-4 h-4 text-[#D4021D]" />
                  <span className="text-[11px] font-bold">Transferencia</span>
                  <span className="text-[9px] text-slate-400">Banesco / Zelle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'bg-red-50/70 border-[#D4021D] text-slate-900 shadow-2xs ring-1 ring-[#D4021D]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-[#D4021D]" />
                  <span className="text-[11px] font-bold">Efectivo</span>
                  <span className="text-[9px] text-slate-400">Contra entrega</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('pos_terminal')}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'pos_terminal'
                      ? 'bg-red-50/70 border-[#D4021D] text-slate-900 shadow-2xs ring-1 ring-[#D4021D]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <SmartphoneNfc className="w-4 h-4 text-[#D4021D]" />
                  <span className="text-[11px] font-bold">Punto POS</span>
                  <span className="text-[9px] text-slate-400">Tarjeta al recibir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-red-50/70 border-[#D4021D] text-slate-900 shadow-2xs ring-1 ring-[#D4021D]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#D4021D]" />
                  <span className="text-[11px] font-bold">Tarjeta Online</span>
                  <span className="text-[9px] text-slate-400">Débito / Crédito</span>
                </button>
              </div>

              {/* Datos de Pago Móvil / Transferencia Bancaria */}
              {(paymentMethod === 'pago_movil' || paymentMethod === 'bank_transfer') && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <Building className="w-3.5 h-3.5 text-amber-700" />
                    <span>Datos para {paymentMethod === 'pago_movil' ? 'Pago Móvil' : 'Transferencia'}:</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/80 space-y-1 text-[11px] font-mono">
                    <p>🏦 <strong>Banco:</strong> Banesco (0134) / Banco de Venezuela (0102)</p>
                    <p>📱 <strong>Teléfono:</strong> {targetBusiness?.phone || '+58 412 1234567'}</p>
                    <p>🆔 <strong>RIF/C.I.:</strong> {targetBusiness?.rif || 'J-50123456-7'}</p>
                    <p>🏬 <strong>Beneficiario:</strong> {targetBusiness?.name || 'Comercio Afiliado ConForce'}</p>
                    <p className="text-emerald-700 font-bold font-sans pt-1 tabular-nums">
                      Monto a transferir: {formatCurrency(grandTotal).formatted}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Número de Referencia Bancaria (últimos 4 a 6 dígitos):
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Ej: 849201"
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#D4021D]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 6. Identificación de Cliente y Datos de Contacto */}
            {!currentUser ? (
              <div className="p-3 bg-red-50/90 border-2 border-red-400/80 rounded-2xl space-y-2 text-xs shadow-xs animate-fade-in">
                <div className="flex items-center gap-2 text-red-950 font-bold">
                  <AlertCircle className="w-4 h-4 text-[#D4021D] shrink-0" />
                  <span>¿Tienes cuenta de cliente o eres nuevo?</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Para coordinar la entrega y enviar tu pedido al comercio, inicia sesión con tus credenciales o regístrate gratis en 30 segundos.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setClientAuthIntent('login');
                      setIsClientAuthModalOpen(true);
                    }}
                    className="py-2 px-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#D4021D]" />
                    <span>Iniciar Sesión</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClientAuthIntent('register');
                      setIsClientAuthModalOpen(true);
                    }}
                    className="py-2 px-2.5 rounded-xl bg-[#D4021D] hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Registrarme</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Comprando como: {currentUser.name}</span>
                    <p className="text-[10px] text-emerald-700">@{currentUser.username}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  Sesión Activa
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-600 text-[10px] uppercase font-bold">Tu Nombre</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-[#D4021D] font-medium"
                />
              </div>
              <div>
                <label className="text-slate-600 text-[10px] uppercase font-bold">WhatsApp / Celular</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-[#D4021D] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 text-[10px] uppercase font-bold">Instrucciones o Notas</label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Ej. Timbre 402, salsa aparte, etc."
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#D4021D]"
              />
            </div>

            {/* 💬 Previsualización del Ticket de WhatsApp si se elige WhatsApp */}
            {checkoutChannel === 'whatsapp' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                  <MessageCircle className="w-4 h-4 fill-slate-900 text-white" />
                  <span>Se abrirá WhatsApp con el siguiente pedido:</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-700 font-mono whitespace-pre-line leading-relaxed shadow-2xs">
                  {buildWhatsAppMessage()}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Checkout Footer with Totals and Action Buttons */}
        {cart.length > 0 && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-2.5 shrink-0">
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal productos:</span>
                <span className="font-semibold text-slate-900 tabular-nums">{formatCurrency(cartSubtotal).formatted}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de entrega:</span>
                <span className={deliveryFee === 0 ? 'text-slate-900 font-bold' : 'font-semibold text-slate-900 tabular-nums'}>
                  {deliveryFee === 0 ? 'Gratis' : formatCurrency(deliveryFee).formatted}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 text-slate-600">
                  <span>Tarifa de servicio:</span>
                  <span className="text-[9px] bg-red-50 text-[#D4021D] font-black px-1.5 py-0.5 rounded border border-red-200">
                    5% Soporte & Garantía
                  </span>
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">{formatCurrency(serviceFee).formatted}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>Total a Pagar:</span>
                <span className="text-[#D4021D] tabular-nums">{formatCurrency(grandTotal).formatted}</span>
              </div>
            </div>

            {/* Action Buttons: Principal and Secondary */}
            <div className="space-y-1.5">
              {checkoutChannel === 'app' ? (
                <>
                  <button
                    onClick={() => handlePlaceOrder('app')}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#D4021D] hover:bg-[#b50218] text-white font-extrabold py-3 px-4 rounded-2xl shadow-md shadow-red-600/25 text-xs sm:text-sm transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Procesando Pedido...</span>
                      </div>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4" />
                        <span>
                          {!currentUser ? 'Identificarme y Comprar vía App' : 'Comprar vía App Móvil'}{' '}
                          ({formatCurrency(grandTotal).formatted})
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handlePlaceOrder('whatsapp')}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-bold py-2 px-3 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-slate-900 text-white" />
                    <span>O pedir directamente por WhatsApp</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handlePlaceOrder('whatsapp')}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-2xl shadow-lg shadow-emerald-700/25 text-xs sm:text-sm transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Abriendo WhatsApp del Negocio...</span>
                      </div>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>
                          {!currentUser ? 'Identificarme y Enviar Pedido a WhatsApp' : 'Enviar Pedido al WhatsApp del Negocio'}{' '}
                          ({formatCurrency(grandTotal).formatted})
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handlePlaceOrder('app')}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#D4021D]" />
                    <span>O comprar en línea vía App Móvil</span>
                  </button>
                </>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

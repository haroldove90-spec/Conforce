import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Business, Product, Order, OrderStatus, ProductVariantOption, ProductVariant, ProductExtra } from '../../types';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock3,
  Bike,
  Sparkles,
  Flame,
  Search,
  ChevronDown,
  LocateFixed,
  DollarSign,
  Tag,
  Share2,
  AlertCircle,
  Zap,
  Rocket,
  Printer,
  Bell,
  BellOff,
  Volume2,
  Ban,
  UserCheck,
  X,
  Check,
  Camera,
  Upload,
  Image as ImageIcon,
  Layers,
  Utensils,
  ChefHat
} from 'lucide-react';
import { SellerBoostPaymentModal } from './SellerBoostPaymentModal';

export const SellerDashboard: React.FC = () => {
  const {
    businesses,
    selectedBusinessId,
    setSelectedBusinessId,
    currentSellerBusiness,
    updateBusiness,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleOfferOfTheDay,
    orders,
    drivers,
    updateOrderStatus,
    assignOrderDriver,
    cancelOrderWithReason,
    isSoundAlertEnabled,
    setIsSoundAlertEnabled,
    playOrderChime,
    userLocation,
    activeSellerTab,
    setActiveSellerTab,
    openBusinessRegistration,
    logout,
    exchangeRateUsd,
    setExchangeRateUsd,
    formatCurrency,
    currentUser
  } = useApp();

  // Get all businesses owned by this seller if role is seller
  const sellerOwnedBusinesses = businesses.filter(
    (b) =>
      b.ownerUsername?.toLowerCase() === currentUser?.username?.toLowerCase() ||
      (currentUser?.businessId && b.id === currentUser.businessId)
  );

  // Active business: prioritize seller's own business, then selectedBusinessId, then currentSellerBusiness
  const biz = (currentUser?.role === 'seller' && sellerOwnedBusinesses.length > 0)
    ? (sellerOwnedBusinesses.find((b) => b.id === selectedBusinessId) || sellerOwnedBusinesses[0])
    : (currentSellerBusiness || businesses.find((b) => b.id === selectedBusinessId) || businesses[0]);

  // Seller orders filtered for this business
  const sellerOrders = biz ? orders.filter((o) => o.businessId === biz.id) : [];
  const bizProducts = biz ? products.filter((p) => p.businessId === biz.id) : [];

  // States for Product Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number | undefined>(undefined);
  const [prodCategory, setProdCategory] = useState('');
  const [prodStock, setProdStock] = useState<number>(20);
  const [prodTags, setProdTags] = useState('');
  const [prodIsOffer, setProdIsOffer] = useState(false);

  // Photos uploaded from device
  const [prodImage, setProdImage] = useState(''); // Primary photo base64
  const [prodImages, setProdImages] = useState<string[]>([]); // Gallery photos base64
  const photoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Variable product state
  const [prodHasVariants, setProdHasVariants] = useState(false);
  const [prodVariantName, setProdVariantName] = useState('Tamaño / Porción');
  const [prodVariantOptions, setProdVariantOptions] = useState<ProductVariantOption[]>([]);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionPriceDelta, setNewOptionPriceDelta] = useState<number>(0);

  // Restaurant / Food specific state
  const [isFoodProduct, setIsFoodProduct] = useState(false);
  const [prodIngredients, setProdIngredients] = useState<string[]>([]);
  const [newIngredientInput, setNewIngredientInput] = useState('');
  const [prodExtras, setProdExtras] = useState<ProductExtra[]>([]);
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState<number>(0);
  const [prodPrepTime, setProdPrepTime] = useState('15-20 min');
  const [prodFoodTags, setProdFoodTags] = useState<string[]>([]);

  // States for Boost Ads Modal
  const [selectedProductForBoost, setSelectedProductForBoost] = useState<Product | null>(null);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);

  const openBoostModal = (prod: Product) => {
    setSelectedProductForBoost(prod);
    setIsBoostModalOpen(true);
  };

  // States for Profile Editor
  const [bizName, setBizName] = useState(biz?.name || '');
  const [bizPhone, setBizPhone] = useState(biz?.phone || '');
  const [bizAddress, setBizAddress] = useState(biz?.address || '');
  const [bizLat, setBizLat] = useState<number>(biz?.coordinates?.lat || 10.4806);
  const [bizLng, setBizLng] = useState<number>(biz?.coordinates?.lng || -66.9036);
  const [bizHours, setBizHours] = useState(biz?.openingHours || '8:00 AM - 10:00 PM');
  const [bizLogo, setBizLogo] = useState(biz?.logo || '🏪');
  const [bizPinColor, setBizPinColor] = useState(biz?.customPinColor || '#2563eb');
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // States for Driver Dispatch Modal
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [driverName, setDriverName] = useState('Carlos Rodríguez');
  const [driverPhone, setDriverPhone] = useState('+58 412 9988776');
  const [driverVehicle, setDriverVehicle] = useState('Moto Bera SBR - Placa AB123');

  // States for Cancel Order Modal
  const [cancelOrderTarget, setCancelOrderTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Sin stock disponible para despacho inmediato');

  // States for Print Ticket Modal
  const [printTicketOrder, setPrintTicketOrder] = useState<Order | null>(null);

  // Switch store handler
  const handleSelectBusiness = (bizId: string) => {
    setSelectedBusinessId(bizId);
    const target = businesses.find((b) => b.id === bizId);
    if (target) {
      setBizName(target.name);
      setBizPhone(target.phone);
      setBizAddress(target.address);
      setBizLat(target.coordinates.lat);
      setBizLng(target.coordinates.lng);
      setBizHours(target.openingHours);
      setBizLogo(target.logo);
      setBizPinColor(target.customPinColor || '#2563eb');
    }
  };

  const handleSaveProfile = () => {
    if (!biz) return;
    updateBusiness(biz.id, {
      name: bizName,
      phone: bizPhone,
      address: bizAddress,
      coordinates: { lat: Number(bizLat), lng: Number(bizLng) },
      openingHours: bizHours,
      logo: bizLogo,
      customPinColor: bizPinColor
    });
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 2500);
  };

  const handleUseCurrentGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setBizLat(Number(pos.coords.latitude.toFixed(6)));
          setBizLng(Number(pos.coords.longitude.toFixed(6)));
        },
        () => {
          if (userLocation) {
            setBizLat(userLocation.lat);
            setBizLng(userLocation.lng);
          }
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
      return;
    }
    if (userLocation) {
      setBizLat(userLocation.lat);
      setBizLng(userLocation.lng);
    }
  };

  // Device photo upload handler (camera or file picker)
  const handleDevicePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          if (isGallery) {
            setProdImages((prev) => [...prev, base64]);
          } else {
            setProdImage(base64);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Product modal open
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice(100);
    setProdOriginalPrice(undefined);
    setProdCategory(biz?.category || 'General');
    setProdImage('');
    setProdImages([]);
    setProdStock(50);
    setProdTags(''); // Clean, no pre-filled fake tags!
    setProdIsOffer(false);
    setProdHasVariants(false);
    setProdVariantName('Tamaño / Porción');
    setProdVariantOptions([]);
    setIsFoodProduct(biz?.category?.toLowerCase().includes('restauran') || biz?.category?.toLowerCase().includes('comida') || false);
    setProdIngredients([]);
    setNewIngredientInput('');
    setProdExtras([]);
    setNewExtraName('');
    setNewExtraPrice(0);
    setProdPrepTime('15-20 min');
    setProdFoodTags([]);
    setShowProductModal(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdPrice(prod.price);
    setProdOriginalPrice(prod.originalPrice);
    setProdCategory(prod.category);
    setProdImage(prod.image);
    setProdImages(prod.images || []);
    setProdStock(prod.stockCount);
    setProdTags(prod.tags.join(', '));
    setProdIsOffer(prod.isOfferOfTheDay);
    setProdHasVariants(!!prod.hasVariants);
    setProdVariantName(prod.variants?.[0]?.name || 'Tamaño / Porción');
    setProdVariantOptions(prod.variants?.[0]?.options || []);
    setIsFoodProduct(biz?.category?.toLowerCase().includes('restauran') || !!prod.ingredients?.length || !!prod.extras?.length);
    setProdIngredients(prod.ingredients || []);
    setNewIngredientInput('');
    setProdExtras(prod.extras || []);
    setNewExtraName('');
    setNewExtraPrice(0);
    setProdPrepTime(prod.preparationTime || '15-20 min');
    setProdFoodTags(prod.foodTags || []);
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!prodName.trim()) return;

    const tagsArray = prodTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    // Clean dynamic SVG placeholder if no custom camera photo was uploaded (no unrelated mock pictures)
    const initials = prodName.trim().slice(0, 2).toUpperCase();
    const cleanPlaceholder = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f8fafc"/><circle cx="200" cy="180" r="80" fill="%23fee2e2"/><text x="50%" y="48%" font-family="sans-serif" font-weight="900" font-size="44" fill="%23D4021D" text-anchor="middle" dominant-baseline="middle">${encodeURIComponent(initials || '🛍️')}</text><text x="50%" y="78%" font-family="sans-serif" font-weight="700" font-size="20" fill="%23334155" text-anchor="middle" dominant-baseline="middle">${encodeURIComponent(prodName.trim().slice(0, 20))}</text></svg>`;

    const finalImage = prodImage || cleanPlaceholder;

    const priceUsd = exchangeRateUsd > 0 ? Number((prodPrice / exchangeRateUsd).toFixed(2)) : 0;

    const variantsData: ProductVariant[] | undefined = prodHasVariants && prodVariantOptions.length > 0 ? [
      {
        id: `var-${Date.now()}`,
        name: prodVariantName.trim() || 'Variante',
        options: prodVariantOptions
      }
    ] : undefined;

    const productPayload: Omit<Product, 'id'> = {
      businessId: biz.id,
      name: prodName.trim(),
      description: prodDesc.trim(),
      price: Number(prodPrice),
      priceUsd,
      originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
      category: prodCategory.trim() || 'General',
      image: finalImage,
      images: prodImages.length > 0 ? prodImages : undefined,
      inStock: Number(prodStock) > 0,
      stockCount: Number(prodStock),
      tags: tagsArray,
      isOfferOfTheDay: prodIsOffer,
      hasVariants: prodHasVariants && prodVariantOptions.length > 0,
      variants: variantsData,
      ingredients: isFoodProduct && prodIngredients.length > 0 ? prodIngredients : undefined,
      extras: isFoodProduct && prodExtras.length > 0 ? prodExtras : undefined,
      preparationTime: isFoodProduct ? prodPrepTime : undefined,
      foodTags: isFoodProduct && prodFoodTags.length > 0 ? prodFoodTags : undefined
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
    } else {
      addProduct(productPayload);
    }

    setShowProductModal(false);
  };

  if (!biz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-4xl shadow-inner border border-slate-200">
          🏪
        </div>
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-black text-slate-900">
            No tienes comercios registrados
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Los datos de muestra fueron eliminados o aún no has registrado tu tienda en la plataforma.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => openBusinessRegistration(false)}
            className="px-5 py-2.5 bg-[#D4021D] hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            + Registrar Nuevo Comercio
          </button>
          <button
            onClick={() => logout()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 space-y-6 pb-24 md:pb-12 bg-white">
      
      {/* Store Switcher Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border-2 border-white"
            style={{ backgroundColor: biz.customPinColor || '#2563eb' }}
          >
            {biz.logo}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px] uppercase border border-slate-200">
                {biz.category === 'farmacia' ? '💊 Farmacia' : '🍔 Restaurante'}
              </span>
              <span className="text-xs text-slate-600 font-medium">· Comisión {biz.commissionRate}%</span>
            </div>
            <h2 className="text-base md:text-lg font-black text-slate-900">{biz.name}</h2>
          </div>
        </div>

        {/* Store Dropdown selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">Mi Negocio:</span>
          <select
            value={biz.id}
            onChange={(e) => handleSelectBusiness(e.target.value)}
            className="bg-white text-slate-900 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 shadow-xs focus:outline-none focus:ring-1 focus:ring-[#D4021D] cursor-pointer"
          >
            {(currentUser?.role === 'seller' && sellerOwnedBusinesses.length > 0 ? sellerOwnedBusinesses : businesses).map((b) => (
              <option key={b.id} value={b.id}>
                {b.logo} {b.name} ({b.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'orders', label: `Pedidos en Vivo (${sellerOrders.length})`, icon: <Clock3 className="w-4 h-4" /> },
          { id: 'catalog', label: `Catálogo & Stock (${bizProducts.length})`, icon: <Package className="w-4 h-4" /> },
          { id: 'profile', label: 'Perfil Comercial & GPS', icon: <MapPin className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSellerTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSellerTab === tab.id
                ? 'bg-[#D4021D] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. ORDERS MODULE */}
      {activeSellerTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Recepción de Pedidos en Tiempo Real</h3>
              <p className="text-xs text-slate-500">Notificaciones instantáneas y despacho de entregas</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextState = !isSoundAlertEnabled;
                  setIsSoundAlertEnabled(nextState);
                  if (nextState) playOrderChime();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                  isSoundAlertEnabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-500 border-slate-300'
                }`}
                title="Activar/Silenciar sonido cuando ingresa un nuevo pedido"
              >
                {isSoundAlertEnabled ? (
                  <Bell className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                ) : (
                  <BellOff className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{isSoundAlertEnabled ? 'Alarma Sonora ON' : 'Alarma Sonora OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => playOrderChime()}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Probar sonido de notificación"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {sellerOrders.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 text-slate-500 space-y-2">
              <div className="text-4xl">📋</div>
              <p className="font-bold text-slate-900 text-sm">No tienes pedidos pendientes</p>
              <p className="text-xs max-w-xs mx-auto">
                Los clientes que ordenen en tu local aparecerán aquí inmediatamente con alarma sonora.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sellerOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#D4021D]">
                          #{order.id}
                        </span>
                        <span className="text-[11px] text-slate-500">· {order.createdAt}</span>
                        {order.orderChannel && (
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            order.orderChannel === 'whatsapp'
                              ? 'bg-slate-100 text-slate-800 border border-slate-300'
                              : 'bg-red-50 text-[#D4021D] border border-red-200'
                          }`}>
                            {order.orderChannel === 'whatsapp' ? '💬 WhatsApp' : '📱 App'}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{order.customerName}</h4>
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{order.customerPhone}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border border-slate-200">
                        {order.deliveryType === 'delivery' ? '🛵 Domicilio' : '🏬 Recojo'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPrintTicketOrder(order)}
                        className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 transition-all cursor-pointer"
                        title="Imprimir comanda térmica para cocina o despacho"
                      >
                        <Printer className="w-3 h-3 text-slate-500" />
                        <span>Comanda</span>
                      </button>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span>
                          <strong className="text-[#D4021D] mr-1">{i.quantity}x</strong>
                          {i.product.name}
                        </span>
                        <span className="font-medium">Bs. {i.product.price * i.quantity}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Total:</span>
                      <span className="text-[#D4021D] font-black">Bs. {order.total}</span>
                    </div>
                  </div>

                  {/* Payment Details & Reference */}
                  <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Método de Pago:</span>
                      <strong className="text-slate-900 capitalize">
                        {order.paymentMethod === 'pago_movil'
                          ? '📲 Pago Móvil'
                          : order.paymentMethod === 'bank_transfer'
                          ? '🏦 Transferencia'
                          : order.paymentMethod === 'card'
                          ? '💳 Tarjeta'
                          : order.paymentMethod === 'cash_on_delivery'
                          ? '💵 Efectivo'
                          : '📟 Punto POS'}
                      </strong>
                    </div>
                    {order.paymentReference && (
                      <div className="flex justify-between items-center bg-amber-50 px-2 py-1 rounded-md border border-amber-200 font-mono text-amber-950">
                        <span>Nro. Referencia:</span>
                        <strong className="text-amber-900">{order.paymentReference}</strong>
                      </div>
                    )}
                    {order.driverName && (
                      <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 font-medium">
                        <Bike className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Repartidor: <strong>{order.driverName}</strong> ({order.driverVehicle}) · {order.driverPhone}</span>
                      </div>
                    )}
                    {order.cancellationReason && (
                      <div className="text-red-700 bg-red-50 p-1.5 rounded border border-red-200 text-[10px]">
                        <strong>Motivo Cancelación:</strong> {order.cancellationReason}
                      </div>
                    )}
                    {order.review && (
                      <div className="text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 text-[10px]">
                        <strong>⭐ Calificación recibida:</strong> {order.review.rating}/5 estrellas
                        {order.review.comment && ` - "${order.review.comment}"`}
                      </div>
                    )}
                  </div>

                  {/* Delivery destination */}
                  <div className="text-[11px] text-slate-600 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D4021D] shrink-0 mt-0.5" />
                    <span>{order.deliveryAddress}</span>
                  </div>

                  {/* Status Switcher Buttons */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold text-slate-500">
                        Estatus del Pedido:
                      </label>
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          type="button"
                          onClick={() => setCancelOrderTarget(order)}
                          className="text-[10px] text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Rechazar / Cancelar</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { id: 'preparing', label: '👨‍🍳 Prep', color: 'hover:bg-slate-200 hover:text-slate-900' },
                        { id: 'ready', label: '📦 Listo', color: 'hover:bg-slate-200 hover:text-slate-900' },
                        { id: 'on_the_way', label: '🛵 Ruta', color: 'hover:bg-slate-200 hover:text-slate-900' },
                        { id: 'delivered', label: '✓ Entregado', color: 'hover:bg-slate-200 hover:text-slate-900' }
                      ].map((st) => (
                        <button
                          key={st.id}
                          onClick={() => {
                            if (st.id === 'on_the_way') {
                              setDispatchOrder(order);
                            } else {
                              updateOrderStatus(order.id, st.id as OrderStatus);
                            }
                          }}
                          className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            order.status === st.id
                              ? 'bg-[#D4021D] border-[#D4021D] text-white shadow-xs'
                              : `bg-slate-50 border-slate-200 text-slate-600 ${st.color}`
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. CATALOG & INVENTORY MODULE */}
      {activeSellerTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Catálogo de Productos e Inventario</h3>
              <p className="text-xs text-slate-500">
                Gestiona etiquetas de búsqueda del Chatbot IA y Ofertas del Día
              </p>
            </div>

            <button
              onClick={openNewProductModal}
              className="flex items-center gap-1.5 bg-[#D4021D] hover:bg-[#b50218] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>

          {/* Free Marketplace Notice Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                ✓
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">
                    Publicación de Catálogo 100% Gratuita
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                    Sin costo inicial
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Publica productos y menú ilimitados sin cuota de alta. Opción de <strong>Ads/Boost</strong> disponible para destacar en la cima de resultados cuando tú lo decidas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              <span className="text-[11px] font-bold text-slate-500">
                {bizProducts.length} productos activos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {bizProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-3xl border border-slate-200 p-3.5 space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div className="flex gap-3">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#D4021D] uppercase">
                        {prod.category}
                      </span>
                      <button
                        onClick={() => toggleOfferOfTheDay(prod.id)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          prod.isOfferOfTheDay
                            ? 'bg-[#D4021D] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                        title="Marcar como oferta del día para el Chatbot"
                      >
                        🔥 {prod.isOfferOfTheDay ? 'Oferta Activa' : 'Hacer Oferta'}
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs md:text-sm line-clamp-1 mt-0.5">
                      {prod.name}
                    </h4>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xs font-black text-[#D4021D]">
                        Bs. {prod.price}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-100">
                        ${(exchangeRateUsd > 0 ? (prod.price / exchangeRateUsd).toFixed(2) : '0.00')} USD
                      </span>
                    </div>

                    {/* Variant & Recipe Pills */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {prod.hasVariants && (
                        <span className="text-[9px] font-extrabold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                          🧩 Con Variantes
                        </span>
                      )}
                      {prod.ingredients && prod.ingredients.length > 0 && (
                        <span className="text-[9px] font-extrabold bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
                          🍽️ Receta ({prod.ingredients.length} ing.)
                        </span>
                      )}
                      {prod.extras && prod.extras.length > 0 && (
                        <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                          + {prod.extras.length} Extras
                        </span>
                      )}
                    </div>

                    {/* Stock pill */}
                    <div className="flex items-center gap-1 mt-1 text-[11px]">
                      <span className="text-slate-500">Stock:</span>
                      <span
                        className={`font-bold ${
                          prod.stockCount > 0 ? 'text-slate-900' : 'text-red-500'
                        }`}
                      >
                        {prod.stockCount} uds
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chatbot Keywords Tags */}
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase mb-1">
                    <Tag className="w-3 h-3 text-[#D4021D]" />
                    <span>Keywords Chatbot IA:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {prod.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.2 bg-red-50 text-[#D4021D] rounded font-mono border border-red-100"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  {prod.isBoosted ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-[#D4021D] font-extrabold text-[10px] border border-red-200">
                      <Zap className="w-3 h-3 fill-[#D4021D]" />
                      <span>Ads Activo</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => openBoostModal(prod)}
                      className="px-2 py-1 bg-gradient-to-r from-amber-50 to-red-50 hover:from-amber-100 hover:to-red-100 text-[#D4021D] font-black rounded-lg text-[10px] flex items-center gap-1 border border-red-200 transition-all cursor-pointer shadow-2xs"
                    >
                      <Rocket className="w-3 h-3 text-[#D4021D]" />
                      <span>Impulsar (Ads)</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditProductModal(prod)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => deleteProduct(prod.id)}
                      className="p-1.5 bg-slate-100 hover:bg-red-50 text-red-500 rounded-lg text-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PROFILE & GEOLOCATION MODULE */}
      {activeSellerTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-5 shadow-xs max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Perfil Comercial & Geolocalización en el Mapa
              </h3>
              <p className="text-xs text-slate-500">
                Configura coordenadas GPS exactas, logo del marcador y horarios de atención
              </p>
            </div>

            {profileSavedToast && (
              <span className="px-3 py-1 bg-red-50 border border-red-200 text-[#D4021D] text-xs font-bold rounded-xl animate-in fade-in">
                ✓ Cambios Guardados
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-600 font-bold uppercase text-[10px]">
                Nombre del Negocio
              </label>
              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#D4021D]"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold uppercase text-[10px]">
                Teléfono de Contacto / WhatsApp
              </label>
              <input
                type="text"
                value={bizPhone}
                onChange={(e) => setBizPhone(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#D4021D]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-slate-600 font-bold uppercase text-[10px]">
                Dirección Física
              </label>
              <input
                type="text"
                value={bizAddress}
                onChange={(e) => setBizAddress(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#D4021D]"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold uppercase text-[10px]">
                Horario de Atención
              </label>
              <input
                type="text"
                value={bizHours}
                onChange={(e) => setBizHours(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#D4021D]"
              />
            </div>

            {/* Logo / Pin Icon Picker */}
            <div>
              <label className="text-slate-600 font-bold uppercase text-[10px]">
                Logo Emoji / Ícono del Marcador en Mapa
              </label>
              <div className="flex gap-2 mt-1">
                {['💊', '🌿', '🍔', '🍕', '🌮', '🥩', '🥗', '☕'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setBizLogo(emoji)}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                      bizLogo === emoji
                        ? 'bg-[#D4021D] text-white border-[#D4021D] scale-110 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Pin Color */}
            <div>
              <label className="text-slate-600 font-bold uppercase text-[10px]">
                Color del Pin en el Mapa
              </label>
              <div className="flex gap-2 mt-1">
                {['#D4021D', '#000000', '#f97316', '#2563eb', '#8b5cf6', '#eab308'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBizPinColor(c)}
                    className={`w-8 h-8 rounded-xl border-2 transition-all cursor-pointer ${
                      bizPinColor === c ? 'border-slate-900 scale-110 shadow-xs' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* GPS Coords with Venezuelan City selector, OSM geocoder, and real GPS button */}
            <div className="md:col-span-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4021D]" />
                  Coordenadas Exactas en el Mapa (Venezuela)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!bizAddress.trim()) return;
                      const { geocodeVenezuelaAddress } = await import('../../utils/venezuelaGeo');
                      const res = await geocodeVenezuelaAddress(bizAddress);
                      setBizLat(Number(res.lat.toFixed(6)));
                      setBizLng(Number(res.lng.toFixed(6)));
                    }}
                    className="flex items-center gap-1 text-[11px] bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-2.5 py-1 rounded-lg font-bold cursor-pointer"
                  >
                    Ubicar por dirección
                  </button>
                  <button
                    type="button"
                    onClick={handleUseCurrentGps}
                    className="flex items-center gap-1 text-[11px] text-[#D4021D] hover:text-[#b50218] font-bold cursor-pointer"
                  >
                    <LocateFixed className="w-3.5 h-3.5" /> Usar mi GPS actual
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-600 text-[10px] font-bold uppercase block mb-1">
                  Selección rápida de ciudad en Venezuela:
                </label>
                <select
                  onChange={async (e) => {
                    const { VENEZUELAN_CITIES } = await import('../../utils/venezuelaGeo');
                    const found = VENEZUELAN_CITIES.find((c) => c.name === e.target.value);
                    if (found) {
                      setBizLat(found.lat);
                      setBizLng(found.lng);
                    }
                  }}
                  defaultValue=""
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-[#D4021D]"
                >
                  <option value="" disabled>
                    Elegir ciudad (ej. San Felipe, Yaracuy, Caracas, Valencia...)
                  </option>
                  <option value="San Felipe (Yaracuy)">San Felipe (Yaracuy)</option>
                  <option value="Caracas (Distrito Capital)">Caracas (Distrito Capital)</option>
                  <option value="Barquisimeto (Lara)">Barquisimeto (Lara)</option>
                  <option value="Valencia (Carabobo)">Valencia (Carabobo)</option>
                  <option value="Maracay (Aragua)">Maracay (Aragua)</option>
                  <option value="Maracaibo (Zulia)">Maracaibo (Zulia)</option>
                  <option value="Lechería / Puerto La Cruz (Anzoátegui)">Lechería / Puerto La Cruz (Anzoátegui)</option>
                  <option value="Mérida (Mérida)">Mérida (Mérida)</option>
                  <option value="San Cristóbal (Táchira)">San Cristóbal (Táchira)</option>
                  <option value="Puerto Ordaz / Ciudad Guayana (Bolívar)">Puerto Ordaz / Ciudad Guayana (Bolívar)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 text-[10px]">Latitud:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={bizLat}
                    onChange={(e) => setBizLat(parseFloat(e.target.value))}
                    className="w-full mt-0.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-[#D4021D]"
                  />
                </div>
                <div>
                  <label className="text-slate-600 text-[10px]">Longitud:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={bizLng}
                    onChange={(e) => setBizLng(parseFloat(e.target.value))}
                    className="w-full mt-0.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-[#D4021D]"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full bg-[#D4021D] hover:bg-[#b50218] text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md shadow-[#D4021D]/25 active:scale-98 cursor-pointer"
          >
            Guardar Cambios del Perfil Comercial
          </button>
        </div>
      )}

      {/* PRODUCT CREATE / EDIT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {editingProduct ? 'Editar Producto' : 'Publicar Nuevo Producto'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
              <div>
                <label className="text-slate-600 text-[10px] uppercase font-bold">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Ej. Paracetamol 500mg o Burger Doble"
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#D4021D]"
                />
              </div>

              <div>
                <label className="text-slate-600 text-[10px] uppercase font-bold">
                  Descripción
                </label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Detalles del producto o platillo..."
                  rows={2}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 resize-none focus:outline-none focus:border-[#D4021D]"
                />
              </div>

              {/* 1. DUAL CURRENCY PRICING */}
              <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#D4021D] uppercase flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    Precios en Bolívares (Bs.) y Dólares ($ USD)
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Tasa: 1 USD = Bs. {exchangeRateUsd.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 text-[10px] uppercase font-bold">
                      Precio de Venta (Bs.)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-[#D4021D]"
                    />
                    <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
                      ≈ ${(exchangeRateUsd > 0 ? (prodPrice / exchangeRateUsd).toFixed(2) : '0.00')} USD
                    </span>
                  </div>

                  <div>
                    <label className="text-slate-600 text-[10px] uppercase font-bold">
                      Precio Original / Tachado (Bs.)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={prodOriginalPrice || ''}
                      onChange={(e) => setProdOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Opcional"
                      className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#D4021D]"
                    />
                    {prodOriginalPrice ? (
                      <span className="text-[10px] text-slate-400 line-through mt-0.5 block">
                        ≈ ${(exchangeRateUsd > 0 ? (prodOriginalPrice / exchangeRateUsd).toFixed(2) : '0.00')} USD
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Sin descuento</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. CATEGORY & STOCK */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 text-[10px] uppercase font-bold">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    placeholder="Medicamentos / Pizzas / Hamburguesas..."
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#D4021D]"
                  />
                </div>
                <div>
                  <label className="text-slate-600 text-[10px] uppercase font-bold">
                    Stock Disponible (Unidades)
                  </label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#D4021D]"
                  />
                </div>
              </div>

              {/* 3. DEVICE PHOTO UPLOAD (NO URL INPUT) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 text-[11px] uppercase font-black flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#D4021D]" />
                    <span>Fotos desde tu Dispositivo o Cámara</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Cámara / Galería Activa
                  </span>
                </div>

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleDevicePhotoUpload(e, false)}
                />
                <input
                  type="file"
                  ref={galleryInputRef}
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleDevicePhotoUpload(e, true)}
                />

                {/* Primary Photo Preview or Upload Trigger */}
                {prodImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white p-2 flex items-center gap-3">
                    <img
                      src={prodImage}
                      alt="Foto de producto"
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <span className="text-[11px] font-bold text-slate-900 block truncate">
                        Foto Principal Cargada
                      </span>
                      <p className="text-[10px] text-slate-500">
                        Lista para mostrarse a los clientes en el Marketplace.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-3 h-3 text-[#D4021D]" /> Cambiar
                        </button>
                        <button
                          type="button"
                          onClick={() => setProdImage('')}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="w-full py-5 border-2 border-dashed border-red-200 hover:border-[#D4021D] bg-white rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group hover:bg-red-50/20"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center text-[#D4021D]">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-800 block">
                        Tomar Foto o Seleccionar de la Galería
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Sube la imagen directamente desde tu teléfono o computador (sin enlaces)
                      </span>
                    </div>
                  </button>
                )}

                {/* Additional Photos / Gallery */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {prodImages.map((img, idx) => (
                      <div key={idx} className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                        <img src={img} alt={`Foto extra ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setProdImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0 right-0 bg-red-600 text-white rounded-bl w-3.5 h-3.5 flex items-center justify-center text-[9px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#D4021D]" /> + Fotos Adicionales
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. RESTAURANT / FOOD SPECIFICS (Ingredientes, Extras, Tiempo de Preparación) */}
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-amber-950 text-xs font-black flex items-center gap-1.5 cursor-pointer">
                    <Utensils className="w-4 h-4 text-amber-700" />
                    <span>Es un Platillo o Alimento de Restaurante</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={isFoodProduct}
                    onChange={(e) => setIsFoodProduct(e.target.checked)}
                    className="w-5 h-5 accent-amber-600 cursor-pointer"
                  />
                </div>

                {isFoodProduct && (
                  <div className="space-y-3 pt-2 border-t border-amber-200/60 animate-in fade-in duration-150">
                    {/* Ingredientes */}
                    <div>
                      <label className="text-slate-700 text-[10px] uppercase font-bold flex items-center justify-between">
                        <span>Ingredientes del Platillo</span>
                        <span className="text-slate-400 font-normal">Presiona agregar o Enter</span>
                      </label>
                      <div className="flex gap-1.5 mt-1">
                        <input
                          type="text"
                          value={newIngredientInput}
                          onChange={(e) => setNewIngredientInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newIngredientInput.trim()) {
                                setProdIngredients(prev => [...prev, newIngredientInput.trim()]);
                                setNewIngredientInput('');
                              }
                            }
                          }}
                          placeholder="Ej: Carne 150g, Queso cheddar, Pan brioche..."
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newIngredientInput.trim()) {
                              setProdIngredients(prev => [...prev, newIngredientInput.trim()]);
                              setNewIngredientInput('');
                            }
                          }}
                          className="px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Chips de ingredientes */}
                      {prodIngredients.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {prodIngredients.map((ing, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100/70 text-amber-900 text-[10px] font-bold rounded-lg border border-amber-200"
                            >
                              {ing}
                              <button
                                type="button"
                                onClick={() => setProdIngredients(prev => prev.filter((_, i) => i !== idx))}
                                className="text-amber-700 hover:text-red-600 font-black cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Adicionales y Extras Personalizables con costo en Bs. */}
                    <div>
                      <label className="text-slate-700 text-[10px] uppercase font-bold flex items-center justify-between">
                        <span>Adicionales / Extras (Con precio en Bs.)</span>
                        <span className="text-amber-700 font-semibold">Opcionales para el cliente</span>
                      </label>

                      <div className="grid grid-cols-12 gap-1.5 mt-1">
                        <input
                          type="text"
                          value={newExtraName}
                          onChange={(e) => setNewExtraName(e.target.value)}
                          placeholder="Ej: Extra Queso Cheddar"
                          className="col-span-7 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                        />
                        <input
                          type="number"
                          step="any"
                          value={newExtraPrice || ''}
                          onChange={(e) => setNewExtraPrice(Number(e.target.value))}
                          placeholder="+Bs."
                          className="col-span-3 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-amber-600 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newExtraName.trim()) {
                              setProdExtras(prev => [
                                ...prev,
                                {
                                  id: `ext-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                                  name: newExtraName.trim(),
                                  price: Number(newExtraPrice) || 0,
                                  priceUsd: exchangeRateUsd > 0 ? Number((Number(newExtraPrice) / exchangeRateUsd).toFixed(2)) : 0
                                }
                              ]);
                              setNewExtraName('');
                              setNewExtraPrice(0);
                            }
                          }}
                          className="col-span-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Lista de extras agregados */}
                      {prodExtras.length > 0 && (
                        <div className="space-y-1 mt-1.5">
                          {prodExtras.map((extra) => (
                            <div
                              key={extra.id}
                              className="flex items-center justify-between bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-xs"
                            >
                              <span className="font-medium text-slate-800">{extra.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#D4021D] text-[11px]">
                                  +Bs. {extra.price} (${exchangeRateUsd > 0 ? (extra.price / exchangeRateUsd).toFixed(2) : '0'} USD)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setProdExtras(prev => prev.filter(e => e.id !== extra.id))}
                                  className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tiempo de Preparación y Etiquetas de Alimentos */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-slate-600 text-[10px] uppercase font-bold">
                          Tiempo de Preparación
                        </label>
                        <select
                          value={prodPrepTime}
                          onChange={(e) => setProdPrepTime(e.target.value)}
                          className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-600"
                        >
                          <option value="10-15 min">⚡ 10 - 15 min (Rápido)</option>
                          <option value="15-20 min">⏱️ 15 - 20 min (Estándar)</option>
                          <option value="20-30 min">🍲 20 - 30 min (Elaborado)</option>
                          <option value="35-50 min">🔥 35 - 50 min (Horno / Especial)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-600 text-[10px] uppercase font-bold">
                          Distintivos
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {[
                            { id: 'picante', label: '🌶️ Picante' },
                            { id: 'vegetariano', label: '🌱 Vegetariano' },
                            { id: 'sin_gluten', label: '🌾 Sin Gluten' }
                          ].map(badge => {
                            const isSelected = prodFoodTags.includes(badge.id);
                            return (
                              <button
                                key={badge.id}
                                type="button"
                                onClick={() => {
                                  setProdFoodTags(prev =>
                                    isSelected ? prev.filter(t => t !== badge.id) : [...prev, badge.id]
                                  );
                                }}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {badge.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. VARIABLE PRODUCTS (Tallas, Colores, Tamaños, Presentaciones) */}
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-blue-950 text-xs font-black flex items-center gap-1.5 cursor-pointer">
                    <Layers className="w-4 h-4 text-blue-700" />
                    <span>Producto Variable (Tallas, Presentaciones, Tamaños)</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={prodHasVariants}
                    onChange={(e) => setProdHasVariants(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                </div>

                {prodHasVariants && (
                  <div className="space-y-3 pt-2 border-t border-blue-200/60 animate-in fade-in duration-150">
                    <div>
                      <label className="text-slate-700 text-[10px] uppercase font-bold">
                        Nombre de la Variante (Ej. Tamaño, Talla, Presentación)
                      </label>
                      <input
                        type="text"
                        value={prodVariantName}
                        onChange={(e) => setProdVariantName(e.target.value)}
                        placeholder="Ej: Tamaño / Porción o Talla"
                        className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 text-[10px] uppercase font-bold">
                        Opciones de Variante y Ajuste de Precio
                      </label>
                      <div className="grid grid-cols-12 gap-1.5 mt-1">
                        <input
                          type="text"
                          value={newOptionLabel}
                          onChange={(e) => setNewOptionLabel(e.target.value)}
                          placeholder="Ej: Mediana / Grande / Talla M"
                          className="col-span-7 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                        />
                        <input
                          type="number"
                          step="any"
                          value={newOptionPriceDelta || ''}
                          onChange={(e) => setNewOptionPriceDelta(Number(e.target.value))}
                          placeholder="+/- Bs."
                          className="col-span-3 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-blue-600 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newOptionLabel.trim()) {
                              setProdVariantOptions(prev => [
                                ...prev,
                                {
                                  id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                                  label: newOptionLabel.trim(),
                                  priceDelta: Number(newOptionPriceDelta) || 0,
                                  priceDeltaUsd: exchangeRateUsd > 0 ? Number((Number(newOptionPriceDelta) / exchangeRateUsd).toFixed(2)) : 0
                                }
                              ]);
                              setNewOptionLabel('');
                              setNewOptionPriceDelta(0);
                            }
                          }}
                          className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Lista de opciones configuradas */}
                      {prodVariantOptions.length > 0 && (
                        <div className="space-y-1 mt-1.5">
                          {prodVariantOptions.map((opt) => (
                            <div
                              key={opt.id}
                              className="flex items-center justify-between bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-xs"
                            >
                              <span className="font-semibold text-slate-800">{opt.label}</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-[11px] ${opt.priceDelta >= 0 ? 'text-emerald-700' : 'text-blue-700'}`}>
                                  {opt.priceDelta >= 0 ? `+Bs. ${opt.priceDelta}` : `-Bs. ${Math.abs(opt.priceDelta)}`}
                                  {exchangeRateUsd > 0 && ` (${opt.priceDelta >= 0 ? '+' : '-'}$${(Math.abs(opt.priceDelta) / exchangeRateUsd).toFixed(2)} USD)`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setProdVariantOptions(prev => prev.filter(o => o.id !== opt.id))}
                                  className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 6. CHATBOT IA KEYWORDS */}
              <div>
                <label className="text-slate-600 text-[10px] uppercase font-bold">
                  Etiquetas para el Chatbot IA (separadas por coma)
                </label>
                <input
                  type="text"
                  value={prodTags}
                  onChange={(e) => setProdTags(e.target.value)}
                  placeholder="hamburguesa, carne, cena, delivery, queso"
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#D4021D]"
                />
              </div>

              {/* 7. OFERTA DEL DÍA */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 text-xs">Marcar como "Oferta del Día"</span>
                  <p className="text-[11px] text-slate-600">El Asistente Web IA la destacará como sugerencia recomendada</p>
                </div>
                <input
                  type="checkbox"
                  checked={prodIsOffer}
                  onChange={(e) => setProdIsOffer(e.target.checked)}
                  className="w-5 h-5 accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowProductModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 bg-[#D4021D] hover:bg-[#b50218] text-white py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Guardar Producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boost Ads Payment Gateway Modal */}
      {selectedProductForBoost && (
        <SellerBoostPaymentModal
          product={selectedProductForBoost}
          isOpen={isBoostModalOpen}
          onClose={() => {
            setIsBoostModalOpen(false);
            setSelectedProductForBoost(null);
          }}
        />
      )}

      {/* MODAL 1: Asignar Repartidor / Motorizado para Despacho */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-[#D4021D] flex items-center justify-center font-bold">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Despachar Pedido #{dispatchOrder.id}</h3>
                  <p className="text-[11px] text-slate-500">Asigna el motorizado que llevará el pedido</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDispatchOrder(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Quick Select from Registered Drivers */}
              {drivers && drivers.filter(d => d.status === 'active').length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center justify-between">
                    <span>Mensajeros Aliados en Moto Disponibles</span>
                    <span className="text-emerald-600 font-semibold">1-Clic para asignar</span>
                  </label>
                  <div className="flex gap-2 mt-1.5 overflow-x-auto pb-1">
                    {drivers.filter(d => d.status === 'active').map((drv) => (
                      <button
                        key={drv.id}
                        type="button"
                        onClick={() => {
                          setDriverName(drv.fullName);
                          setDriverPhone(drv.phone);
                          setDriverVehicle(`${drv.motorcycleBrandModel} - Placa ${drv.plateNumber}`);
                        }}
                        className={`p-2 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                          driverName === drv.fullName
                            ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-bold text-slate-900 text-xs">{drv.fullName}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                          {drv.motorcycleBrandModel}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Nombre del Repartidor</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Ej: Alejandro Mendoza"
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-[#D4021D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Teléfono / WhatsApp del Repartidor</label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="Ej: +58 412 1234567"
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-[#D4021D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Vehículo / Placa</label>
                <input
                  type="text"
                  value={driverVehicle}
                  onChange={(e) => setDriverVehicle(e.target.value)}
                  placeholder="Ej: Moto Bera SBR - Placa AB123"
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-[#D4021D]"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p>📍 <strong>Destino:</strong> {dispatchOrder.deliveryAddress}</p>
                <p>👤 <strong>Cliente:</strong> {dispatchOrder.customerName} ({dispatchOrder.customerPhone})</p>
                <p>💰 <strong>Total a Cobrar:</strong> Bs. {dispatchOrder.total} ({dispatchOrder.paymentMethod})</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDispatchOrder(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!driverName.trim()) return;
                  assignOrderDriver(dispatchOrder.id, {
                    name: driverName.trim(),
                    phone: driverPhone.trim(),
                    vehicle: driverVehicle.trim()
                  });
                  setDispatchOrder(null);
                }}
                className="flex-1 bg-[#D4021D] hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar y Enviar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Rechazar / Cancelar Pedido */}
      {cancelOrderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5 text-red-600 pb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Rechazar Pedido #{cancelOrderTarget.id}</h3>
                <p className="text-[11px] text-slate-500">Indica el motivo para notificar al cliente</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Motivo de Cancelación</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium focus:outline-none focus:border-red-500"
                >
                  <option value="Sin stock disponible para despacho inmediato">Sin stock disponible para despacho inmediato</option>
                  <option value="Comercio fuera de horario o en mantenimiento">Comercio fuera de horario o en mantenimiento</option>
                  <option value="Dirección fuera del radio de cobertura">Dirección fuera del radio de cobertura</option>
                  <option value="Comprobante de pago inválido o no verificado">Comprobante de pago inválido o no verificado</option>
                  <option value="Solicitud cancelada por el cliente">Solicitud cancelada por el cliente</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Nota personalizada (opcional)</label>
                <input
                  type="text"
                  placeholder="Detalles adicionales para el cliente..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelOrderTarget(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelOrderWithReason(cancelOrderTarget.id, cancelReason);
                  setCancelOrderTarget(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Imprimir Ticket Térmico / Comanda de Despacho (80mm) */}
      {printTicketOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-[#D4021D]" />
                Comanda Térmica (80mm)
              </span>
              <button
                type="button"
                onClick={() => setPrintTicketOrder(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recibo térmico con tipografía mono */}
            <div id="thermal-receipt" className="p-4 bg-amber-50/40 border border-slate-200 rounded-2xl font-mono text-[11px] text-slate-800 space-y-2 leading-relaxed">
              <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <h4 className="font-black text-xs uppercase">{biz?.name || 'CON FORCE MARKETPLACE'}</h4>
                <p className="text-[10px] text-slate-500">RIF: {biz?.rif || 'J-50123456-7'}</p>
                <p className="text-[10px] text-slate-500">{biz?.address || 'Caracas, Venezuela'}</p>
                <p className="text-[10px] font-bold text-[#D4021D] pt-0.5">ORDEN #{printTicketOrder.id}</p>
                <p className="text-[9px] text-slate-400">{printTicketOrder.createdAt}</p>
              </div>

              <div className="space-y-1 border-b border-dashed border-slate-300 pb-2">
                <p><strong>Cliente:</strong> {printTicketOrder.customerName}</p>
                <p><strong>Teléfono:</strong> {printTicketOrder.customerPhone}</p>
                <p><strong>Entrega:</strong> {printTicketOrder.deliveryType === 'delivery' ? '🛵 Domicilio' : '🏬 Retiro en Tienda'}</p>
                <p className="text-[10px]"><strong>Dirección:</strong> {printTicketOrder.deliveryAddress}</p>
                {printTicketOrder.notes && (
                  <p className="text-[10px] text-amber-900 bg-amber-100/60 p-1 rounded">
                    <strong>Nota:</strong> {printTicketOrder.notes}
                  </p>
                )}
              </div>

              <div className="space-y-1 border-b border-dashed border-slate-300 pb-2">
                <div className="font-bold text-[10px] flex justify-between border-b border-slate-200 pb-0.5">
                  <span>CANT / ARTÍCULO</span>
                  <span>PRECIO</span>
                </div>
                {printTicketOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.quantity}x {it.product.name}</span>
                    <span>Bs. {it.product.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 pt-1 text-right">
                <p>Subtotal: Bs. {printTicketOrder.subtotal}</p>
                <p>Delivery: Bs. {printTicketOrder.deliveryFee}</p>
                <p className="text-xs font-black text-slate-900 pt-1 border-t border-slate-300 flex justify-between">
                  <span>TOTAL A PAGAR:</span>
                  <span>Bs. {printTicketOrder.total}</span>
                </p>
                <p className="text-[10px] text-left pt-1">
                  <strong>Pago:</strong> {printTicketOrder.paymentMethod.replace('_', ' ').toUpperCase()}
                  {printTicketOrder.paymentReference && ` (Ref: ${printTicketOrder.paymentReference})`}
                </p>
              </div>

              <div className="text-center pt-2 text-[9px] text-slate-400 border-t border-dashed border-slate-300">
                ¡Gracias por su compra en ConForce Marketplace!
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPrintTicketOrder(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

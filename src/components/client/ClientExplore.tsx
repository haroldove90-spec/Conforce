import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Business, BusinessCategory, Product } from '../../types';
import { getBusinessScheduleStatus } from '../../utils/scheduleUtils';
import { ProductSearchComparator } from './ProductSearchComparator';
import {
  Search,
  Star,
  MapPin,
  Clock,
  MessageCircle,
  Flame,
  ShoppingBag,
  RefreshCw,
  Check,
  LocateFixed,
  Plus,
  Store,
  Map as MapIcon,
  Sparkles,
  SlidersHorizontal,
  Share2,
  User,
  ShieldCheck,
  Bike
} from 'lucide-react';
import { openWhatsAppDirect, buildProductWhatsAppOrderMessage } from '../../utils/urlUtils';

interface ClientExploreProps {
  onSelectBusiness: (biz: Business) => void;
  onOpenMapModule?: () => void;
  onOpenCart?: () => void;
}

export const ClientExplore: React.FC<ClientExploreProps> = ({
  onSelectBusiness,
  onOpenMapModule,
  onOpenCart
}) => {
  const {
    businesses,
    products,
    calculateDistance,
    openWhatsAppWithPrompt,
    injectMockData,
    userAddressLabel,
    detectUserLocation,
    isLocating,
    addToCart,
    cart,
    cartSubtotal,
    cartTotalCount,
    setActiveClientTab,
    currentUser,
    setIsClientAuthModalOpen,
    setClientAuthIntent,
    getMarketplaceShareUrl,
    openBusinessRegistration,
    openCorporateAuth,
    openDriverRegistration,
    isMockDataCleared,
    exchangeRateUsd
  } = useApp();

  const [viewMode, setViewMode] = useState<'businesses' | 'products' | 'comparator'>('businesses');
  const [activeCategory, setActiveCategory] = useState<'all' | BusinessCategory | 'offers'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [injectedToast, setInjectedToast] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [copiedLinkToast, setCopiedLinkToast] = useState(false);

  const handleCopyLink = () => {
    const url = getMarketplaceShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLinkToast(true);
      setTimeout(() => setCopiedLinkToast(false), 2000);
    }
  };

  const handleInjectData = () => {
    injectMockData();
    setInjectedToast(true);
    setTimeout(() => setInjectedToast(false), 3000);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedToast(product.name);
    setTimeout(() => setAddedToast(null), 2000);
  };

  const handleGoToMap = () => {
    if (onOpenMapModule) {
      onOpenMapModule();
    } else {
      setActiveClientTab('map');
    }
  };

  // Helper to determine price level badge ($ Bajo, $$ Medio, $$$ Alto)
  const getPriceBadge = (biz: Business) => {
    const bizProds = products.filter((p) => p.businessId === biz.id);
    if (bizProds.length === 0) return '$ Bajo';
    const avg = bizProds.reduce((s, p) => s + p.price, 0) / bizProds.length;
    if (avg < 90) return '$ Bajo';
    if (avg < 200) return '$$ Medio';
    return '$$$ Alto';
  };

  // Filtered & Distance-Sorted Businesses (Closest first)
  const sortedFilteredBusinesses = useMemo(() => {
    return businesses
      .filter((biz) => {
        if (!biz.isActive) return false;

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const inName = biz.name.toLowerCase().includes(q);
          const inAddress = biz.address.toLowerCase().includes(q);
          const inTags = biz.tags.some((t) => t.toLowerCase().includes(q));
          const hasMatchingProduct = products.some(
            (p) =>
              p.businessId === biz.id &&
              (p.name.toLowerCase().includes(q) ||
                p.tags.some((t) => t.toLowerCase().includes(q)) ||
                p.category.toLowerCase().includes(q))
          );
          if (!inName && !inAddress && !inTags && !hasMatchingProduct) return false;
        }

        if (activeCategory === 'all') return true;
        if (activeCategory === 'offers') {
          return products.some((p) => p.businessId === biz.id && p.isOfferOfTheDay);
        }
        const cat = (biz.category || '').toLowerCase();
        const f = activeCategory.toLowerCase();
        if (cat.includes(f)) return true;
        if (f === 'supermercado' && (cat.includes('víveres') || cat.includes('bodeg') || biz.tags.some(t => t.toLowerCase().includes('super')))) return true;
        if (f === 'farmacia' && (cat.includes('salud') || cat.includes('medic') || biz.tags.some(t => t.toLowerCase().includes('farma')))) return true;
        if (f === 'restaurante' && (cat.includes('comida') || cat.includes('gastronom') || biz.tags.some(t => t.toLowerCase().includes('comida')))) return true;
        if (f === 'tecnologia' && (cat.includes('celular') || cat.includes('computac') || cat.includes('electr') || biz.tags.some(t => t.toLowerCase().includes('tech')))) return true;
        if (f === 'moda' && (cat.includes('ropa') || cat.includes('calzado') || biz.tags.some(t => t.toLowerCase().includes('moda')))) return true;
        if (f === 'hogar' && (cat.includes('ferreter') || cat.includes('mueble') || biz.tags.some(t => t.toLowerCase().includes('hogar')))) return true;
        if (f === 'automotriz' && (cat.includes('repuesto') || cat.includes('taller') || cat.includes('auto') || biz.tags.some(t => t.toLowerCase().includes('auto')))) return true;
        if (f === 'servicios' && (cat.includes('servicio') || cat.includes('técnico') || biz.tags.some(t => t.toLowerCase().includes('servicio')))) return true;
        return cat === f;
      })
      .map((biz) => ({
        ...biz,
        distanceKm: calculateDistance(biz.coordinates),
        schedule: getBusinessScheduleStatus(biz.openingHours)
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm); // Closest first
  }, [businesses, products, searchQuery, activeCategory, calculateDistance]);

  // Filtered & Distance-Sorted Products (Closest first by store distance)
  const sortedFilteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        const parentBiz = businesses.find((b) => b.id === prod.businessId);
        if (!parentBiz || !parentBiz.isActive) return false;

        // Category filter
        if (activeCategory === 'offers' && !prod.isOfferOfTheDay) return false;
        if (activeCategory !== 'all' && activeCategory !== 'offers') {
          const cat = ((parentBiz.category || '') + ' ' + (prod.category || '')).toLowerCase();
          const f = activeCategory.toLowerCase();
          let match = cat.includes(f);
          if (f === 'supermercado' && (cat.includes('víveres') || cat.includes('bodeg') || prod.tags.some(t => t.toLowerCase().includes('super')))) match = true;
          if (f === 'farmacia' && (cat.includes('salud') || cat.includes('medic') || prod.tags.some(t => t.toLowerCase().includes('farma')))) match = true;
          if (f === 'restaurante' && (cat.includes('comida') || cat.includes('gastronom') || prod.tags.some(t => t.toLowerCase().includes('comida')))) match = true;
          if (f === 'tecnologia' && (cat.includes('celular') || cat.includes('computac') || cat.includes('electr') || prod.tags.some(t => t.toLowerCase().includes('tech')))) match = true;
          if (f === 'moda' && (cat.includes('ropa') || cat.includes('calzado') || prod.tags.some(t => t.toLowerCase().includes('moda')))) match = true;
          if (f === 'hogar' && (cat.includes('ferreter') || cat.includes('mueble') || prod.tags.some(t => t.toLowerCase().includes('hogar')))) match = true;
          if (f === 'automotriz' && (cat.includes('repuesto') || cat.includes('taller') || cat.includes('auto') || prod.tags.some(t => t.toLowerCase().includes('auto')))) match = true;
          if (f === 'servicios' && (cat.includes('servicio') || cat.includes('técnico') || prod.tags.some(t => t.toLowerCase().includes('servicio')))) match = true;
          if (!match) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const inName = prod.name.toLowerCase().includes(q);
          const inDesc = prod.description.toLowerCase().includes(q);
          const inCat = prod.category.toLowerCase().includes(q);
          const inTags = prod.tags.some((t) => t.toLowerCase().includes(q));
          const inBiz = parentBiz.name.toLowerCase().includes(q);
          if (!inName && !inDesc && !inCat && !inTags && !inBiz) return false;
        }

        return true;
      })
      .map((prod) => {
        const parentBiz = businesses.find((b) => b.id === prod.businessId)!;
        return {
          ...prod,
          business: parentBiz,
          schedule: getBusinessScheduleStatus(parentBiz.openingHours),
          distanceKm: calculateDistance(parentBiz.coordinates)
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm); // Closest first
  }, [products, businesses, searchQuery, activeCategory, calculateDistance]);

  const offersCount = products.filter((p) => p.isOfferOfTheDay).length;

  return (
    <div className="space-y-4 pb-24 md:pb-12 max-w-3xl mx-auto px-3 sm:px-4 bg-white">
      
      {/* 1. Minimalist Geolocation Bar with Direct Map Access Button */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#D4021D] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-slate-800 font-bold truncate">
              {userAddressLabel || 'Ubicación actual'}
            </p>
            <p className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4021D] inline-block" />
              <span>Ordenado por cercanía GPS</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={detectUserLocation}
            disabled={isLocating}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Recalcular distancia GPS"
          >
            <LocateFixed className={`w-3.5 h-3.5 text-[#D4021D] ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'GPS...' : 'Actualizar'}</span>
          </button>

          {/* Dedicated Button to View Map Module */}
          <button
            onClick={handleGoToMap}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#D4021D] hover:bg-[#b50218] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Ver ubicación de todas las tiendas en el mapa"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Ver Mapa</span>
          </button>
        </div>
      </div>



      {/* 2. Minimalist Search Bar with Intelligent Comparator Trigger */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar cualquier producto, comparar precios o tiendas (ej. café, celular, paracetamol, ropa, repuesto)..."
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-8 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D4021D] focus:bg-white transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs cursor-pointer p-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* 3. Category & Mode Switcher */}
      <div className="flex flex-col gap-2">
        {/* Toggle Mode: Negocios vs Productos vs Comparador */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shrink-0">
            <button
              onClick={() => setViewMode('businesses')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'businesses'
                  ? 'bg-white text-[#D4021D] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Negocios ({sortedFilteredBusinesses.length})</span>
            </button>

            <button
              onClick={() => setViewMode('products')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'products'
                  ? 'bg-white text-[#D4021D] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Productos ({sortedFilteredProducts.length})</span>
            </button>

            <button
              onClick={() => setViewMode('comparator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'comparator'
                  ? 'bg-[#D4021D] text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Comparador</span>
            </button>
          </div>

          <button
            onClick={handleGoToMap}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <MapIcon className="w-3.5 h-3.5 text-[#D4021D]" />
            <span>Módulo Mapa</span>
          </button>
        </div>

        {/* Categories Pills (when not in dedicated comparator mode) */}
        {viewMode !== 'comparator' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>

            <button
              onClick={() => setActiveCategory('supermercado')}
              className={`px-3 py-1.2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'supermercado'
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🛒 Supermercados
            </button>

            <button
              onClick={() => setActiveCategory('farmacia')}
              className={`px-3 py-1.2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'farmacia'
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              💊 Farmacias
            </button>

            <button
              onClick={() => setActiveCategory('restaurante')}
              className={`px-3 py-1.2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'restaurante'
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🍔 Restaurantes
            </button>

            <button
              onClick={() => setActiveCategory('tecnologia')}
              className={`px-3 py-1.2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'tecnologia'
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📱 Tecnología
            </button>

            <button
              onClick={() => setActiveCategory('moda')}
              className={`px-3 py-1.2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'moda'
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              👕 Moda & Ropa
            </button>

            <button
              onClick={() => setActiveCategory('automotriz')}
              className={`px-3 py-1.2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'automotriz'
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🚗 Automotriz
            </button>

            <button
              onClick={() => setActiveCategory('hogar')}
              className={`px-3 py-1.2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'hogar'
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🏠 Hogar & Ferretería
            </button>

            <button
              onClick={() => setActiveCategory('servicios')}
              className={`px-3 py-1.2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'servicios'
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🔧 Servicios
            </button>

            <button
              onClick={() => setActiveCategory('offers')}
              className={`px-3 py-1.2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                activeCategory === 'offers'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>Ofertas ({offersCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* Added to Cart Toast */}
      {addedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#D4021D]" />
          <span>¡{addedToast} agregado!</span>
        </div>
      )}

      {/* 4. MAIN CONTENT ROUTER: COMPARATOR VS BUSINESSES VITRINA VS PRODUCTS */}
      {viewMode === 'comparator' || (searchQuery.trim().length > 1 && viewMode !== 'businesses') ? (
        <ProductSearchComparator
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectBusiness={onSelectBusiness}
          onOpenCart={onOpenCart}
        />
      ) : viewMode === 'businesses' ? (
        <div className="space-y-2.5">
          {sortedFilteredBusinesses.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <Store className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">
                {businesses.length === 0
                  ? 'Aún no hay comercios registrados en el Marketplace'
                  : 'No hay comercios con estos filtros o búsqueda'}
              </p>
              {businesses.length === 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => openBusinessRegistration(true)}
                    className="px-3 py-1.5 bg-[#D4021D] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    + Registrar Comercio
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={handleInjectData}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Restaurar datos demo
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="mt-1 text-xs font-bold text-[#D4021D] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Limpiar búsqueda y filtros
                </button>
              )}
            </div>
          ) : (
            sortedFilteredBusinesses.map((biz) => {
              const priceLevel = getPriceBadge(biz);

              return (
                <div
                  key={biz.id}
                  onClick={() => onSelectBusiness(biz)}
                  className="bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/90 p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex flex-row items-center gap-3 cursor-pointer"
                >
                  {/* Left: Square Thumbnail Image */}
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                    <img
                      src={biz.bannerImage}
                      alt={biz.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {biz.logo && (
                      <div
                        className="absolute bottom-1 left-1 w-5 h-5 rounded-md flex items-center justify-center text-[10px] shadow-xs border border-white"
                        style={{ backgroundColor: biz.customPinColor || '#00D222' }}
                      >
                        {biz.logo}
                      </div>
                    )}
                  </div>

                  {/* Right: Minimalist Business Info with Live Schedule Status */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
                    
                    {/* Line 1: Name, Schedule Badge and Rating */}
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                        {biz.name}
                      </h4>
                      <div className="flex items-center gap-0.5 text-slate-700 text-xs font-bold shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{biz.rating}</span>
                      </div>
                    </div>

                    {/* Line 2: Schedule status pill & Distance */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <span className="font-bold text-[#D4021D]">{biz.distanceKm} km</span>
                        <span className="text-slate-300">·</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {biz.deliveryTime}
                        </span>
                      </div>

                      {/* Horario Detection Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${biz.schedule.badgeClass}`}
                        title={biz.schedule.detail}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${biz.schedule.dotColorClass}`} />
                        <span>{biz.schedule.label}</span>
                      </span>
                    </div>

                    {/* Line 3: Delivery Status + Price Pill ($ Bajo / $$ Medio) */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <span className="text-[#D4021D] font-bold">🛵 Envío</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-700 font-semibold">🏬 Retiro en tienda</span>
                      </div>

                      {/* Clean Neutral Pill Badge */}
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                        {priceLevel}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* PRODUCTS & SERVICES HORIZONTAL LIST */
        <div className="space-y-2.5">
          {sortedFilteredProducts.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-700">No hay productos disponibles</p>
            </div>
          ) : (
            sortedFilteredProducts.map((prod) => {
              const inCartQty = cart.find((i) => i.product.id === prod.id)?.quantity || 0;

              return (
                <div
                  key={prod.id}
                  onClick={() => onSelectBusiness(prod.business)}
                  className="bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/90 p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex flex-row items-center gap-3 cursor-pointer"
                >
                  {/* Left: Square Product Photo */}
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {prod.isOfferOfTheDay && (
                      <span className="absolute top-1 left-1 bg-amber-400 text-slate-950 font-black text-[8px] px-1 py-0.2 rounded uppercase">
                        Oferta
                      </span>
                    )}
                  </div>

                  {/* Right: Clean Product Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
                    
                    {/* Line 1: Name and Price */}
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        {prod.name}
                      </h4>
                      <span className="text-sm font-extrabold text-slate-900 shrink-0">
                        Bs. {prod.price}
                      </span>
                    </div>

                    {/* Line 2: Store, Distance & Schedule */}
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        <span className="text-[#D4021D] font-semibold truncate">{prod.business.name}</span>
                        <span className="text-slate-300">·</span>
                        <span className="font-medium text-[#D4021D] shrink-0">{prod.distanceKm} km</span>
                      </div>

                      <span className={`text-[10px] font-bold shrink-0 ${prod.schedule.textClass}`}>
                        {prod.schedule.label}
                      </span>
                    </div>

                    {/* Line 3: Delivery / Pickup info & Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                        <span>🛵 Envío o 🏬 Retiro</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const msg = buildProductWhatsAppOrderMessage({
                              productName: prod.name,
                              priceBs: prod.price,
                              priceUsd: exchangeRateUsd > 0 ? Number((prod.price / exchangeRateUsd).toFixed(2)) : undefined,
                              businessName: prod.business.name,
                              businessPhone: prod.business.whatsapp || prod.business.phone,
                              quantity: 1,
                              customerName: currentUser?.name,
                              customerAddress: userAddressLabel
                            });
                            openWhatsAppDirect(prod.business.whatsapp || prod.business.phone, msg);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 transition-all shadow-2xs cursor-pointer active:scale-95"
                          title="Pedir este producto directamente por WhatsApp al negocio"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={(e) => handleAddToCart(prod, e)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${
                            inCartQty > 0
                              ? 'bg-[#D4021D] text-white'
                              : 'bg-red-50 hover:bg-red-100 text-[#D4021D] border border-red-200'
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>{inCartQty > 0 ? `(${inCartQty}) Listo` : 'Agregar'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Floating WhatsApp Quick Action Button */}
      <div className="pt-2 text-center">
        <button
          onClick={() => openWhatsAppWithPrompt(searchQuery ? `¡Hola! 👋 Estoy buscando "${searchQuery}" en ConForce Marketplace y deseo hacer un pedido.` : '¡Hola ConForce! 👋 Quiero consultar opciones y hacer un pedido por WhatsApp.')}
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-4 py-2 rounded-2xl transition-all shadow-2xs cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>¿No encuentras lo que buscas? Pídelo directo por WhatsApp</span>
        </button>
      </div>

      {/* Floating Sticky Cart Bar when items in cart */}
      {cart.length > 0 && onOpenCart && (
        <div className="fixed bottom-16 md:bottom-6 left-3 right-3 md:left-auto md:right-8 md:w-96 z-40 animate-in fade-in slide-in-from-bottom-3">
          <button
            onClick={onOpenCart}
            className="w-full bg-[#000000] text-white hover:bg-slate-900 p-3 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-98"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#D4021D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {cartTotalCount}
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-extrabold truncate">Ver Carrito & Checkout</p>
                <p className="text-[10px] text-red-300 font-semibold">App Móvil o WhatsApp</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-black text-white">Bs. ${cartSubtotal}</span>
              <span className="text-xs bg-[#D4021D] hover:bg-[#b50218] text-white font-bold px-2.5 py-1 rounded-xl">
                Pedir →
              </span>
            </div>
          </button>
        </div>
      )}

    </div>
  );
};

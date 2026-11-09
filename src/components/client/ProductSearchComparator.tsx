import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Business, Product, DeliveryType } from '../../types';
import { getBusinessScheduleStatus } from '../../utils/scheduleUtils';
import {
  Search,
  MapPin,
  Clock,
  Star,
  Plus,
  Check,
  Navigation,
  ExternalLink,
  MessageCircle,
  Truck,
  Store,
  Sparkles,
  ArrowUpDown,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Bot,
  Zap
} from 'lucide-react';

interface ProductSearchComparatorProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectBusiness: (business: Business) => void;
  onOpenCart?: () => void;
}

export const ProductSearchComparator: React.FC<ProductSearchComparatorProps> = ({
  searchQuery,
  onSearchChange,
  onSelectBusiness,
  onOpenCart
}) => {
  const {
    products,
    businesses,
    calculateDistance,
    addToCart,
    cart,
    openExternalNavigation,
    openWhatsAppWithPrompt,
    recordFailedSearch,
    openWebAssistantWithPrompt
  } = useApp();

  // Mode: 'delivery' vs 'pickup'
  const [deliveryMode, setDeliveryMode] = useState<DeliveryType>('delivery');

  // Sorting: 'distance' | 'price' | 'rating' | 'speed'
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating' | 'speed'>('distance');

  // Filter by Open Stores Only
  const [onlyOpenStores, setOnlyOpenStores] = useState<boolean>(false);

  // Toast for added item
  const [addedItemToast, setAddedItemToast] = useState<string | null>(null);

  // Quick search keywords
  const popularKeywords = [
    { label: '💊 Paracetamol', query: 'paracetamol' },
    { label: '🍔 Hamburguesa', query: 'hamburguesa' },
    { label: '🍕 Pizza', query: 'pizza' },
    { label: '⚡ Suero Oral', query: 'suero' },
    { label: '🥤 Refrescos', query: 'refresco' },
    { label: '🌮 Tacos', query: 'tacos' },
    { label: '🧴 Bloqueador Solar', query: 'bloqueador' },
    { label: '☕ Café', query: 'cafe' }
  ];

  // Matched and enriched products across all stores
  const matchedProductEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results = [];

    for (const prod of products) {
      const parentBiz = businesses.find((b) => b.id === prod.businessId);
      if (!parentBiz || !parentBiz.isActive) continue;

      const schedule = getBusinessScheduleStatus(parentBiz.openingHours);

      if (onlyOpenStores && !schedule.isOpen) {
        continue;
      }

      // Check match in product name, tags, description, category or business name
      const inName = prod.name.toLowerCase().includes(q);
      const inDesc = prod.description.toLowerCase().includes(q);
      const inTags = prod.tags.some((t) => t.toLowerCase().includes(q));
      const inCat = prod.category.toLowerCase().includes(q);
      const inBiz = parentBiz.name.toLowerCase().includes(q);

      if (inName || inDesc || inTags || inCat || inBiz) {
        const distanceKm = calculateDistance(parentBiz.coordinates);
        const deliveryFee = deliveryMode === 'pickup' ? 0 : 35;
        const totalEstimatedPrice = prod.price + deliveryFee;

        // Parse delivery speed approx minutes
        const deliveryMinutes = parseInt(parentBiz.deliveryTime?.match(/\d+/)?.[0] || '25', 10);
        const pickupMinutes = Math.max(5, Math.round(deliveryMinutes * 0.5));

        results.push({
          product: prod,
          business: parentBiz,
          schedule,
          distanceKm,
          deliveryFee,
          totalEstimatedPrice,
          estimatedTime: deliveryMode === 'pickup' ? `${pickupMinutes} min (Retiro)` : `${deliveryMinutes} min (Envío)`,
          timeMinutes: deliveryMode === 'pickup' ? pickupMinutes : deliveryMinutes
        });
      }
    }

    if (results.length === 0) return [];

    // Find best price and closest distance among results for special badges
    const minPrice = Math.min(...results.map((r) => r.product.price));
    const minDistance = Math.min(...results.map((r) => r.distanceKm));

    const enriched = results.map((r) => ({
      ...r,
      isBestPrice: r.product.price === minPrice && results.length > 1,
      isClosest: r.distanceKm === minDistance && results.length > 1
    }));

    // Apply sorting
    enriched.sort((a, b) => {
      // Prioritize boosted / sponsored products
      if (a.product.isBoosted && !b.product.isBoosted) return -1;
      if (!a.product.isBoosted && b.product.isBoosted) return 1;

      if (sortBy === 'distance') {
        return a.distanceKm - b.distanceKm;
      }
      if (sortBy === 'price') {
        return a.product.price - b.product.price;
      }
      if (sortBy === 'rating') {
        return b.business.rating - a.business.rating;
      }
      if (sortBy === 'speed') {
        return a.timeMinutes - b.timeMinutes;
      }
      return 0;
    });

    return enriched;
  }, [searchQuery, products, businesses, calculateDistance, deliveryMode, onlyOpenStores, sortBy]);

  // Track failed/unmatched searches for the Demand Radar
  const lastLoggedQueryRef = useRef<string>('');
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length >= 3 && matchedProductEntries.length === 0) {
      const timer = setTimeout(() => {
        if (lastLoggedQueryRef.current.toLowerCase() !== trimmed.toLowerCase()) {
          lastLoggedQueryRef.current = trimmed;
          recordFailedSearch(trimmed);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, matchedProductEntries.length, recordFailedSearch]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedItemToast(product.name);
    setTimeout(() => setAddedItemToast(null), 2000);
  };

  const getInCartQuantity = (productId: string) => {
    return cart.find((i) => i.product.id === productId)?.quantity || 0;
  };

  return (
    <div className="space-y-3.5 animate-in fade-in">
      
      {/* 🌟 1. SELECTOR PRINCIPAL: RETIRO EN TIENDA VS ENVÍO A DOMICILIO */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4021D]" />
            <span>Modalidad de Compra</span>
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {deliveryMode === 'pickup' ? 'Ahorras costo de envío (Bs. 0)' : 'Envío directo a tu puerta'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Opción A: Envío a Domicilio */}
          <button
            onClick={() => setDeliveryMode('delivery')}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
              deliveryMode === 'delivery'
                ? 'bg-white border-[#D4021D] text-slate-900 shadow-2xs ring-1 ring-[#D4021D]'
                : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <Truck className={`w-4 h-4 ${deliveryMode === 'delivery' ? 'text-[#D4021D]' : 'text-slate-500'}`} />
            <div className="text-left">
              <p className="text-xs font-bold leading-tight">Envío a Domicilio</p>
              <p className="text-[10px] text-slate-500">+ Bs. 35 entrega</p>
            </div>
          </button>

          {/* Opción B: Retiro en Tienda / Auto-recogida */}
          <button
            onClick={() => setDeliveryMode('pickup')}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
              deliveryMode === 'pickup'
                ? 'bg-white border-[#D4021D] text-slate-900 shadow-2xs ring-1 ring-[#D4021D]'
                : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <Store className={`w-4 h-4 ${deliveryMode === 'pickup' ? 'text-[#D4021D]' : 'text-slate-500'}`} />
            <div className="text-left">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold leading-tight">Retiro en Tienda</p>
                <span className="text-[9px] bg-red-50 text-[#D4021D] font-extrabold px-1 rounded">Gratis</span>
              </div>
              <p className="text-[10px] text-slate-500">Recoge tú mismo</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. SUGERENCIAS RÁPIDAS DE BÚSQUEDA */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold text-slate-600">Búsquedas populares para comparar tiendas:</p>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {popularKeywords.map((item) => (
            <button
              key={item.query}
              onClick={() => onSearchChange(item.query)}
              className={`px-3 py-1.2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                searchQuery.toLowerCase() === item.query
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. BARRA DE CONTROL DE FILTROS & ORDENAMIENTO */}
      {searchQuery.trim() && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4021D]" />
            <span>
              {matchedProductEntries.length}{' '}
              {matchedProductEntries.length === 1 ? 'opción encontrada' : 'opciones comparadas en tiendas cercanas'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Solo abiertos switch */}
            <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 cursor-pointer bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={onlyOpenStores}
                onChange={(e) => setOnlyOpenStores(e.target.checked)}
                className="accent-[#D4021D] w-3 h-3 cursor-pointer"
              />
              <span>Solo Abiertos</span>
            </label>

            {/* Selector de ordenamiento */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="distance">📍 Más Cercano</option>
                <option value="price">💵 Mejor Precio</option>
                <option value="speed">⚡ Más Rápido</option>
                <option value="rating">⭐ Mejor Calificación</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {addedItemToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#D4021D]" />
          <span>¡{addedItemToast} agregado!</span>
        </div>
      )}

      {/* 4. RESULTADOS COMPARADOS: MATRIZ Y LISTA DE TIENDAS CERCANAS */}
      {searchQuery.trim() && (
        <div className="space-y-2.5">
          {matchedProductEntries.length === 0 ? (
            <div className="p-6 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mx-auto border border-amber-200 shadow-xs">
                🔍
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#D4021D] text-[11px] font-extrabold border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-[#D4021D] animate-ping" />
                  <span>Registrado en Radar de Demanda</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  No encontramos productos o servicios con "{searchQuery}"
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  ¡Tu búsqueda ha sido guardada! Nuestro equipo comercial analiza el{' '}
                  <strong className="text-slate-900 font-semibold">Radar de Demanda</strong> para afiliar nuevos comercios o incorporar este producto a las tiendas locales.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={() =>
                    openWebAssistantWithPrompt(
                      `Hola, busqué "${searchQuery}" en el marketplace y no lo encontré. ¿Me puedes sugerir alternativas o comercios similares?`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D4021D] hover:bg-[#b50218] text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-98 cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Preguntar al Asistente Virtual</span>
                </button>

                <button
                  onClick={() =>
                    openWhatsAppWithPrompt(`Hola, estoy buscando "${searchQuery}" en tiendas cercanas y no apareció en el marketplace.`)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#D4021D]" />
                  <span>Consultar por WhatsApp</span>
                </button>
              </div>

              {/* Suggestions */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Búsquedas populares disponibles:
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {popularKeywords.slice(0, 5).map((kw) => (
                    <button
                      key={kw.query}
                      onClick={() => onSearchChange(kw.query)}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-red-50 hover:text-[#D4021D] border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-all cursor-pointer"
                    >
                      {kw.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            matchedProductEntries.map(({ product, business, schedule, distanceKm, deliveryFee, totalEstimatedPrice, estimatedTime, isBestPrice, isClosest }) => {
              const inCartQty = getInCartQuantity(product.id);

              return (
                <div
                  key={`${business.id}-${product.id}`}
                  className={`bg-white rounded-2xl border p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-2.5 ${
                    isBestPrice
                      ? 'border-red-400/80 ring-1 ring-red-400/30'
                      : 'border-slate-200/90'
                  }`}
                >
                  {/* Top Bar: Store identity + Schedule Status + Distance */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div
                      onClick={() => onSelectBusiness(business)}
                      className="flex items-center gap-2 min-w-0 cursor-pointer group"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-2xs shrink-0 border border-white"
                        style={{ backgroundColor: business.customPinColor || '#D4021D' }}
                      >
                        {business.logo}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate group-hover:text-[#D4021D]">
                            {business.name}
                          </h4>
                          {business.isVerified && (
                            <span className="text-[10px] text-[#D4021D] font-bold">✓</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{business.address}</p>
                      </div>
                    </div>

                    {/* Schedule Badge (Abierto / Cierra Pronto / Cerrado) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${schedule.badgeClass}`}
                        title={schedule.detail}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${schedule.dotColorClass}`} />
                        <span>{schedule.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Middle Body: Product Info & Side-by-Side Comparison Metrics */}
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                            {product.name}
                          </h5>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{product.description}</p>
                        </div>
                      </div>

                      {/* Comparison Badges Row */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {product.isBoosted && (
                          <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                            <Zap className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                            Patrocinado
                          </span>
                        )}
                        {isBestPrice && (
                          <span className="bg-red-50 text-[#D4021D] text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 border border-red-200">
                            🏆 Mejor Precio
                          </span>
                        )}
                        {isClosest && (
                          <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                            📍 Más Cercano
                          </span>
                        )}
                        {product.isOfferOfTheDay && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                            Oferta del día
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Strip: Price Breakdown & Buy Action */}
                  <div className="bg-slate-50 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 border border-slate-100">
                    
                    {/* Price and Distance Breakdown */}
                    <div className="flex items-center gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-600 font-semibold block leading-none">
                          Precio Producto
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-sm sm:text-base font-black text-slate-900">
                            Bs. {product.price}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              Bs. {product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="h-6 w-px bg-slate-200" />

                      <div>
                        <span className="text-[10px] text-slate-600 font-semibold block leading-none">
                          {deliveryMode === 'pickup' ? 'Retiro en Tienda' : 'Entrega a Domicilio'}
                        </span>
                        <div className="flex items-center gap-1 text-slate-700 font-bold text-xs mt-0.5">
                          <MapPin className="w-3 h-3 text-[#D4021D]" />
                          <span>{distanceKm} km</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-[11px] text-slate-600">{estimatedTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      
                      {/* Navigation Shortcut */}
                      <button
                        onClick={() => openExternalNavigation(business.coordinates, 'google_maps')}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold shadow-2xs cursor-pointer"
                        title="Ver ruta para recoger en Google Maps"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#D4021D]" />
                      </button>

                      {/* WhatsApp Inquiry */}
                      <button
                        onClick={() => openWhatsAppWithPrompt(`Hola ${business.name}, ¿tienen disponible "${product.name}" (Bs. ${product.price})?`, business.id)}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold shadow-2xs cursor-pointer"
                        title="Consultar por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#D4021D]" />
                      </button>

                      {/* Add To Cart / Buy Button */}
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                          inCartQty > 0
                            ? 'bg-[#D4021D] text-white'
                            : 'bg-[#D4021D] hover:bg-[#b50218] text-white'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{inCartQty > 0 ? `(${inCartQty}) Agregado` : 'Comprar aquí'}</span>
                      </button>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};

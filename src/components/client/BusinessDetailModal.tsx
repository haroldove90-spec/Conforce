import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Business, Product, ProductVariantOption, SelectedExtra } from '../../types';
import { getBusinessScheduleStatus } from '../../utils/scheduleUtils';
import {
  X,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  ExternalLink,
  Plus,
  Minus,
  Check,
  Flame,
  ShoppingBag,
  Share2,
  Truck,
  Store,
  Utensils,
  Layers,
  ChefHat,
  Camera,
  DollarSign
} from 'lucide-react';
import { openWhatsAppDirect, buildProductWhatsAppOrderMessage } from '../../utils/urlUtils';

interface BusinessDetailModalProps {
  business: Business;
  onClose: () => void;
  onOpenCart: () => void;
}

export const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({
  business,
  onClose,
  onOpenCart
}) => {
  const {
    products,
    addToCart,
    cart,
    calculateDistance,
    openExternalNavigation,
    openWhatsAppWithPrompt,
    exchangeRateUsd,
    formatCurrency,
    userAddressLabel,
    currentUser,
    requestProductOrder
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Customization drawer state
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [selectedVariantOpt, setSelectedVariantOpt] = useState<ProductVariantOption | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);
  const [kitchenNotes, setKitchenNotes] = useState<string>('');
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  const openCustomizeModal = (prod: Product) => {
    setCustomizingProduct(prod);
    // default to first variant option if any
    if (prod.hasVariants && prod.variants?.[0]?.options?.length) {
      setSelectedVariantOpt(prod.variants[0].options[0]);
    } else {
      setSelectedVariantOpt(null);
    }
    setSelectedExtras([]);
    setKitchenNotes('');
    setActivePhotoIdx(0);
  };

  const calculateCustomizedPrice = (prod: Product) => {
    const variantDelta = selectedVariantOpt?.priceDelta || 0;
    const extrasSum = selectedExtras.reduce((s, e) => s + e.price, 0);
    return prod.price + variantDelta + extrasSum;
  };

  const bizProducts = products.filter((p) => p.businessId === business.id);

  const categories = ['all', ...Array.from(new Set(bizProducts.map((p) => p.category)))];

  const filteredProducts = bizProducts.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const getCartQuantity = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const handleShare = () => {
    const deepUrl = `${window.location.origin}/?view=business&id=${business.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(deepUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full h-full md:h-[90vh] md:max-w-3xl bg-white text-slate-900 flex flex-col md:rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Banner with close & action buttons */}
        <div className="relative h-44 md:h-56 w-full shrink-0 bg-slate-100">
          <img
            src={business.bannerImage}
            alt={business.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-black/20" />

          {/* Top Actions */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-900 backdrop-blur-md border border-slate-200 transition-all shadow-xs cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-1 p-2 px-3 rounded-full bg-white/90 hover:bg-white text-slate-900 text-xs font-semibold backdrop-blur-md border border-slate-200 transition-all shadow-xs cursor-pointer"
                title="Copiar Deep Link"
              >
                <Share2 className="w-3.5 h-3.5 text-[#D4021D]" />
                <span>{copiedLink ? '¡Copiado!' : 'Compartir'}</span>
              </button>
            </div>
          </div>

          {/* Business Info Header */}
          <div className="absolute -bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="flex items-end gap-3">
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-xl border-2 border-white"
                style={{ backgroundColor: business.customPinColor || '#D4021D' }}
              >
                {business.logo}
              </div>
              <div className="pb-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#D4021D] text-white font-extrabold text-[10px] uppercase shadow-xs">
                    {business.category === 'farmacia' ? '💊 Farmacia' : '🍔 Restaurante'}
                  </span>
                  {business.isVerified && (
                    <span className="text-[10px] text-red-400 font-bold bg-slate-900/70 px-1.5 py-0.5 rounded-full backdrop-blur-xs">✓ Verificado</span>
                  )}
                </div>
                <h2 className="text-lg md:text-xl font-black text-white truncate drop-shadow">
                  {business.name}
                </h2>
              </div>
            </div>

            <div className="bg-white/95 border border-slate-200 px-3 py-1.5 rounded-xl text-center shrink-0 shadow-md">
              <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{business.rating}</span>
              </div>
              <span className="text-[10px] text-slate-600 font-medium">
                {calculateDistance(business.coordinates)} km
              </span>
            </div>
          </div>
        </div>

        {/* Quick Contact & Navigation Toolbar */}
        {(() => {
          const schedule = getBusinessScheduleStatus(business.openingHours);
          return (
            <div className="mt-6 px-4 pt-3 pb-3 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Dynamic Schedule Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${schedule.badgeClass}`}
                  title={schedule.detail}
                >
                  <span className={`w-2 h-2 rounded-full ${schedule.dotColorClass}`} />
                  <span>{schedule.label}</span>
                  <span className="text-[10px] opacity-80 font-normal">({business.openingHours})</span>
                </span>

                <span className="hidden sm:inline text-slate-300">·</span>

                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="text-[#D4021D] font-bold">🛵 A Domicilio</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-800 font-semibold">🏬 Retiro en tienda</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openExternalNavigation(business.coordinates, 'google_maps')}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#D4021D]" />
                  <span>Google Maps</span>
                </button>
                <button
                  onClick={() => openExternalNavigation(business.coordinates, 'waze')}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                  <span>Waze</span>
                </button>
                <button
                  onClick={() => {
                    const bizPhone = business.whatsapp || business.phone;
                    const msg = `¡Hola *${business.name}*! 👋 Vi su comercio en ConForce Marketplace y deseo consultar su catálogo o realizar un pedido.`;
                    openWhatsAppDirect(bizPhone, msg);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  title="Contactar al WhatsApp del Negocio"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Product Category Filter Pills */}
        <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-100 shrink-0 bg-white">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'Todos los productos' : cat}
            </button>
          ))}
        </div>

        {/* Products Grid / Catalog */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>No hay productos en esta categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredProducts.map((prod) => {
                const qty = getCartQuantity(prod.id);
                return (
                  <div
                    key={prod.id}
                    className="flex gap-3 p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all shadow-xs"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                      {prod.isOfferOfTheDay && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[8px] rounded uppercase flex items-center gap-0.5 shadow-xs">
                          <Flame className="w-2.5 h-2.5 fill-slate-950" /> Oferta
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                          {prod.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {prod.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-extrabold text-slate-900 text-sm">
                              Bs. {prod.price}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded border border-emerald-100">
                              ${(exchangeRateUsd > 0 ? (prod.price / exchangeRateUsd).toFixed(2) : '0')} USD
                            </span>
                          </div>
                          {prod.originalPrice && (
                            <span className="text-[10px] text-slate-400 line-through">
                              Bs. {prod.originalPrice}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Botón directo para solicitar por WhatsApp al negocio */}
                          <button
                            type="button"
                            onClick={() => {
                              requestProductOrder({
                                productName: prod.name,
                                priceBs: prod.price,
                                priceUsd: exchangeRateUsd > 0 ? Number((prod.price / exchangeRateUsd).toFixed(2)) : undefined,
                                businessName: business.name,
                                businessPhone: business.whatsapp || business.phone,
                                quantity: qty > 0 ? qty : 1
                              });
                            }}
                            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                            title="Solicitar este producto directamente por WhatsApp al negocio"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                            <span>WhatsApp</span>
                          </button>

                          {/* If product has variants, ingredients or extras, open customizer modal */}
                          {(prod.hasVariants || (prod.extras && prod.extras.length > 0) || (prod.ingredients && prod.ingredients.length > 0)) ? (
                            <button
                              onClick={() => openCustomizeModal(prod)}
                              className="flex items-center gap-1 bg-red-50 hover:bg-[#D4021D] text-[#D4021D] hover:text-white border border-red-200 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
                            >
                              <Utensils className="w-3 h-3" />
                              <span>Personalizar</span>
                            </button>
                          ) : (
                            /* Cart Controls for simple products */
                            qty > 0 ? (
                              <div className="flex items-center gap-2 bg-[#D4021D] text-white px-2 py-1 rounded-xl shadow-xs">
                                <button
                                  onClick={() => addToCart(prod, -1)}
                                  className="p-0.5 hover:opacity-80 active:scale-95 cursor-pointer"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold min-w-[14px] text-center">
                                  {qty}
                                </span>
                                <button
                                  onClick={() => addToCart(prod, 1)}
                                  className="p-0.5 hover:opacity-80 active:scale-95 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(prod, 1)}
                                className="flex items-center gap-1 bg-red-50 hover:bg-[#D4021D] text-[#D4021D] hover:text-white border border-red-200 px-3 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Agregar</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Cart Shortcut bar if items exist */}
        {cart.length > 0 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-600 font-medium">Total en Carrito:</span>
              <p className="font-black text-slate-900 text-base">
                Bs. {cart.reduce((s, i) => s + (i.itemTotalBs ?? i.product.price) * i.quantity, 0)}{' '}
                <span className="text-xs text-emerald-600 font-bold">
                  (${exchangeRateUsd > 0 ? (cart.reduce((s, i) => s + (i.itemTotalBs ?? i.product.price) * i.quantity, 0) / exchangeRateUsd).toFixed(2) : '0'} USD)
                </span>
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="flex items-center gap-2 bg-[#D4021D] hover:bg-[#b50218] text-white font-bold py-2.5 px-5 rounded-2xl shadow-md shadow-red-600/25 text-xs transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver Carrito & Checkout</span>
            </button>
          </div>
        )}

      </div>

      {/* CUSTOMIZE PRODUCT MODAL (Variants, Ingredients, Extras & Kitchen Notes) */}
      {customizingProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-red-100 text-[#D4021D] flex items-center justify-center font-bold">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                    {customizingProduct.name}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Personaliza tu pedido a tu gusto
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomizingProduct(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Product Photos Carousel / Preview */}
              {(() => {
                const photos = [customizingProduct.image, ...(customizingProduct.images || [])].filter(Boolean);
                const currentPhoto = photos[activePhotoIdx] || photos[0];
                return (
                  <div className="space-y-2">
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={currentPhoto} alt={customizingProduct.name} className="w-full h-full object-cover" />
                      {customizingProduct.isOfferOfTheDay && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] rounded-lg uppercase shadow-xs flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-slate-950" /> Oferta del Día
                        </span>
                      )}
                    </div>
                    {photos.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {photos.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                              activePhotoIdx === idx ? 'border-[#D4021D] scale-105' : 'border-slate-200 opacity-70'
                            }`}
                          >
                            <img src={p} alt={`Foto ${idx}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Description & Badges */}
              <div className="space-y-1.5">
                <p className="text-slate-600 text-xs leading-relaxed">
                  {customizingProduct.description}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {customizingProduct.preparationTime && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-lg border border-slate-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D4021D]" />
                      Prep: {customizingProduct.preparationTime}
                    </span>
                  )}
                  {customizingProduct.foodTags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-amber-50 text-amber-900 font-bold text-[10px] rounded-lg border border-amber-200"
                    >
                      {tag === 'picante' ? '🌶️ Picante' : tag === 'vegetariano' ? '🌱 Vegetariano' : tag === 'sin_gluten' ? '🌾 Sin Gluten' : tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ingredientes de la Receta */}
              {customizingProduct.ingredients && customizingProduct.ingredients.length > 0 && (
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-amber-900 flex items-center gap-1">
                    <ChefHat className="w-3.5 h-3.5 text-amber-700" />
                    Ingredientes del Platillo:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {customizingProduct.ingredients.map((ing, idx) => (
                      <span key={idx} className="bg-white text-slate-700 px-2 py-0.5 rounded-lg border border-amber-200/80 font-medium text-[11px]">
                        • {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selector de Variantes (Tamaños, Tallas, Presentaciones) */}
              {customizingProduct.hasVariants && customizingProduct.variants?.[0]?.options && (
                <div className="space-y-2">
                  <label className="text-slate-700 text-xs font-black uppercase flex items-center justify-between">
                    <span>Selecciona {customizingProduct.variants[0].name || 'Opción'}:</span>
                    <span className="text-red-600 text-[10px] font-bold">* Requerido</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {customizingProduct.variants[0].options.map((opt) => {
                      const isSelected = selectedVariantOpt?.id === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedVariantOpt(opt)}
                          className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-red-50 border-[#D4021D] ring-2 ring-red-500/30'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <span className="font-extrabold text-slate-900 text-xs block">{opt.label}</span>
                            <span className={`text-[10px] font-bold ${opt.priceDelta >= 0 ? 'text-[#D4021D]' : 'text-blue-600'}`}>
                              {opt.priceDelta >= 0 ? `+Bs. ${opt.priceDelta}` : `-Bs. ${Math.abs(opt.priceDelta)}`}
                              {exchangeRateUsd > 0 && ` (${opt.priceDelta >= 0 ? '+' : '-'}$${(Math.abs(opt.priceDelta) / exchangeRateUsd).toFixed(2)} USD)`}
                            </span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#D4021D] bg-[#D4021D]' : 'border-slate-300'}`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Adicionales y Extras Personalizables */}
              {customizingProduct.extras && customizingProduct.extras.length > 0 && (
                <div className="space-y-2">
                  <label className="text-slate-700 text-xs font-black uppercase flex items-center justify-between">
                    <span>Extras y Adicionales Disponibles:</span>
                    <span className="text-slate-400 text-[10px]">Opcional</span>
                  </label>
                  <div className="space-y-1.5">
                    {customizingProduct.extras.map((extra) => {
                      const isChecked = selectedExtras.some(e => e.id === extra.id);
                      return (
                        <div
                          key={extra.id}
                          onClick={() => {
                            setSelectedExtras(prev =>
                              isChecked
                                ? prev.filter(e => e.id !== extra.id)
                                : [...prev, { id: extra.id, name: extra.name, price: extra.price }]
                            );
                          }}
                          className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-red-50/50 border-[#D4021D]'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 accent-[#D4021D] pointer-events-none"
                            />
                            <span className="font-semibold text-slate-800 text-xs">{extra.name}</span>
                          </div>
                          <span className="font-black text-[#D4021D] text-xs">
                            +Bs. {extra.price}{' '}
                            <span className="text-[10px] text-slate-400 font-normal">
                              (${exchangeRateUsd > 0 ? (extra.price / exchangeRateUsd).toFixed(2) : '0'} USD)
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notas de Cocina para el Restaurante / Comercio */}
              <div className="space-y-1">
                <label className="text-slate-700 text-[10px] uppercase font-bold">
                  Instrucciones Especiales para el Chef / Despacho:
                </label>
                <input
                  type="text"
                  value={kitchenNotes}
                  onChange={(e) => setKitchenNotes(e.target.value)}
                  placeholder="Ej: Sin cebolla, salsa tártara aparte, carne bien cocida..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#D4021D]"
                />
              </div>
            </div>

            {/* Modal Footer with Calculated Total */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Precio Final del Artículo</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-slate-900">
                    Bs. {calculateCustomizedPrice(customizingProduct)}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-100">
                    ${(exchangeRateUsd > 0 ? (calculateCustomizedPrice(customizingProduct) / exchangeRateUsd).toFixed(2) : '0')} USD
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const priceBs = calculateCustomizedPrice(customizingProduct);
                    const priceUsd = exchangeRateUsd > 0 ? Number((priceBs / exchangeRateUsd).toFixed(2)) : undefined;
                    const variantText = selectedVariantOpt ? `${customizingProduct.variants?.[0]?.name || 'Variante'}: ${selectedVariantOpt.label}` : undefined;
                    const extrasList = selectedExtras.map(e => `${e.name} (+Bs. ${e.price})`);
                    if (kitchenNotes.trim()) {
                      extrasList.push(`Notas: "${kitchenNotes.trim()}"`);
                    }

                    requestProductOrder({
                      productName: customizingProduct.name,
                      priceBs,
                      priceUsd,
                      businessName: business.name,
                      businessPhone: business.whatsapp || business.phone,
                      quantity: 1,
                      variantLabel: variantText,
                      extras: extrasList.length > 0 ? extrasList : undefined
                    });
                    setCustomizingProduct(null);
                  }}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer text-xs"
                  title="Enviar pedido personalizado directamente al WhatsApp del negocio"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Pedir por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    addToCart(customizingProduct, 1, {
                      selectedVariantOption: selectedVariantOpt ? {
                        variantName: customizingProduct.variants?.[0]?.name || 'Variante',
                        optionLabel: selectedVariantOpt.label,
                        priceDelta: selectedVariantOpt.priceDelta
                      } : undefined,
                      selectedExtras: selectedExtras.length > 0 ? selectedExtras : undefined,
                      kitchenNotes: kitchenNotes.trim() || undefined
                    });
                    setCustomizingProduct(null);
                  }}
                  className="flex items-center gap-1.5 bg-[#D4021D] hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar al Carrito</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

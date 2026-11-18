import React, { useState } from 'react';
import { Business, Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { getBusinessScheduleStatus } from '../../utils/scheduleUtils';
import { resolveProductImage, buildSafeProductPlaceholder } from '../../utils/imageUtils';
import {
  Eye,
  ExternalLink,
  Share2,
  Check,
  Plus,
  Edit2,
  Package,
  MapPin,
  Clock,
  Star,
  Flame,
  Zap,
  MessageCircle,
  Search
} from 'lucide-react';
import { formatVenezuelanWhatsAppNumber } from '../../utils/urlUtils';

interface SellerShowcaseTabProps {
  biz: Business;
  bizProducts: Product[];
  onOpenNewProduct: () => void;
  onEditProduct: (prod: Product) => void;
}

export const SellerShowcaseTab: React.FC<SellerShowcaseTabProps> = ({
  biz,
  bizProducts,
  onOpenNewProduct,
  onEditProduct
}) => {
  const { setSelectedBusinessForDetail, formatCurrency } = useApp();
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [copiedStoreLink, setCopiedStoreLink] = useState(false);

  const schedule = getBusinessScheduleStatus(biz.openingHours);
  const categories = ['all', ...Array.from(new Set(bizProducts.map((p) => p.category || 'General')))];

  const offeredProducts = bizProducts.filter((p) => {
    if (showOnlyAvailable && (!p.inStock || p.stockCount <= 0)) return false;
    if (selectedCat !== 'all' && (p.category || 'General') !== selectedCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const storeDirectUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?view=business&id=${biz.id}`
      : `https://venezuela-iota.vercel.app/?view=business&id=${biz.id}`;

  const handleCopyStoreLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(storeDirectUrl);
      setCopiedStoreLink(true);
      setTimeout(() => setCopiedStoreLink(false), 2200);
    }
  };

  const whatsappCatalogText = encodeURIComponent(
    `🛍️ ¡Visita el catálogo online de *${biz.name}* en ConForce Marketplace!\n📍 ${biz.address}\n🔥 ${offeredProducts.length} productos disponibles ahora:\n👉 ${storeDirectUrl}`
  );

  return (
    <div className="space-y-5">
      {/* Header & Share Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-3xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#D4021D]" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Mi Vitrina: Productos que Estás Ofreciendo
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Así ven los clientes tu tienda y los productos disponibles en tiempo real dentro del Marketplace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyStoreLink}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              copiedStoreLink
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
            }`}
          >
            {copiedStoreLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-[#D4021D]" />}
            <span>{copiedStoreLink ? '¡Link de Tienda Copiado!' : 'Copiar Link de Mi Tienda'}</span>
          </button>

          <a
            href={`https://wa.me/?text=${whatsappCatalogText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Compartir Catálogo</span>
          </a>

          <button
            type="button"
            onClick={() => setSelectedBusinessForDetail(biz)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-black text-white shadow-xs transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir Vista Cliente</span>
          </button>
        </div>
      </div>

      {/* Storefront Preview Banner */}
      <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="relative h-36 sm:h-44 bg-slate-900">
          {biz.bannerImage && (
            <img
              src={biz.bannerImage}
              alt={biz.name}
              className="w-full h-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3 text-white">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 border-white shadow-lg shrink-0"
                style={{ backgroundColor: biz.customPinColor || '#D4021D' }}
              >
                {biz.logo}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-base sm:text-lg truncate">{biz.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${schedule.badgeClass}`}>
                    {schedule.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-200 flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#D4021D]" /> {biz.address}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {biz.rating.toFixed(1)}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {biz.openingHours}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search inside Showcase */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                  selectedCat === cat
                    ? 'bg-[#D4021D] text-white border-[#D4021D] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' ? `Todos (${bizProducts.length})` : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en mi vitrina..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#D4021D]"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border whitespace-nowrap cursor-pointer ${
                showOnlyAvailable
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {showOnlyAvailable ? 'Solo En Stock' : 'Incl. Agotados'}
            </button>
          </div>
        </div>

        {/* Offered Products Grid */}
        <div className="p-4">
          {offeredProducts.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <Package className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">
                  {bizProducts.length === 0
                    ? 'Aún no estás ofreciendo productos en tu vitrina'
                    : 'No hay productos visibles con este filtro'}
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {bizProducts.length === 0
                    ? 'Da de alta tu primer producto con foto, precio en Bolívares y Dólares para que los clientes puedan pedirlo.'
                    : 'Prueba activando productos agotados o cambiando el filtro de categoría.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenNewProduct}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D4021D] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Dar de Alta Producto</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {offeredProducts.map((prod) => {
                const currency = formatCurrency(prod.price);
                const isAvailable = prod.inStock && prod.stockCount > 0;
                const waUrl = `https://wa.me/${formatVenezuelanWhatsAppNumber(biz.whatsapp || biz.phone)}?text=${encodeURIComponent(
                  `Hola ${biz.name}, me interesa *${prod.name}* (${currency.formatted}).`
                )}`;

                return (
                  <div
                    key={prod.id}
                    className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                      isAvailable
                        ? 'bg-white border-slate-200 hover:border-red-300 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="relative h-36 bg-slate-100">
                        <img
                          src={resolveProductImage(prod.image, prod.images, prod.name)}
                          alt={prod.name}
                          onError={(e) => {
                            e.currentTarget.src = buildSafeProductPlaceholder(prod.name);
                          }}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          {prod.isBoosted && (
                            <span className="px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-black flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Destacado
                            </span>
                          )}
                          {prod.isOfferOfTheDay && (
                            <span className="px-2 py-0.5 rounded-md bg-[#D4021D] text-white text-[10px] font-black flex items-center gap-1">
                              <Flame className="w-3 h-3" /> Oferta
                            </span>
                          )}
                        </div>
                        <span
                          className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isAvailable
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {isAvailable ? `${prod.stockCount} disp.` : 'Agotado'}
                        </span>
                      </div>

                      <div className="p-3 space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase text-[#D4021D]">
                          {prod.category}
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm line-clamp-1">
                          {prod.name}
                        </h5>
                        <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                          {prod.description || 'Producto disponible para envío o retiro en tienda.'}
                        </p>
                        <div className="flex items-baseline gap-2 pt-1 flex-wrap">
                          <span className="text-sm font-black text-[#D4021D] tabular-nums">
                            {currency.bs}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 tabular-nums">
                            {currency.usd}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-3 pb-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Probar Link WA</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => onEditProduct(prod)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

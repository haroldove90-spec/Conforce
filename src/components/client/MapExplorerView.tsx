import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Business, BusinessCategory } from '../../types';
import { InteractiveMap } from '../map/InteractiveMap';
import {
  MapPin,
  Store,
  LocateFixed,
  Flame,
  ArrowLeft,
  Navigation,
  ExternalLink,
  MessageCircle,
  ShoppingBag
} from 'lucide-react';

interface MapExplorerViewProps {
  onSelectBusiness: (biz: Business) => void;
  onBackToExplore?: () => void;
  onOpenCart?: () => void;
}

export const MapExplorerView: React.FC<MapExplorerViewProps> = ({
  onSelectBusiness,
  onBackToExplore,
  onOpenCart
}) => {
  const {
    businesses,
    products,
    userLocation,
    userAddressLabel,
    detectUserLocation,
    isLocating,
    openExternalNavigation,
    openWhatsAppWithPrompt,
    cart,
    cartSubtotal,
    cartTotalCount
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | BusinessCategory | 'offers'>('all');
  const [selectedMapBiz, setSelectedMapBiz] = useState<Business | null>(null);

  const offersCount = products.filter((p) => p.isOfferOfTheDay).length;

  const handleMarkerClick = (biz: Business) => {
    setSelectedMapBiz(biz);
  };

  return (
    <div className="space-y-3 pb-24 md:pb-12 max-w-4xl mx-auto px-3 sm:px-4 bg-white">
      
      {/* Top Header with Back button and GPS Info */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          {onBackToExplore && (
            <button
              onClick={onBackToExplore}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              title="Volver a la lista de tiendas"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-5 h-5 text-[#D4021D]" />
              <span>Mapa de Negocios y Cobertura</span>
            </h2>
            <p className="text-xs text-slate-500">
              Explora visualmente todas las farmacias y restaurantes geolocalizados
            </p>
          </div>
        </div>

        <button
          onClick={detectUserLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#D4021D] border border-red-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <LocateFixed className={`w-3.5 h-3.5 text-[#D4021D] ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Localizando...' : 'Mi GPS'}</span>
        </button>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-[#D4021D] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Todos ({businesses.length})
        </button>

        <button
          onClick={() => setActiveCategory('farmacia')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeCategory === 'farmacia'
              ? 'bg-[#D4021D] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          💊 Farmacias ({businesses.filter((b) => b.category === 'farmacia').length})
        </button>

        <button
          onClick={() => setActiveCategory('restaurante')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeCategory === 'restaurante'
              ? 'bg-[#D4021D] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          🍔 Restaurantes ({businesses.filter((b) => b.category === 'restaurante').length})
        </button>

        <button
          onClick={() => setActiveCategory('offers')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
            activeCategory === 'offers'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
          <span>Ofertas ({offersCount})</span>
        </button>
      </div>

      {/* Main Map Canvas Component */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <InteractiveMap
          selectedCategory={activeCategory}
          onSelectBusiness={(biz) => {
            handleMarkerClick(biz);
          }}
        />
      </div>

      {/* Selected Business Preview Floating Card */}
      {selectedMapBiz && (
        <div className="p-3.5 bg-white rounded-2xl border border-red-200 shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base shadow-xs"
                style={{ backgroundColor: selectedMapBiz.customPinColor || '#D4021D' }}
              >
                {selectedMapBiz.logo}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{selectedMapBiz.name}</h4>
                <p className="text-xs text-slate-500">{selectedMapBiz.address}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedMapBiz(null)}
              className="text-slate-400 hover:text-slate-700 p-1 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openExternalNavigation(selectedMapBiz.coordinates, 'google_maps')}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-xl text-xs font-semibold"
              >
                <Navigation className="w-3 h-3 text-[#D4021D]" />
                <span>Maps</span>
              </button>
              <button
                onClick={() => openExternalNavigation(selectedMapBiz.coordinates, 'waze')}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-xl text-xs font-semibold"
              >
                <ExternalLink className="w-3 h-3 text-slate-600" />
                <span>Waze</span>
              </button>
              <button
                onClick={() => openWhatsAppWithPrompt(`Hola, quiero consultar el catálogo de ${selectedMapBiz.name}`, selectedMapBiz.id)}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-xl text-xs font-bold border border-slate-300"
              >
                <MessageCircle className="w-3 h-3 text-[#D4021D]" />
                <span>WhatsApp</span>
              </button>
            </div>

            <button
              onClick={() => onSelectBusiness(selectedMapBiz)}
              className="flex items-center gap-1.5 bg-[#D4021D] hover:bg-[#b50218] text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ver Menú & Pedir</span>
            </button>
          </div>
        </div>
      )}

      {/* GPS Status Footer Bar */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#D4021D] animate-pulse" />
          <span>GPS Actual: <strong className="text-slate-800">{userAddressLabel}</strong></span>
        </div>
        <span className="text-[11px] text-slate-400">Toca cualquier marcador para ver ruta</span>
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

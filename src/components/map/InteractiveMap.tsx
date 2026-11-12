import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { Business, BusinessCategory } from '../../types';
import { getBusinessScheduleStatus } from '../../utils/scheduleUtils';
import {
  Navigation,
  MapPin,
  MessageCircle,
  Clock,
  Star,
  ExternalLink,
  Layers,
  LocateFixed,
  ZoomIn,
  ZoomOut,
  ChevronRight
} from 'lucide-react';

interface InteractiveMapProps {
  onSelectBusiness?: (business: Business) => void;
  selectedCategory?: 'all' | BusinessCategory | 'offers';
}

const DEFAULT_VENEZUELA_COORDS: [number, number] = [10.4806, -66.9036];
const DEFAULT_MAP_ZOOM = 13;

// Venezuelan Cities
const VENEZUELAN_CITIES = [
  { name: 'Caracas (Distrito Capital)', lat: 10.4806, lng: -66.9036 },
  { name: 'Valencia (Carabobo)', lat: 10.1620, lng: -68.0077 },
  { name: 'Maracaibo (Zulia)', lat: 10.6545, lng: -71.6426 },
  { name: 'Barquisimeto (Lara)', lat: 10.0647, lng: -69.3570 },
  { name: 'Maracay (Aragua)', lat: 10.2469, lng: -67.5958 },
  { name: 'Lechería / PLC (Anzoátegui)', lat: 10.1983, lng: -64.6931 }
];

const TILE_LAYERS: Record<'streets' | 'dark' | 'satellite', { url: string; attribution: string }> = {
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  }
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onSelectBusiness,
  selectedCategory = 'all'
}) => {
  const {
    businesses,
    products,
    userLocation,
    calculateDistance,
    openExternalNavigation,
    detectUserLocation,
    isLocating,
    openWhatsAppWithPrompt,
    setUserCustomLocation
  } = useApp();

  const [activeBiz, setActiveBiz] = useState<Business | null>(null);
  const [mapLayer, setMapLayer] = useState<'dark' | 'satellite' | 'streets'>('streets');
  const [showCoverageRadius, setShowCoverageRadius] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState(VENEZUELAN_CITIES[0]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusLayerRef = useRef<L.Circle | null>(null);

  // Guard against stale Mexico coords if any existed in runtime
  const isMexicoCoords = (lat?: number, lng?: number) =>
    typeof lat === 'number' && typeof lng === 'number' && lat > 14 && lat < 25 && lng < -90;

  const safeUserLat =
    userLocation && !isMexicoCoords(userLocation.lat, userLocation.lng)
      ? userLocation.lat
      : DEFAULT_VENEZUELA_COORDS[0];
  const safeUserLng =
    userLocation && !isMexicoCoords(userLocation.lat, userLocation.lng)
      ? userLocation.lng
      : DEFAULT_VENEZUELA_COORDS[1];

  const centerLat = safeUserLat || selectedCity.lat;
  const centerLng = safeUserLng || selectedCity.lng;

  // Filter businesses according to prop
  const filteredBusinesses = businesses.filter((biz) => {
    if (!biz.isActive) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'offers') {
      return products.some((p) => p.businessId === biz.id && p.isOfferOfTheDay);
    }
    return biz.category === selectedCategory;
  });

  // 1. Initialize Leaflet Map once on mount centered at Venezuela [10.4806, -66.9036] with zoom 13
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = [centerLat, centerLng];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: DEFAULT_MAP_ZOOM,
      zoomControl: false,
      attributionControl: false
    });

    const initialTile = L.tileLayer(TILE_LAYERS[mapLayer].url, {
      maxZoom: 19
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);

    mapRef.current = map;
    tileLayerRef.current = initialTile;
    markersLayerRef.current = markersGroup;

    // Ensure clean layout resize after container paint
    setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      markersLayerRef.current = null;
      radiusLayerRef.current = null;
    };
  }, []);

  // 2. Switch map tile layer (Calles / Noche / Satélite)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(TILE_LAYERS[mapLayer].url, {
      maxZoom: 19
    }).addTo(map);
  }, [mapLayer]);

  // 3. Re-center map smoothly when userLocation updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    if (isMexicoCoords(userLocation.lat, userLocation.lng)) return;

    map.setView([userLocation.lat, userLocation.lng], DEFAULT_MAP_ZOOM, { animate: true });
  }, [userLocation?.lat, userLocation?.lng]);

  // 4. Render markers & coverage circle whenever businesses, activeBiz, category, or center changes
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Coverage radius circle around center
    if (radiusLayerRef.current) {
      map.removeLayer(radiusLayerRef.current);
      radiusLayerRef.current = null;
    }

    if (showCoverageRadius) {
      radiusLayerRef.current = L.circle([centerLat, centerLng], {
        radius: 2500,
        color: '#D4021D',
        weight: 1.5,
        dashArray: '6 6',
        fillColor: '#D4021D',
        fillOpacity: 0.08
      }).addTo(map);
    }

    // User location marker
    const userIcon = L.divIcon({
      className: 'conforce-user-pin',
      html: `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%);">
          <span class="animate-ping" style="position:absolute;width:28px;height:28px;border-radius:9999px;background:#D4021D;opacity:0.65;"></span>
          <div style="position:relative;width:16px;height:16px;border-radius:9999px;background:#D4021D;border:2.5px solid #ffffff;box-shadow:0 4px 12px rgba(212,2,29,0.5);"></div>
          <span style="margin-top:4px;padding:2px 6px;background:rgba(255,255,255,0.96);border:1px solid #e2e8f0;border-radius:6px;font-size:9px;font-weight:800;color:#D4021D;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.12);">
            Tú estás aquí
          </span>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    L.marker([centerLat, centerLng], { icon: userIcon, zIndexOffset: 500 }).addTo(markersGroup);

    // Business pins
    filteredBusinesses.forEach((biz) => {
      const bLat = biz.coordinates?.lat;
      const bLng = biz.coordinates?.lng;
      if (typeof bLat !== 'number' || typeof bLng !== 'number') return;

      const isSelected = activeBiz?.id === biz.id;
      const distance = calculateDistance(biz.coordinates);
      const hasOffer = products.some((p) => p.businessId === biz.id && p.isOfferOfTheDay);
      const pinColor = biz.customPinColor || '#D4021D';
      const shortName = biz.name.split(' ')[0];

      const bizIcon = L.divIcon({
        className: 'conforce-biz-pin',
        html: `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);cursor:pointer;">
            ${
              hasOffer
                ? `<span style="position:absolute;top:-8px;right:-6px;width:18px;height:18px;border-radius:9999px;background:#f59e0b;color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25);z-index:10;">🔥</span>`
                : ''
            }
            <div style="width:42px;height:42px;border-radius:14px;background:${pinColor};border:2.5px solid ${
              isSelected ? '#D4021D' : '#ffffff'
            };display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:${
              isSelected ? '0 0 0 4px rgba(212,2,29,0.35), 0 10px 20px rgba(0,0,0,0.28)' : '0 6px 14px rgba(0,0,0,0.22)'
            };transform:${isSelected ? 'scale(1.12)' : 'scale(1)'};transition:transform 0.15s ease;">
              ${biz.logo}
            </div>
            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${pinColor};margin-top:-1px;"></div>
            <div style="margin-top:2px;padding:2px 7px;background:rgba(255,255,255,0.96);border:1px solid #e2e8f0;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,0.14);font-size:10px;font-weight:700;color:#1e293b;white-space:nowrap;display:flex;align-items:center;gap:4px;">
              <span>${shortName}</span>
              <span style="color:#D4021D;font-weight:700;">· ${distance}km</span>
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const marker = L.marker([bLat, bLng], {
        icon: bizIcon,
        zIndexOffset: isSelected ? 400 : 100
      });

      marker.on('click', () => {
        setActiveBiz(biz);
        map.panTo([bLat, bLng], { animate: true });
      });

      marker.addTo(markersGroup);
    });
  }, [filteredBusinesses, activeBiz, centerLat, centerLng, showCoverageRadius, products, calculateDistance]);

  const handleCityChange = (cityName: string) => {
    const found = VENEZUELAN_CITIES.find((c) => c.name === cityName);
    if (!found) return;
    setSelectedCity(found);
    setUserCustomLocation({ lat: found.lat, lng: found.lng }, `${found.name}, Venezuela`);
    if (mapRef.current) {
      mapRef.current.setView([found.lat, found.lng], DEFAULT_MAP_ZOOM, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-[420px] md:h-[540px] rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-md select-none">
      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Map Layer Controls & Venezuelan City Selector */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
          {/* City selector dropdown for Venezuela */}
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200 shadow-md text-xs font-bold text-slate-800">
            <span className="text-sm">🇻🇪</span>
            <select
              value={selectedCity.name}
              onChange={(e) => handleCityChange(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              {VENEZUELAN_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-md">
            <button
              onClick={() => setMapLayer('streets')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mapLayer === 'streets' ? 'bg-[#D4021D] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Calles
            </button>
            <button
              onClick={() => setMapLayer('dark')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mapLayer === 'dark' ? 'bg-[#D4021D] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Noche
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mapLayer === 'satellite' ? 'bg-[#D4021D] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satélite
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowCoverageRadius(!showCoverageRadius)}
          className={`p-2 rounded-xl border backdrop-blur-md shadow-md transition-colors cursor-pointer pointer-events-auto ${
            showCoverageRadius
              ? 'bg-red-50 border-red-300 text-[#D4021D]'
              : 'bg-white/95 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
          title="Radio de Cobertura"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Right Map Actions (Zoom & Locate) */}
      <div className="absolute right-3 top-16 flex flex-col gap-2 z-20">
        <button
          onClick={() => {
            detectUserLocation();
            if (mapRef.current) {
              mapRef.current.setView([centerLat, centerLng], DEFAULT_MAP_ZOOM, { animate: true });
            }
          }}
          disabled={isLocating}
          className="p-2.5 bg-white/95 hover:bg-slate-100 text-[#D4021D] border border-slate-200 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          title="Centrar en mi ubicación GPS"
        >
          <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="p-2.5 bg-white/95 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          title="Acercar"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="p-2.5 bg-white/95 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          title="Alejar"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Business Bottom Card (Popup) */}
      {activeBiz && (
        <div className="absolute bottom-3 left-3 right-3 md:left-6 md:right-auto md:w-96 bg-white/98 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-4 duration-200 text-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/20 shadow-md"
                style={{ backgroundColor: activeBiz.customPinColor || '#D4021D' }}
              >
                {activeBiz.logo}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D4021D]">
                    {activeBiz.category === 'farmacia' ? '💊 Farmacia' : '🍔 Restaurante'}
                  </span>
                  <span className="text-slate-400">·</span>
                  <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {activeBiz.rating}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{activeBiz.name}</h3>
                <p className="text-[11px] text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{activeBiz.address}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveBiz(null)}
              className="text-slate-400 hover:text-slate-700 p-1 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-700">
            {(() => {
              const schedule = getBusinessScheduleStatus(activeBiz.openingHours);
              return (
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${schedule.badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${schedule.dotColorClass}`} />
                    <span>{schedule.label}</span>
                  </span>
                  <span className="text-slate-400 text-[10px]">·</span>
                  <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                    <Clock className="w-3 h-3 text-[#D4021D]" />
                    <span>{activeBiz.deliveryTime}</span>
                  </div>
                </div>
              );
            })()}
            <span className="font-semibold text-[#D4021D]">
              {calculateDistance(activeBiz.coordinates)} km de ti
            </span>
          </div>

          {/* Action Buttons: Google Maps / Waze / WhatsApp / View Menu */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {/* Assisted Navigation Menu */}
            <div className="flex gap-1">
              <button
                onClick={() => openExternalNavigation(activeBiz.coordinates, 'google_maps')}
                className="flex-1 flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 px-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-xs cursor-pointer"
                title="Ruta en Google Maps"
              >
                <Navigation className="w-3.5 h-3.5 text-[#D4021D]" />
                <span>Maps</span>
              </button>
              <button
                onClick={() => openExternalNavigation(activeBiz.coordinates, 'waze')}
                className="flex-1 flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 px-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-xs cursor-pointer"
                title="Ruta en Waze"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                <span>Waze</span>
              </button>
            </div>

            {/* Direct WhatsApp chat */}
            <button
              onClick={() =>
                openWhatsAppWithPrompt(
                  `¡Hola *${activeBiz.name}*! 👋 Vi su ubicación en el mapa de ConForce Marketplace y deseo hacer un pedido.`,
                  activeBiz.id
                )
              }
              className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-white" />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* Primary View Catalog Button */}
          <button
            onClick={() => onSelectBusiness && onSelectBusiness(activeBiz)}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-[#D4021D] hover:bg-[#b50218] text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-md shadow-[#D4021D]/25 transition-all active:scale-98 cursor-pointer"
          >
            <span>Ver Catálogo y Pedir</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

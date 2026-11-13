import React, { useState, useMemo } from 'react';
import {
  MapPin,
  X,
  LocateFixed,
  Search,
  AlertTriangle,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VENEZUELAN_CITIES, geocodeVenezuelaAddress } from '../../utils/venezuelaGeo';

export const LocationPickerModal: React.FC = () => {
  const {
    isLocationPickerOpen,
    setIsLocationPickerOpen,
    userAddressLabel,
    userLocation,
    locationPermissionStatus,
    locationFeedback,
    detectUserLocation,
    isLocating,
    setUserCustomLocation
  } = useApp();

  const [citySearch, setCitySearch] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');

  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return VENEZUELAN_CITIES;
    return VENEZUELAN_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.keywords?.some((kw) => kw.includes(q))
    );
  }, [citySearch]);

  if (!isLocationPickerOpen) return null;

  const handleSelectCity = (city: (typeof VENEZUELAN_CITIES)[number]) => {
    setUserCustomLocation({ lat: city.lat, lng: city.lng }, `${city.city}, ${city.state} (Venezuela)`);
    setIsLocationPickerOpen(false);
  };

  const handleAddressGeocode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressQuery.trim()) return;
    setAddressError('');
    setIsSearchingAddress(true);

    try {
      const result = await geocodeVenezuelaAddress(addressQuery);
      setUserCustomLocation({ lat: result.lat, lng: result.lng }, `${result.label} (Venezuela)`);
      setAddressQuery('');
      setIsLocationPickerOpen(false);
    } catch {
      setAddressError('No pudimos ubicar esa dirección exacta. Selecciona tu ciudad de la lista.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#D4021D] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tu ubicación en Venezuela</h3>
              <p className="text-xs text-slate-500">
                Usamos tu ciudad para calcular distancias reales a cada comercio
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLocationPickerOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar selector de ubicación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Permission warning if GPS denied */}
          {locationPermissionStatus === 'denied' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Permiso de ubicación GPS desactivado en tu dispositivo</p>
                <p className="text-amber-800 leading-relaxed">
                  {locationFeedback?.message ||
                    'Tu teléfono o navegador bloqueó el acceso al GPS. Actívalo en los permisos del navegador o elige tu ciudad manualmente aquí abajo.'}
                </p>
              </div>
            </div>
          )}

          {/* Current active location + Retry GPS button */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-500 block">Ubicación activa:</span>
              <p className="text-sm font-bold text-slate-900 truncate">{userAddressLabel}</p>
              {userLocation && (
                <span className="text-[11px] font-mono tabular-nums text-slate-500">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => detectUserLocation(true)}
              disabled={isLocating}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#D4021D] hover:bg-[#b50218] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-60"
            >
              <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detectando...' : 'Reintentar GPS'}</span>
            </button>
          </div>

          {/* Search specific sector/address in Venezuela */}
          <form onSubmit={handleAddressGeocode} className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Buscar sector o dirección exacta en Venezuela
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Navigation className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  placeholder="Ej. Av. Libertador, San Felipe, Yaracuy"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4021D]/20 focus:border-[#D4021D]"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingAddress || !addressQuery.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSearchingAddress ? 'Buscando...' : 'Ubicar'}
              </button>
            </div>
            {addressError && <p className="text-xs text-red-600">{addressError}</p>}
          </form>

          {/* Searchable list of Venezuelan cities */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700">
                O selecciona tu ciudad en Venezuela
              </label>
              <span className="text-[11px] text-slate-500">{filteredCities.length} ciudades</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="Filtrar ciudad o estado (ej. San Felipe, Yaracuy, Valencia...)"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#D4021D]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredCities.map((city) => {
                const isSelected =
                  userLocation &&
                  Math.abs(userLocation.lat - city.lat) < 0.02 &&
                  Math.abs(userLocation.lng - city.lng) < 0.02;

                return (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-50 border-[#D4021D] text-slate-900'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{city.city}</p>
                      <p className="text-[11px] text-slate-500 truncate">{city.state}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#D4021D] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

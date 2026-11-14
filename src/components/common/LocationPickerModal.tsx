import React, { useState, useMemo } from 'react';
import {
  MapPin,
  X,
  LocateFixed,
  Search,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Smartphone,
  ShieldAlert
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
    gpsStatusReason,
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

  const handleClose = () => {
    try {
      localStorage.setItem('mk_user_location_confirmed', 'true');
    } catch {}
    setIsLocationPickerOpen(false);
  };

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

  const isGpsOff = gpsStatusReason === 'gps_off_or_unavailable' || gpsStatusReason === 'timeout';
  const isPermDenied = gpsStatusReason === 'permission_denied';
  const isGranted = locationPermissionStatus === 'granted' && gpsStatusReason === 'granted';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#D4021D] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Geolocalización y GPS del Dispositivo</h3>
              <p className="text-xs text-slate-500">
                Detectamos tu posición real para mostrarte negocios cercanos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar ventana de ubicación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Dynamic Mobile GPS Prompt / Diagnostic Banner */}
          {isGpsOff ? (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3 text-xs text-amber-950">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-sm text-amber-950">
                    El GPS de tu teléfono está apagado o sin señal
                  </p>
                  <p className="text-amber-900 leading-relaxed">
                    Para detectar tu ubicación real automáticamente, por favor enciende la ubicación (GPS) de tu dispositivo móvil:
                  </p>
                  <ul className="space-y-1 pt-1 text-[11px] text-amber-900 list-disc pl-4">
                    <li>
                      <strong>Android:</strong> Desliza hacia abajo la barra superior y enciende <strong>Ubicación / GPS</strong>.
                    </li>
                    <li>
                      <strong>iPhone (iOS):</strong> Ve a <em>Ajustes → Privacidad y seguridad → Localización</em> y actívala.
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => detectUserLocation(true)}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#D4021D] hover:bg-[#b50218] text-white rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer disabled:opacity-60"
              >
                <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detectando señal GPS...' : 'Ya encendí mi GPS, detectar ahora'}</span>
              </button>
            </div>
          ) : isPermDenied ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3 text-xs text-red-950">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-[#D4021D] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-sm text-red-950">
                    Permiso de ubicación bloqueado en tu dispositivo
                  </p>
                  <p className="text-red-900 leading-relaxed">
                    Tu navegador negó el acceso al GPS. Para activarlo:
                  </p>
                  <ul className="space-y-1 pt-1 text-[11px] text-red-900 list-disc pl-4">
                    <li>
                      Toca el ícono de <strong>candado / ajustes</strong> en la barra de dirección del navegador → <strong>Permisos → Ubicación → Permitir</strong>.
                    </li>
                    <li>
                      En iPhone también revisa <em>Ajustes → Safari/Chrome → Ubicación → Permitir</em>.
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => detectUserLocation(true)}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#D4021D] hover:bg-[#b50218] text-white rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer disabled:opacity-60"
              >
                <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Consultando GPS...' : 'Ya di permiso, detectar mi ubicación'}</span>
              </button>
            </div>
          ) : isGranted ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  GPS del dispositivo activo
                </span>
                <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{userAddressLabel}</p>
                {userLocation && (
                  <span className="text-[11px] font-mono tabular-nums text-slate-600">
                    {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => detectUserLocation(true)}
                disabled={isLocating}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-60"
              >
                <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Actualizando...' : 'Actualizar GPS'}</span>
              </button>
            </div>
          ) : (
            /* prompt_needed: First-time friendly request that triggers native mobile prompt on tap */
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D4021D] text-white flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-extrabold text-slate-900">
                    Activa el GPS de tu teléfono para ubicarte
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Toca el botón de abajo y selecciona <strong>«Permitir»</strong> cuando tu dispositivo móvil solicite permiso de ubicación.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => detectUserLocation(true)}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#D4021D] hover:bg-[#b50218] text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-60"
              >
                <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Solicitando permiso y ubicando...' : 'Permitir acceso a mi GPS y ubicarme'}</span>
              </button>
            </div>
          )}

          {/* Current active fallback coordinates summary when not granted */}
          {!isGranted && (
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 truncate">
                Referencia actual: <strong className="text-slate-900">{userAddressLabel}</strong>
              </span>
              {userLocation && (
                <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0">
                  {userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)}
                </span>
              )}
            </div>
          )}

          {/* Search specific sector/address in Venezuela */}
          <form onSubmit={handleAddressGeocode} className="space-y-1.5 pt-1 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">
              O busca tu sector / dirección manualmente en Venezuela
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
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700">
                O elige tu ciudad manualmente
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
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

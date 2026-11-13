import { Coordinates } from '../types';

export interface VenezuelanCity {
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  keywords?: string[];
}

export const DEFAULT_VENEZUELA_COORDS: Coordinates = {
  lat: 10.4806,
  lng: -66.9036
};

export const VENEZUELAN_CITIES: VenezuelanCity[] = [
  {
    name: 'Caracas (Distrito Capital)',
    city: 'Caracas',
    state: 'Distrito Capital',
    lat: 10.4806,
    lng: -66.9036,
    keywords: ['caracas', 'chacao', 'baruta', 'sucre', 'petare', 'el hatillo', 'altamira', 'sabana grande', 'distrito capital']
  },
  {
    name: 'San Felipe (Yaracuy)',
    city: 'San Felipe',
    state: 'Yaracuy',
    lat: 10.3397,
    lng: -68.7425,
    keywords: ['san felipe', 'yaracuy', 'independencia', 'cocorote', 'albarico']
  },
  {
    name: 'Yaritagua (Yaracuy)',
    city: 'Yaritagua',
    state: 'Yaracuy',
    lat: 10.0806,
    lng: -69.1269,
    keywords: ['yaritagua', 'peña']
  },
  {
    name: 'Chivacoa (Yaracuy)',
    city: 'Chivacoa',
    state: 'Yaracuy',
    lat: 10.1597,
    lng: -68.8947,
    keywords: ['chivacoa', 'bruzual']
  },
  {
    name: 'Barquisimeto (Lara)',
    city: 'Barquisimeto',
    state: 'Lara',
    lat: 10.0647,
    lng: -69.3570,
    keywords: ['barquisimeto', 'lara', 'iribarren']
  },
  {
    name: 'Cabudare (Lara)',
    city: 'Cabudare',
    state: 'Lara',
    lat: 10.0329,
    lng: -69.2633,
    keywords: ['cabudare', 'palavecino']
  },
  {
    name: 'Valencia (Carabobo)',
    city: 'Valencia',
    state: 'Carabobo',
    lat: 10.1620,
    lng: -68.0077,
    keywords: ['valencia', 'carabobo', 'naguanagua', 'san diego', 'guacara']
  },
  {
    name: 'Maracay (Aragua)',
    city: 'Maracay',
    state: 'Aragua',
    lat: 10.2469,
    lng: -67.5958,
    keywords: ['maracay', 'aragua', 'turmero', 'cagua']
  },
  {
    name: 'Maracaibo (Zulia)',
    city: 'Maracaibo',
    state: 'Zulia',
    lat: 10.6545,
    lng: -71.6426,
    keywords: ['maracaibo', 'zulia', 'san francisco']
  },
  {
    name: 'Lechería / Puerto La Cruz (Anzoátegui)',
    city: 'Lechería',
    state: 'Anzoátegui',
    lat: 10.1983,
    lng: -64.6931,
    keywords: ['lecheria', 'puerto la cruz', 'anzoategui']
  },
  {
    name: 'Barcelona (Anzoátegui)',
    city: 'Barcelona',
    state: 'Anzoátegui',
    lat: 10.1362,
    lng: -64.6862,
    keywords: ['barcelona']
  },
  {
    name: 'Mérida (Mérida)',
    city: 'Mérida',
    state: 'Mérida',
    lat: 8.5897,
    lng: -71.1561,
    keywords: ['merida', 'ejido']
  },
  {
    name: 'San Cristóbal (Táchira)',
    city: 'San Cristóbal',
    state: 'Táchira',
    lat: 7.7669,
    lng: -72.2250,
    keywords: ['san cristobal', 'tachira', 'tariba']
  },
  {
    name: 'Puerto Ordaz / Ciudad Guayana (Bolívar)',
    city: 'Puerto Ordaz',
    state: 'Bolívar',
    lat: 8.2971,
    lng: -62.7116,
    keywords: ['puerto ordaz', 'ciudad guayana', 'san felix', 'bolivar']
  },
  {
    name: 'Maturín (Monagas)',
    city: 'Maturín',
    state: 'Monagas',
    lat: 9.7457,
    lng: -63.1832,
    keywords: ['maturin', 'monagas']
  },
  {
    name: 'Cumaná (Sucre)',
    city: 'Cumaná',
    state: 'Sucre',
    lat: 10.4539,
    lng: -64.1825,
    keywords: ['cumana', 'sucre']
  },
  {
    name: 'Coro (Falcón)',
    city: 'Coro',
    state: 'Falcón',
    lat: 11.4045,
    lng: -69.6734,
    keywords: ['coro', 'falcon']
  },
  {
    name: 'Punto Fijo (Falcón)',
    city: 'Punto Fijo',
    state: 'Falcón',
    lat: 11.6914,
    lng: -70.1996,
    keywords: ['punto fijo', 'paraguana']
  },
  {
    name: 'Valera (Trujillo)',
    city: 'Valera',
    state: 'Trujillo',
    lat: 9.3178,
    lng: -70.6036,
    keywords: ['valera', 'trujillo']
  },
  {
    name: 'Acarigua / Araure (Portuguesa)',
    city: 'Acarigua',
    state: 'Portuguesa',
    lat: 9.5597,
    lng: -69.2019,
    keywords: ['acarigua', 'araure', 'portuguesa']
  },
  {
    name: 'Guanare (Portuguesa)',
    city: 'Guanare',
    state: 'Portuguesa',
    lat: 9.0418,
    lng: -69.7421,
    keywords: ['guanare']
  },
  {
    name: 'Barinas (Barinas)',
    city: 'Barinas',
    state: 'Barinas',
    lat: 8.6226,
    lng: -70.2075,
    keywords: ['barinas']
  },
  {
    name: 'Porlamar / Margarita (Nueva Esparta)',
    city: 'Porlamar',
    state: 'Nueva Esparta',
    lat: 10.9577,
    lng: -63.8697,
    keywords: ['porlamar', 'margarita', 'nueva esparta', 'pampatar']
  },
  {
    name: 'Los Teques (Miranda)',
    city: 'Los Teques',
    state: 'Miranda',
    lat: 10.3445,
    lng: -67.0433,
    keywords: ['los teques', 'san antonio de los altos', 'carrizal']
  },
  {
    name: 'Guarenas / Guatire (Miranda)',
    city: 'Guarenas',
    state: 'Miranda',
    lat: 10.4673,
    lng: -66.6195,
    keywords: ['guarenas', 'guatire']
  },
  {
    name: 'La Guaira (La Guaira)',
    city: 'La Guaira',
    state: 'La Guaira',
    lat: 10.5990,
    lng: -66.9331,
    keywords: ['la guaira', 'vargas', 'maiquetia', 'catia la mar']
  }
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function isMexicoCoords(lat?: number, lng?: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat > 14 &&
    lat < 25 &&
    lng < -90
  );
}

export function isInsideVenezuela(lat?: number, lng?: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= 0.5 &&
    lat <= 13.5 &&
    lng >= -74.0 &&
    lng <= -59.5
  );
}

export function guessVenezuelaCityFromText(text?: string): VenezuelanCity {
  if (!text) return VENEZUELAN_CITIES[0];
  const normalized = normalizeText(text);

  for (const city of VENEZUELAN_CITIES) {
    if (city.keywords?.some((kw) => normalized.includes(kw))) {
      return city;
    }
    if (normalized.includes(normalizeText(city.city))) {
      return city;
    }
  }

  return VENEZUELAN_CITIES[0];
}

export function findNearestVenezuelanCity(lat: number, lng: number): VenezuelanCity {
  let best = VENEZUELAN_CITIES[0];
  let minScore = Infinity;

  for (const c of VENEZUELAN_CITIES) {
    const dLat = c.lat - lat;
    const dLng = c.lng - lng;
    const score = dLat * dLat + dLng * dLng;
    if (score < minScore) {
      minScore = score;
      best = c;
    }
  }

  return best;
}

export function sanitizeBusinessCoordinates(
  coords?: Partial<Coordinates> | null,
  address?: string,
  city?: string,
  state?: string
): { coordinates: Coordinates; wasRepaired: boolean } {
  const lat = typeof coords?.lat === 'number' ? coords.lat : Number(coords?.lat);
  const lng = typeof coords?.lng === 'number' ? coords.lng : Number(coords?.lng);

  const validNumbers =
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    (Math.abs(lat) > 0.001 || Math.abs(lng) > 0.001);

  if (validNumbers && !isMexicoCoords(lat, lng) && isInsideVenezuela(lat, lng)) {
    return {
      coordinates: { lat, lng },
      wasRepaired: false
    };
  }

  // Fallback to inferred Venezuelan city from address/city/state (or Caracas if unknown)
  const inferred = guessVenezuelaCityFromText([address, city, state].filter(Boolean).join(' '));
  return {
    coordinates: { lat: inferred.lat, lng: inferred.lng },
    wasRepaired: true
  };
}

export async function geocodeVenezuelaAddress(query: string): Promise<{
  lat: number;
  lng: number;
  label: string;
  city: string;
  state: string;
  source: 'nominatim' | 'city_match';
}> {
  const cleanQuery = query.trim();
  const cityFallback = guessVenezuelaCityFromText(cleanQuery);

  if (!cleanQuery) {
    return {
      lat: cityFallback.lat,
      lng: cityFallback.lng,
      label: cityFallback.name,
      city: cityFallback.city,
      state: cityFallback.state,
      source: 'city_match'
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const searchQuery = cleanQuery.toLowerCase().includes('venezuela')
      ? cleanQuery
      : `${cleanQuery}, Venezuela`;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ve&addressdetails=1&limit=1&q=${encodeURIComponent(searchQuery)}`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        const hit = results[0];
        const lat = parseFloat(hit.lat);
        const lng = parseFloat(hit.lon);
        if (isInsideVenezuela(lat, lng)) {
          const addr = hit.address || {};
          const resolvedCity =
            addr.city || addr.town || addr.village || addr.municipality || cityFallback.city;
          const resolvedState = addr.state || cityFallback.state;
          return {
            lat,
            lng,
            label: `${resolvedCity}, ${resolvedState}`,
            city: resolvedCity,
            state: resolvedState,
            source: 'nominatim'
          };
        }
      }
    }
  } catch {
    // Graceful fallback to local Venezuelan city dictionary
  }

  return {
    lat: cityFallback.lat,
    lng: cityFallback.lng,
    label: cityFallback.name,
    city: cityFallback.city,
    state: cityFallback.state,
    source: 'city_match'
  };
}

export async function reverseGeocodeVenezuela(lat: number, lng: number): Promise<string> {
  const nearest = findNearestVenezuelanCity(lat, lng);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data?.address || {};
      const locality =
        addr.suburb || addr.neighbourhood || addr.city || addr.town || addr.village || addr.municipality;
      const city = addr.city || addr.town || addr.municipality || nearest.city;
      const state = addr.state || nearest.state;

      if (locality && locality !== city) {
        return `GPS: ${locality}, ${city} (${state})`;
      }
      if (city) {
        return `GPS: ${city}, ${state}`;
      }
    }
  } catch {
    // Offline/blocked network fallback
  }

  return isInsideVenezuela(lat, lng)
    ? `GPS: Cerca de ${nearest.city}, ${nearest.state}`
    : `GPS: Ubicación detectada (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

export async function detectIpLocationVenezuela(): Promise<{
  lat: number;
  lng: number;
  city: string;
  state: string;
  label: string;
} | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json', {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    const country = String(data.country_code || '').toUpperCase();

    if (country === 'VE' && isInsideVenezuela(lat, lng)) {
      const nearest = findNearestVenezuelanCity(lat, lng);
      const city = data.city || nearest.city;
      const state = data.region || nearest.state;
      return {
        lat,
        lng,
        city,
        state,
        label: `${city}, ${state} (Aprox. por red)`
      };
    }
  } catch {
    // Ignore IP fallback failures cleanly
  }

  return null;
}

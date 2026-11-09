import { Business } from '../types';

export interface ScheduleStatus {
  status: 'open' | 'closing_soon' | 'closed';
  label: string;
  detail: string;
  badgeClass: string;
  textClass: string;
  dotColorClass: string;
  closingInMinutes: number | null;
  isOpen: boolean;
  rawHours: string;
}

/**
 * Parses time string like "08:00 AM", "10:30 PM", "12:00 PM", "02:00 AM" into minutes from midnight (0 - 1439).
 */
function parseTimeToMinutes(timeStr: string): number | null {
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];

  if (period === 'PM' && hours < 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Evaluates the business schedule against a given date/time.
 * Supports:
 * - "24 Horas" / "24 Horas (Lunes a Domingo)"
 * - "08:00 AM - 10:00 PM"
 * - "12:00 PM - 11:30 PM"
 * - "10:00 AM - 02:00 AM" (overnight span)
 * - "07:30 AM - 09:00 PM"
 */
export function getBusinessScheduleStatus(
  openingHoursStr: string,
  referenceDate: Date = new Date()
): ScheduleStatus {
  const rawHours = openingHoursStr?.trim() || 'Horario no especificado';

  // 1. Check 24 Hours
  if (/24\s*hora/i.test(rawHours)) {
    return {
      status: 'open',
      label: 'Abierto 24 Horas',
      detail: 'Servicio continuo día y noche',
      badgeClass: 'bg-slate-100 text-slate-900 border-slate-300',
      textClass: 'text-slate-900',
      dotColorClass: 'bg-[#D4021D]',
      closingInMinutes: null,
      isOpen: true,
      rawHours
    };
  }

  // 2. Parse Range (e.g., "08:00 AM - 10:00 PM" or "10:00 AM - 02:00 AM")
  const parts = rawHours.split('-');
  if (parts.length === 2) {
    const openMin = parseTimeToMinutes(parts[0]);
    const closeMin = parseTimeToMinutes(parts[1]);

    if (openMin !== null && closeMin !== null) {
      const currentMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();

      let isOpen = false;
      let minutesUntilClose: number | null = null;

      if (openMin <= closeMin) {
        // Standard same-day schedule (e.g. 08:00 AM to 10:00 PM => 480 to 1320)
        if (currentMinutes >= openMin && currentMinutes < closeMin) {
          isOpen = true;
          minutesUntilClose = closeMin - currentMinutes;
        }
      } else {
        // Overnight schedule spanning past midnight (e.g. 10:00 AM to 02:00 AM => 600 to 120)
        if (currentMinutes >= openMin || currentMinutes < closeMin) {
          isOpen = true;
          if (currentMinutes >= openMin) {
            minutesUntilClose = (1440 - currentMinutes) + closeMin;
          } else {
            minutesUntilClose = closeMin - currentMinutes;
          }
        }
      }

      if (isOpen) {
        // Check if closing soon (within 45 minutes)
        if (minutesUntilClose !== null && minutesUntilClose > 0 && minutesUntilClose <= 45) {
          return {
            status: 'closing_soon',
            label: `Cierra pronto (${minutesUntilClose} min)`,
            detail: `Cierra a las ${parts[1].trim()}`,
            badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse',
            textClass: 'text-amber-700',
            dotColorClass: 'bg-amber-500',
            closingInMinutes: minutesUntilClose,
            isOpen: true,
            rawHours
          };
        }

        return {
          status: 'open',
          label: 'Abierto ahora',
          detail: `Hoy hasta las ${parts[1].trim()}`,
          badgeClass: 'bg-slate-100 text-slate-900 border-slate-300',
          textClass: 'text-slate-900',
          dotColorClass: 'bg-[#D4021D]',
          closingInMinutes: minutesUntilClose,
          isOpen: true,
          rawHours
        };
      } else {
        return {
          status: 'closed',
          label: 'Cerrado ahora',
          detail: `Abre a las ${parts[0].trim()}`,
          badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
          textClass: 'text-slate-600',
          dotColorClass: 'bg-slate-400',
          closingInMinutes: null,
          isOpen: false,
          rawHours
        };
      }
    }
  }

  // Default fallback if couldn't parse
  return {
    status: 'open',
    label: 'Abierto',
    detail: rawHours,
    badgeClass: 'bg-slate-100 text-slate-900 border-slate-300',
    textClass: 'text-slate-900',
    dotColorClass: 'bg-[#D4021D]',
    closingInMinutes: null,
    isOpen: true,
    rawHours
  };
}

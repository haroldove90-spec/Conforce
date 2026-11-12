/**
 * ConForce Marketplace URL & Deep Link Utility
 * Production Domain: https://venezuela-iota.vercel.app/
 */

export const VERCEL_PRODUCTION_URL = 'https://venezuela-iota.vercel.app';
export const VERCEL_MARKETPLACE_URL = 'https://venezuela-iota.vercel.app/';
export const VERCEL_MARKETPLACE_QUERY_URL = 'https://venezuela-iota.vercel.app/?view=marketplace';

// Direct Portal Access URLs
export const VERCEL_ADMIN_URL = 'https://venezuela-iota.vercel.app/?role=admin';
export const VERCEL_SELLER_URL = 'https://venezuela-iota.vercel.app/?role=seller';

/**
 * Gets the base URL for generating direct marketplace deep links.
 * Always resolves to the official production Vercel domain root
 * so that any user or client opening the link goes straight to the Marketplace
 * without risking any 404 error on Vercel.
 */
export function getMarketplaceBaseUrl(forceProduction: boolean = false): string {
  if (!forceProduction && typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    if (origin.includes('vercel.app')) {
      return origin;
    }
  }
  return VERCEL_PRODUCTION_URL;
}

export interface DeepLinkOptions {
  businessId?: string;
  productId?: string;
  category?: string;
  filter?: string;
  search?: string;
  forceProduction?: boolean;
}

/**
 * Builds a direct, non-broken deep link to the ConForce Marketplace
 */
export function buildDeepLink(options: DeepLinkOptions = {}): string {
  const baseUrl = getMarketplaceBaseUrl(options.forceProduction ?? true);
  const params = new URLSearchParams();

  if (options.businessId) {
    params.set('view', 'business');
    params.set('id', options.businessId);
    if (options.productId) {
      params.set('product', options.productId);
    }
  } else if (options.category) {
    params.set('filter', options.category);
  } else if (options.filter) {
    params.set('filter', options.filter);
  }

  if (options.search) {
    params.set('search', options.search);
  }

  const query = params.toString();
  return query ? `${baseUrl}/?${query}` : `${baseUrl}/`;
}

/**
 * Normalizes phone numbers to Venezuelan WhatsApp international format (+58...)
 * e.g. "0412 1234567" -> "584121234567"
 * e.g. "+58 414 9876543" -> "584149876543"
 * e.g. "4241234567" -> "584241234567"
 */
export function formatVenezuelanWhatsAppNumber(rawPhone?: string): string {
  if (!rawPhone) return '584121234567';
  const digitsOnly = rawPhone.replace(/[^0-9]/g, '');
  if (!digitsOnly) return '584121234567';

  // If starts with 0 (e.g. 04121234567), replace leading 0 with 58
  if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    return '58' + digitsOnly.slice(1);
  }

  // If 10 digits starting with 4 (e.g. 4121234567), prepend 58
  if (digitsOnly.length === 10 && digitsOnly.startsWith('4')) {
    return '58' + digitsOnly;
  }

  // If already starts with 58 and is 12 digits (e.g. 584121234567)
  if (digitsOnly.startsWith('58') && digitsOnly.length >= 11) {
    return digitsOnly;
  }

  return digitsOnly.length >= 10 ? digitsOnly : '584121234567';
}

/**
 * Opens a direct WhatsApp chat URL in a new window/tab
 */
export function openWhatsAppDirect(rawPhone: string, text: string): void {
  const cleanPhone = formatVenezuelanWhatsAppNumber(rawPhone);
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export interface SingleProductOrderOptions {
  productName: string;
  priceBs: number;
  priceUsd?: number;
  businessName: string;
  businessPhone: string;
  quantity?: number;
  variantLabel?: string;
  extras?: string[];
  customerName?: string;
  customerAddress?: string;
}

/**
 * Builds a direct WhatsApp order message for a specific product
 */
export function buildProductWhatsAppOrderMessage(opts: SingleProductOrderOptions): string {
  const qty = opts.quantity && opts.quantity > 0 ? opts.quantity : 1;
  const totalBs = opts.priceBs * qty;
  const totalUsd = opts.priceUsd ? (opts.priceUsd * qty).toFixed(2) : undefined;

  let msg = `¡Hola *${opts.businessName}*! 👋\n`;
  msg += `Vi su producto en *ConForce Marketplace* y deseo solicitarlo:\n\n`;
  msg += `🛍️ *Producto:* ${opts.productName}\n`;
  msg += `📦 *Cantidad:* ${qty}\n`;
  msg += `💵 *Precio Unitario:* Bs. ${opts.priceBs.toLocaleString('es-VE')}${opts.priceUsd ? ` ($${opts.priceUsd.toFixed(2)} USD)` : ''}\n`;

  if (opts.variantLabel) {
    msg += `🏷️ *Variante/Opción:* ${opts.variantLabel}\n`;
  }

  if (opts.extras && opts.extras.length > 0) {
    msg += `➕ *Adicionales:* ${opts.extras.join(', ')}\n`;
  }

  msg += `💰 *TOTAL A PAGAR:* Bs. ${totalBs.toLocaleString('es-VE')}${totalUsd ? ` ($${totalUsd} USD)` : ''}\n\n`;

  if (opts.customerAddress) {
    msg += `📍 *Dirección de Entrega:* ${opts.customerAddress}\n`;
  }

  if (opts.customerName) {
    msg += `👤 *Cliente:* ${opts.customerName}\n`;
  }

  msg += `\n¿Tienen disponibilidad para despachar ahora? ¡Muchas gracias!`;
  return msg;
}


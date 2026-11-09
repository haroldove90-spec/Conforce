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

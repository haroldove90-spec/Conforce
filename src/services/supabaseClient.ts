import { createClient } from '@supabase/supabase-js';
import {
  Business,
  Product,
  Order,
  WhatsAppCampaign,
  ChatbotConfig,
  SavedAddress,
  OrderStatus,
  UserAccount,
  ClientProfile,
  Role,
  DriverProfile
} from '../types';

// Supabase Configuration from User Credentials
const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

function sanitizeSupabaseUrl(rawUrl?: string): string {
  let cleaned = String(rawUrl || '').trim().replace(/['"]/g, '');
  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  // Strip /rest/v1 or /rest/v1/ suffix if entered by mistake
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned || 'https://cjoszqkgqtgfvzqxcsvi.supabase.co';
}

function sanitizeSupabaseKey(rawKey?: string): string {
  return String(rawKey || '').trim().replace(/['"]/g, '') ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqb3N6cWtncXRnZnZ6cXhjc3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTA3OTksImV4cCI6MjEwNDA2Njc5OX0.L-u61LH5GKKrBWgnxThVbRWitqmdXtHJH64MhlWJqOQ';
}

export const SUPABASE_URL: string = sanitizeSupabaseUrl(metaEnv.VITE_SUPABASE_URL);
export const SUPABASE_ANON_KEY: string = sanitizeSupabaseKey(metaEnv.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// MAPPERS: TypeScript (camelCase) <-> DB (snake_case)
// ==========================================

export function mapBusinessFromDB(row: any): Business {
  const isSponsor = Boolean(
    row.is_sponsor ||
    (Array.isArray(row.tags) && row.tags.some((t: string) => typeof t === 'string' && (t.toLowerCase().includes('patrocinad') || t.toLowerCase().includes('sponsor'))))
  );

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description || '',
    logo: row.logo || (isSponsor ? '⭐' : '🏬'),
    bannerImage: row.banner_image || '',
    phone: row.phone || '',
    address: row.address || '',
    coordinates: row.coordinates || { lat: 10.4806, lng: -66.9036 },
    openingHours: row.opening_hours || '08:00 AM - 07:00 PM',
    rating: Number(row.rating ?? 5.0),
    reviewsCount: Number(row.reviews_count ?? 0),
    isVerified: Boolean(row.is_verified ?? true),
    isActive: Boolean(row.is_active ?? true),
    commissionRate: Number(row.commission_rate ?? 10),
    customPinColor: row.custom_pin_color || (isSponsor ? '#f59e0b' : '#D4021D'),
    deliveryTime: row.delivery_time || '20-35 min',
    minOrder: Number(row.min_order ?? 0),
    tags: Array.isArray(row.tags) ? row.tags : [],
    isSponsor,
    ownerUsername: row.owner_username || undefined,
    rif: row.rif || undefined,
    email: row.email || undefined,
    city: row.city || 'Caracas',
    state: row.state || 'Distrito Capital'
  };
}

export function mapBusinessToDB(biz: Business): any {
  const isSponsor = Boolean(
    biz.isSponsor ||
    (Array.isArray(biz.tags) && biz.tags.some((t: string) => typeof t === 'string' && (t.toLowerCase().includes('patrocinad') || t.toLowerCase().includes('sponsor'))))
  );

  // Guarantee tag list preserves custom category and sponsor label
  const tagsSet = new Set(Array.isArray(biz.tags) ? biz.tags : []);
  if (isSponsor) {
    tagsSet.add('Patrocinador Oficial');
  }
  if (biz.category && biz.category !== 'farmacia' && biz.category !== 'restaurante') {
    tagsSet.add(biz.category);
  }

  // Safe category for check constraint (farmacia / restaurante)
  const dbCategory = (biz.category === 'farmacia' || biz.category === 'restaurante')
    ? biz.category
    : 'restaurante';

  return {
    id: biz.id,
    name: biz.name,
    category: dbCategory,
    logo: biz.logo || (isSponsor ? '⭐' : '🏢'),
    banner_image: biz.bannerImage || '',
    phone: biz.phone || '',
    address: biz.address || '',
    coordinates: biz.coordinates || { lat: 10.4806, lng: -66.9036 },
    opening_hours: biz.openingHours || '08:00 AM - 07:00 PM',
    rating: Number(biz.rating ?? 5.0),
    reviews_count: Number(biz.reviewsCount ?? 0),
    is_verified: biz.isVerified ?? true,
    is_active: biz.isActive ?? true,
    commission_rate: Number(biz.commissionRate ?? 10),
    custom_pin_color: biz.customPinColor || (isSponsor ? '#f59e0b' : '#D4021D'),
    delivery_time: biz.deliveryTime || '20-40 min',
    min_order: Number(biz.minOrder ?? 0),
    tags: Array.from(tagsSet),
    is_sponsor: isSponsor,
    owner_username: biz.ownerUsername || null,
    rif: biz.rif || null,
    email: biz.email || null,
    city: biz.city || 'Caracas',
    state: biz.state || 'Distrito Capital'
  };
}

export function mapProductFromDB(row: any): Product {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price),
    priceUsd: row.price_usd ? Number(row.price_usd) : undefined,
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    category: row.category || 'General',
    image: row.image || '',
    images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : undefined,
    inStock: Boolean(row.in_stock ?? true),
    stockCount: Number(row.stock_count ?? 50),
    tags: Array.isArray(row.tags) ? row.tags : [],
    isOfferOfTheDay: Boolean(row.is_offer_of_the_day ?? false),
    hasVariants: Boolean(row.has_variants ?? false),
    variants: row.variants ? (typeof row.variants === 'string' ? JSON.parse(row.variants) : row.variants) : undefined,
    ingredients: row.ingredients ? (typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : row.ingredients) : undefined,
    extras: row.extras ? (typeof row.extras === 'string' ? JSON.parse(row.extras) : row.extras) : undefined,
    preparationTime: row.preparation_time || undefined,
    foodTags: row.food_tags ? (typeof row.food_tags === 'string' ? JSON.parse(row.food_tags) : row.food_tags) : undefined
  };
}

export function mapProductToDB(prod: Product): any {
  return {
    id: prod.id,
    business_id: prod.businessId,
    name: prod.name,
    description: prod.description,
    price: prod.price,
    price_usd: prod.priceUsd || 0,
    original_price: prod.originalPrice || null,
    category: prod.category,
    image: prod.image,
    images: prod.images || [],
    in_stock: prod.inStock,
    stock_count: prod.stockCount,
    tags: prod.tags,
    is_offer_of_the_day: prod.isOfferOfTheDay,
    has_variants: prod.hasVariants || false,
    variants: prod.variants || [],
    ingredients: prod.ingredients || [],
    extras: prod.extras || [],
    preparation_time: prod.preparationTime || null,
    food_tags: prod.foodTags || []
  };
}

export function mapOrderFromDB(row: any): Order {
  return {
    id: row.id,
    businessId: row.business_id,
    businessName: row.business_name || '',
    businessLogo: row.business_logo || '',
    customerName: row.customer_name || '',
    customerPhone: row.customer_phone || '',
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee ?? 0),
    serviceFee: Number(row.service_fee ?? 0),
    serviceFeeRate: Number(row.service_fee_rate ?? 0.05),
    total: Number(row.total),
    deliveryType: row.delivery_type,
    deliveryAddress: row.delivery_address || '',
    deliveryCoordinates: row.delivery_coordinates || undefined,
    paymentMethod: row.payment_method,
    paymentReference: row.payment_reference || undefined,
    paymentProofUrl: row.payment_proof_url || undefined,
    driverId: row.driver_id || undefined,
    driverName: row.driver_name || undefined,
    driverPhone: row.driver_phone || undefined,
    driverVehicle: row.driver_vehicle || undefined,
    driverStep: row.driver_step || undefined,
    driverAssignedAt: row.driver_assigned_at || undefined,
    driverDeliveredAt: row.driver_delivered_at || undefined,
    cancellationReason: row.cancellation_reason || undefined,
    review: row.review ? (typeof row.review === 'string' ? JSON.parse(row.review) : row.review) : undefined,
    orderChannel: row.order_channel || 'app',
    status: row.status,
    createdAt: row.created_at || 'Reciente',
    notes: row.notes || undefined
  };
}

export function mapOrderToDB(order: Order): any {
  return {
    id: order.id,
    business_id: order.businessId,
    business_name: order.businessName,
    business_logo: order.businessLogo,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    service_fee: order.serviceFee || 0,
    service_fee_rate: order.serviceFeeRate || 0.05,
    total: order.total,
    delivery_type: order.deliveryType,
    delivery_address: order.deliveryAddress,
    delivery_coordinates: order.deliveryCoordinates || null,
    payment_method: order.paymentMethod,
    payment_reference: order.paymentReference || null,
    payment_proof_url: order.paymentProofUrl || null,
    driver_id: order.driverId || null,
    driver_name: order.driverName || null,
    driver_phone: order.driverPhone || null,
    driver_vehicle: order.driverVehicle || null,
    driver_step: order.driverStep || null,
    driver_assigned_at: order.driverAssignedAt || null,
    driver_delivered_at: order.driverDeliveredAt || null,
    cancellation_reason: order.cancellationReason || null,
    review: order.review ? order.review : null,
    order_channel: order.orderChannel || 'app',
    status: order.status,
    notes: order.notes || null,
    created_at: new Date().toISOString()
  };
}

export function mapCampaignFromDB(row: any): WhatsAppCampaign {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    targetAudience: row.target_audience,
    status: row.status,
    sentCount: Number(row.sent_count ?? 0),
    openRate: Number(row.open_rate ?? 0),
    clickRate: Number(row.click_rate ?? 0),
    date: row.date || new Date().toISOString()
  };
}

export function mapCampaignToDB(camp: WhatsAppCampaign): any {
  return {
    id: camp.id,
    title: camp.title,
    message: camp.message,
    target_audience: camp.targetAudience,
    status: camp.status,
    sent_count: camp.sentCount,
    open_rate: camp.openRate,
    click_rate: camp.clickRate,
    date: camp.date
  };
}

export function mapChatbotFromDB(row: any): ChatbotConfig {
  return {
    metaApiToken: row.meta_api_token || '',
    phoneNumberId: row.phone_number_id || '',
    businessAccountId: row.business_account_id || '',
    webhookVerifyToken: row.webhook_verify_token || '',
    welcomeMessage: row.welcome_message || '',
    featuredOfferId: row.featured_offer_id || '',
    autoDeepLinksEnabled: Boolean(row.auto_deep_links_enabled ?? true),
    geminiSmartSearch: Boolean(row.gemini_smart_search ?? true),
    maxDistanceKm: Number(row.max_distance_km ?? 8),
    customKeywords: Array.isArray(row.custom_keywords) ? row.custom_keywords : []
  };
}

export function mapChatbotToDB(cfg: ChatbotConfig): any {
  return {
    id: 'default',
    meta_api_token: cfg.metaApiToken,
    phone_number_id: cfg.phoneNumberId,
    business_account_id: cfg.businessAccountId,
    webhook_verify_token: cfg.webhookVerifyToken,
    welcome_message: cfg.welcomeMessage,
    featured_offer_id: cfg.featuredOfferId,
    auto_deep_links_enabled: cfg.autoDeepLinksEnabled,
    gemini_smart_search: cfg.geminiSmartSearch,
    max_distance_km: cfg.maxDistanceKm,
    custom_keywords: cfg.customKeywords,
    updated_at: new Date().toISOString()
  };
}

export function mapAddressFromDB(row: any): SavedAddress {
  return {
    id: row.id,
    label: row.label,
    address: row.address,
    coordinates: row.coordinates || { lat: 19.412, lng: -99.165 },
    isDefault: Boolean(row.is_default ?? false)
  };
}

export function mapAddressToDB(addr: SavedAddress): any {
  return {
    id: addr.id,
    label: addr.label,
    address: addr.address,
    coordinates: addr.coordinates,
    is_default: addr.isDefault ?? false
  };
}

export function mapUserFromDB(row: any): UserAccount {
  return {
    id: row.id,
    name: row.name || row.username || 'Usuario',
    username: row.username,
    email: row.email,
    password: row.password || row.password_hash || '',
    role: (row.role === 'admin' || row.role === 'seller' || row.role === 'client') ? (row.role as Role) : 'client',
    status: (row.status === 'suspended' || row.is_active === false) ? 'suspended' : 'active',
    phone: row.phone || undefined,
    address: row.address || undefined,
    businessId: row.business_id || undefined,
    department: row.department || undefined,
    createdAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    lastLogin: 'Registrado en Supabase',
    isSponsor: Boolean(
      row.department?.toLowerCase().includes('patrocinador') ||
      row.department?.toLowerCase().includes('sponsor')
    )
  };
}

export function mapClientFromDB(row: any): ClientProfile {
  return {
    id: row.id,
    userId: row.user_id || row.id,
    name: row.name || row.username || 'Cliente',
    username: row.username,
    email: row.email,
    phone: row.phone || '',
    address: row.address || '',
    totalOrders: Number(row.total_orders ?? 0),
    totalSpent: Number(row.total_spent ?? 0),
    status: 'active',
    registeredAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
  };
}

// ==========================================
// SUPABASE OPERATIONS & HEALTH CHECKS
// ==========================================

/**
 * Checks connection to the user's Supabase database.
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  hasTables: boolean;
  tableCounts?: { [tableName: string]: number };
}> {
  try {
    const { data, error } = await supabase.from('businesses').select('id', { count: 'exact', head: true });
    
    if (error) {
      // If table doesn't exist yet (PGRST204 or 42P01 in postgres)
      if (error.code === '42P01' || error.message.includes('relation "businesses" does not exist') || error.message.includes('not found')) {
        return {
          connected: true,
          message: 'Conectado exitosamente a Supabase. Las tablas aún no han sido creadas en el Editor SQL.',
          hasTables: false
        };
      }
      return {
        connected: false,
        message: `Error de respuesta Supabase: ${error.message}`,
        hasTables: false
      };
    }

    // Now query counts
    const counts: { [tableName: string]: number } = {};
    const tables = ['businesses', 'products', 'orders', 'whatsapp_campaigns', 'saved_addresses', 'users', 'clients'];
    
    for (const t of tables) {
      try {
        const { count } = await supabase.from(t).select('id', { count: 'exact', head: true });
        counts[t] = count ?? 0;
      } catch (e) {
        counts[t] = 0;
      }
    }

    return {
      connected: true,
      message: 'Conexión activa y tablas verificadas en Supabase PostgreSQL.',
      hasTables: true,
      tableCounts: counts
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Error al intentar conectar con Supabase: ${err.message || err}`,
      hasTables: false
    };
  }
}

/**
 * Fetches all users from Supabase.
 */
export async function fetchUsersFromSupabase(): Promise<UserAccount[] | null> {
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map(mapUserFromDB);
  } catch (err) {
    console.warn('Error fetching users from Supabase:', err);
    return null;
  }
}

/**
 * Fetches all clients from Supabase.
 */
export async function fetchClientsFromSupabase(): Promise<ClientProfile[] | null> {
  try {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map(mapClientFromDB);
  } catch (err) {
    console.warn('Error fetching clients from Supabase:', err);
    return null;
  }
}

/**
 * Fetches all businesses from Supabase.
 */
export async function fetchBusinessesFromSupabase(): Promise<Business[] | null> {
  try {
    const { data, error } = await supabase.from('businesses').select('*').order('name');
    if (error || !data) return null;
    return data.map(mapBusinessFromDB);
  } catch (err) {
    console.warn('Error fetching businesses from Supabase:', err);
    return null;
  }
}

/**
 * Fetches all products from Supabase.
 */
export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  try {
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error || !data) return null;
    return data.map(mapProductFromDB);
  } catch (err) {
    console.warn('Error fetching products from Supabase:', err);
    return null;
  }
}

/**
 * Fetches all orders from Supabase.
 */
export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map(mapOrderFromDB);
  } catch (err) {
    console.warn('Error fetching orders from Supabase:', err);
    return null;
  }
}

/**
 * Upserts a business in Supabase.
 */
export async function upsertBusinessInSupabase(biz: Business): Promise<boolean> {
  try {
    const { error } = await supabase.from('businesses').upsert(mapBusinessToDB(biz));
    if (error) {
      console.warn('Supabase upsertBusiness error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase upsertBusiness exception:', err);
    return false;
  }
}

/**
 * Deletes a business in Supabase.
 */
export async function deleteBusinessInSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('businesses').delete().eq('id', id);
    return !error;
  } catch (err) {
    return false;
  }
}

/**
 * Upserts a product in Supabase.
 */
export async function upsertProductInSupabase(prod: Product): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').upsert(mapProductToDB(prod));
    if (error) {
      console.warn('Supabase upsertProduct error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase upsertProduct exception:', err);
    return false;
  }
}

/**
 * Deletes a product in Supabase.
 */
export async function deleteProductInSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    return !error;
  } catch (err) {
    return false;
  }
}

/**
 * Inserts an order into Supabase.
 */
export async function insertOrderInSupabase(order: Order): Promise<boolean> {
  try {
    const { error } = await supabase.from('orders').insert(mapOrderToDB(order));
    if (error) {
      console.warn('Supabase insertOrder error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insertOrder exception:', err);
    return false;
  }
}

/**
 * Updates order status in Supabase.
 */
export async function updateOrderStatusInSupabase(
  orderId: string,
  newStatus: OrderStatus
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    return !error;
  } catch (err) {
    return false;
  }
}

/**
 * Updates full order record in Supabase (status, driver, review, etc.)
 */
export async function updateOrderInSupabase(
  orderId: string,
  updates: Partial<Order>
): Promise<boolean> {
  try {
    const dbPayload: any = {};
    if (updates.status !== undefined) dbPayload.status = updates.status;
    if (updates.driverName !== undefined) dbPayload.driver_name = updates.driverName;
    if (updates.driverPhone !== undefined) dbPayload.driver_phone = updates.driverPhone;
    if (updates.driverVehicle !== undefined) dbPayload.driver_vehicle = updates.driverVehicle;
    if (updates.cancellationReason !== undefined) dbPayload.cancellation_reason = updates.cancellationReason;
    if (updates.review !== undefined) dbPayload.review = updates.review;
    if (updates.paymentReference !== undefined) dbPayload.payment_reference = updates.paymentReference;
    if (updates.paymentProofUrl !== undefined) dbPayload.payment_proof_url = updates.paymentProofUrl;

    const { error } = await supabase
      .from('orders')
      .update(dbPayload)
      .eq('id', orderId);
    return !error;
  } catch (err) {
    console.warn('Error in updateOrderInSupabase:', err);
    return false;
  }
}

/**
 * Seed all initial dataset to Supabase in batch.
 */
export async function seedAllDataToSupabase(params: {
  businesses: Business[];
  products: Product[];
  orders: Order[];
  campaigns: WhatsAppCampaign[];
  chatbotConfig: ChatbotConfig;
  savedAddresses: SavedAddress[];
  users?: any[];
  clients?: any[];
}): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Businesses
    const bizRows = params.businesses.map(mapBusinessToDB);
    const { error: bizErr } = await supabase.from('businesses').upsert(bizRows, { onConflict: 'id' });
    if (bizErr) throw new Error(`Negocios: ${bizErr.message}`);

    // 2. Products
    const prodRows = params.products.map(mapProductToDB);
    const { error: prodErr } = await supabase.from('products').upsert(prodRows, { onConflict: 'id' });
    if (prodErr) throw new Error(`Productos: ${prodErr.message}`);

    // 3. Orders
    const orderRows = params.orders.map(mapOrderToDB);
    const { error: orderErr } = await supabase.from('orders').upsert(orderRows, { onConflict: 'id' });
    if (orderErr) throw new Error(`Órdenes: ${orderErr.message}`);

    // 4. WhatsApp Campaigns
    const campRows = params.campaigns.map(mapCampaignToDB);
    const { error: campErr } = await supabase.from('whatsapp_campaigns').upsert(campRows, { onConflict: 'id' });
    if (campErr) throw new Error(`Campañas: ${campErr.message}`);

    // 5. Chatbot Config
    const chatRow = mapChatbotToDB(params.chatbotConfig);
    const { error: chatErr } = await supabase.from('chatbot_config').upsert(chatRow, { onConflict: 'id' });
    if (chatErr) throw new Error(`Chatbot Config: ${chatErr.message}`);

    // 6. Saved Addresses
    const addrRows = params.savedAddresses.map(mapAddressToDB);
    const { error: addrErr } = await supabase.from('saved_addresses').upsert(addrRows, { onConflict: 'id' });
    if (addrErr) throw new Error(`Direcciones: ${addrErr.message}`);

    // 7. Users (optional)
    if (params.users && params.users.length > 0) {
      for (const u of params.users) {
        await insertUserInSupabase(u);
      }
    }

    // 8. Clients (optional)
    if (params.clients && params.clients.length > 0) {
      for (const c of params.clients) {
        await insertClientInSupabase(c);
      }
    }

    return {
      success: true,
      message: `¡Sincronización exitosa! Se sembraron ${bizRows.length} comercios/patrocinadores, ${prodRows.length} productos y ${orderRows.length} pedidos en Supabase.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error al sembrar en Supabase: ${err.message || err}`
    };
  }
}

/**
 * Updates a user in Supabase (personal data, email, password, phone, etc.)
 */
export async function updateUserInSupabase(
  userId: string,
  updates: {
    name?: string;
    username?: string;
    role?: string;
    email?: string;
    password?: string;
    phone?: string;
    address?: string;
    status?: string;
    businessId?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.username !== undefined) payload.username = updates.username;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.password !== undefined) {
      payload.password = updates.password;
      payload.password_hash = updates.password;
    }
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.status !== undefined) payload.status = updates.status;

    const { error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', userId);

    if (error) {
      console.warn('Error actualizando usuario en Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Excepción actualizando usuario en Supabase:', err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Deletes a user and related client record from Supabase
 */
export async function deleteUserInSupabase(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      console.warn('Error eliminando usuario de Supabase:', error);
      return { success: false, error: error.message };
    }
    await supabase.from('clients').delete().eq('user_id', userId);
    return { success: true };
  } catch (err: any) {
    console.warn('Excepción eliminando usuario de Supabase:', err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Checks if a username or email is already registered in Supabase
 */
export async function checkUserExistsInSupabase(
  username: string,
  email: string
): Promise<{ exists: boolean; reason?: string }> {
  try {
    const cleanUser = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase
      .from('users')
      .select('id, username, email')
      .or(`username.ilike.${cleanUser},email.ilike.${cleanEmail}`);

    if (error || !data) return { exists: false };

    for (const u of data) {
      if (u.username?.toLowerCase() === cleanUser) {
        return {
          exists: true,
          reason: `El nombre de usuario "${username}" ya está registrado en Supabase. Por favor elige otro nombre de usuario.`
        };
      }
      if (u.email?.toLowerCase() === cleanEmail) {
        return {
          exists: true,
          reason: `El correo electrónico "${email}" ya está registrado en Supabase. Puedes iniciar sesión con tus credenciales.`
        };
      }
    }
    return { exists: false };
  } catch (err) {
    return { exists: false };
  }
}

/**
 * Directly validates credentials against Supabase PostgreSQL
 */
export async function verifyUserCredentialsInSupabase(
  identifier: string,
  password: string
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  try {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.${cleanId},email.ilike.${cleanId}`)
      .limit(1);

    if (error || !data || data.length === 0) {
      return { success: false, error: 'Usuario o correo no encontrado en Supabase.' };
    }

    const row = data[0];
    const dbPass = row.password || row.password_hash || '';

    if (dbPass !== cleanPass) {
      return { success: false, error: 'Contraseña incorrecta. Verifica tus credenciales.' };
    }

    const mapped = mapUserFromDB(row);
    return { success: true, user: mapped };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Inserts a new user in Supabase (client, seller or admin)
 */
export async function insertUserInSupabase(
  user: any
): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    let validRole = user.role || 'client';
    // Ensure role matches check constraint (admin, seller, client)
    if (validRole !== 'admin' && validRole !== 'seller' && validRole !== 'client') {
      validRole = 'seller';
    }

    const cleanUsername = String(user.username || '').trim().toLowerCase();
    const cleanEmail = String(user.email || '').trim().toLowerCase();

    // Check duplicate username or email first in Supabase
    const dupCheck = await checkUserExistsInSupabase(cleanUsername, cleanEmail);
    if (dupCheck.exists) {
      return { success: false, error: dupCheck.reason };
    }

    // Try Supabase Auth signUp as well so the user appears in Supabase Authentication Dashboard
    try {
      if (cleanEmail && user.password && cleanEmail.includes('@')) {
        await supabase.auth.signUp({
          email: cleanEmail,
          password: user.password,
          options: {
            data: {
              name: user.name,
              username: cleanUsername,
              role: validRole
            }
          }
        });
      }
    } catch (authErr) {
      console.info('Supabase Auth signUp notification (non-blocking):', authErr);
    }

    const payload = {
      id: user.id,
      name: user.name,
      username: cleanUsername,
      email: cleanEmail,
      password: user.password,
      password_hash: user.password,
      role: validRole,
      business_id: user.businessId || null,
      phone: user.phone || null,
      address: user.address || null,
      status: user.status || 'active',
      department: user.department || (user.isSponsor ? 'Patrocinador Oficial' : null),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('users').upsert(payload, { onConflict: 'id' }).select();
    if (error) {
      if (error.code === '23505' || error.message.includes('unique constraint')) {
        if (error.message.includes('users_username_key')) {
          return { success: false, error: `El nombre de usuario "${cleanUsername}" ya está registrado en Supabase. Elige otro.` };
        }
        if (error.message.includes('users_email_key')) {
          return { success: false, error: `El correo "${cleanEmail}" ya está registrado en Supabase.` };
        }
        return { success: false, error: `Ya existe un usuario con esas credenciales en Supabase: ${error.message}` };
      }
      console.warn('Error insertando usuario en Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true, user: data?.[0] || payload };
  } catch (err: any) {
    console.warn('Excepción insertando usuario en Supabase:', err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Inserts or upserts a client in Supabase
 */
export async function insertClientInSupabase(client: any): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      id: client.id,
      user_id: client.userId || null,
      name: client.name,
      username: client.username,
      email: client.email,
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || 'Caracas',
      total_orders: Number(client.totalOrders ?? 0),
      total_spent: Number(client.totalSpent ?? 0),
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('clients').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('Error insertando cliente en Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Excepción insertando cliente en Supabase:', err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Inserts or upserts a business in Supabase
 */
export async function insertBusinessInSupabase(biz: Business): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = mapBusinessToDB(biz);
    const { error } = await supabase.from('businesses').upsert(payload, { onConflict: 'id' });
    if (error) {
      // If error is check constraint on category (code 23514), fallback to category 'restaurante'
      if (error.code === '23514' || error.message.includes('businesses_category_check')) {
        console.warn('Aplicando fallback de categoría para Supabase:', error.message);
        payload.category = 'restaurante';
        const { error: retryError } = await supabase.from('businesses').upsert(payload, { onConflict: 'id' });
        if (retryError) {
          console.warn('Error en reintento de negocio en Supabase:', retryError);
          return { success: false, error: retryError.message };
        }
        return { success: true };
      }
      console.warn('Error insertando negocio en Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Excepción insertando negocio en Supabase:', err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Deletes all sample/mock data from Supabase tables:
 * products, orders, businesses, whatsapp_campaigns, saved_addresses,
 * and all users EXCEPT admin_master.
 */
export async function clearAllSampleDataFromSupabase(): Promise<{ success: boolean; message: string }> {
  try {
    const errors: string[] = [];

    // 1. Delete all products
    const { error: prodErr } = await supabase.from('products').delete().neq('id', '__keep_none__');
    if (prodErr && !prodErr.message.includes('does not exist')) {
      errors.push(`Productos: ${prodErr.message}`);
    }

    // 2. Delete all orders
    const { error: ordErr } = await supabase.from('orders').delete().neq('id', '__keep_none__');
    if (ordErr && !ordErr.message.includes('does not exist')) {
      errors.push(`Órdenes: ${ordErr.message}`);
    }

    // 3. Delete all businesses
    const { error: bizErr } = await supabase.from('businesses').delete().neq('id', '__keep_none__');
    if (bizErr && !bizErr.message.includes('does not exist')) {
      errors.push(`Comercios: ${bizErr.message}`);
    }

    // 4. Delete campaigns
    const { error: campErr } = await supabase.from('whatsapp_campaigns').delete().neq('id', '__keep_none__');
    if (campErr && !campErr.message.includes('does not exist')) {
      errors.push(`Campañas: ${campErr.message}`);
    }

    // 5. Delete saved addresses
    const { error: addrErr } = await supabase.from('saved_addresses').delete().neq('id', '__keep_none__');
    if (addrErr && !addrErr.message.includes('does not exist')) {
      errors.push(`Direcciones: ${addrErr.message}`);
    }

    // 6. Delete sample clients
    const { error: clientErr } = await supabase.from('clients').delete().neq('id', '__keep_none__');
    if (clientErr && !clientErr.message.includes('does not exist')) {
      errors.push(`Clientes: ${clientErr.message}`);
    }

    // 7. Delete sample employees
    const { error: empErr } = await supabase.from('employees').delete().neq('id', '__keep_none__');
    if (empErr && !empErr.message.includes('does not exist')) {
      errors.push(`Empleados: ${empErr.message}`);
    }

    // 8. Delete sample drivers
    const { error: drvErr } = await supabase.from('drivers').delete().neq('id', '__keep_none__');
    if (drvErr && !drvErr.message.includes('does not exist')) {
      errors.push(`Motorizados: ${drvErr.message}`);
    }

    // 9. Delete all demo users EXCEPT admin_master and haroldo90
    const { error: userErr } = await supabase
      .from('users')
      .delete()
      .neq('username', 'admin_master')
      .neq('username', 'haroldo90');
    if (userErr && !userErr.message.includes('does not exist')) {
      errors.push(`Usuarios: ${userErr.message}`);
    }

    // 10. Ensure admin_master is guaranteed to exist
    try {
      await supabase.from('users').upsert({
        id: 'usr_admin_master',
        username: 'admin_master',
        name: 'Administrador Maestro ConForce',
        email: 'admin@conforce.com',
        password: 'Chevropar#1970',
        password_hash: 'Chevropar#1970',
        role: 'admin',
        phone: '+58 412 1234567',
        address: 'Sede Central ConForce, Caracas',
        status: 'active',
        department: 'Dirección General'
      }, { onConflict: 'username' });
    } catch (e) {
      console.warn('Upsert master admin warning:', e);
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: `Algunas tablas reportaron avisos: ${errors.join(', ')}`
      };
    }

    return {
      success: true,
      message: 'Tablas de productos, órdenes, comercios, motorizados y usuarios demo limpiadas en Supabase (admin_master y haroldo90 preservados).'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error al limpiar Supabase: ${err.message || String(err)}`
    };
  }
}

// ==========================================
// DRIVERS (MOTORIZADOS / MENSAJEROS)
// ==========================================

export function mapDriverFromDB(row: any): DriverProfile {
  return {
    id: row.id,
    userId: row.user_id || `usr-driver-${row.id}`,
    fullName: row.full_name || row.name || 'Mensajero ConForce',
    username: row.username || 'motorizado',
    email: row.email || '',
    phone: row.phone || '',
    ciDni: row.ci_dni || '',
    motorcycleBrandModel: row.motorcycle_brand_model || 'Moto Express',
    plateNumber: row.plate_number || 'S/P',
    driverLicense: row.driver_license || undefined,
    status: (row.status as any) || 'active',
    isAvailable: Boolean(row.is_available ?? true),
    currentCoords: row.current_coords || undefined,
    rating: Number(row.rating ?? 5.0),
    totalDeliveries: Number(row.total_deliveries ?? 0),
    earningsBalance: Number(row.earnings_balance ?? 0),
    bankName: row.bank_name || undefined,
    bankPhone: row.bank_phone || undefined,
    bankIdNumber: row.bank_id_number || undefined,
    city: row.city || 'Caracas',
    createdAt: row.created_at || new Date().toISOString(),
    avatarUrl: row.avatar_url || undefined,
    idDocumentPhoto: row.id_document_photo || undefined,
    licensePhoto: row.license_photo || undefined,
    motorcyclePhoto: row.motorcycle_photo || undefined,
    vehicleDocPhoto: row.vehicle_doc_photo || undefined
  };
}

export function mapDriverToDB(driver: DriverProfile): any {
  return {
    id: driver.id,
    user_id: driver.userId,
    full_name: driver.fullName,
    username: driver.username,
    email: driver.email,
    phone: driver.phone,
    ci_dni: driver.ciDni,
    motorcycle_brand_model: driver.motorcycleBrandModel,
    plate_number: driver.plateNumber,
    driver_license: driver.driverLicense || null,
    status: driver.status,
    is_available: driver.isAvailable,
    current_coords: driver.currentCoords || null,
    rating: driver.rating,
    total_deliveries: driver.totalDeliveries,
    earnings_balance: driver.earningsBalance,
    bank_name: driver.bankName || null,
    bank_phone: driver.bankPhone || null,
    bank_id_number: driver.bankIdNumber || null,
    city: driver.city || 'Caracas',
    created_at: driver.createdAt,
    avatar_url: driver.avatarUrl || null,
    id_document_photo: driver.idDocumentPhoto || null,
    license_photo: driver.licensePhoto || null,
    motorcycle_photo: driver.motorcyclePhoto || null,
    vehicle_doc_photo: driver.vehicleDocPhoto || null
  };
}

export async function fetchDriversFromSupabase(): Promise<DriverProfile[] | null> {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Table might not exist yet before SQL migration runs
      return null;
    }
    return (data || []).map(mapDriverFromDB);
  } catch (err) {
    return null;
  }
}

export async function upsertDriverInSupabase(driver: DriverProfile): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('drivers')
      .upsert(mapDriverToDB(driver), { onConflict: 'id' });
    if (error) {
      console.warn('Supabase upsertDriver error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase upsertDriver exception:', err);
    return false;
  }
}





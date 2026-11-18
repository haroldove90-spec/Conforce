export type Role = 'client' | 'seller' | 'admin' | 'driver';

export type BusinessCategory =
  | 'supermercado'
  | 'farmacia'
  | 'restaurante'
  | 'tecnologia'
  | 'moda'
  | 'hogar'
  | 'belleza'
  | 'automotriz'
  | 'servicios'
  | 'general'
  | string;

export interface Coordinates {
  lat: number;
  lng: number;
}

export type BusinessOperationalStatus = 'open' | 'paused' | 'closed';

export interface DailySchedule {
  open: string;
  close: string;
  closed?: boolean;
}

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  description?: string;
  logo: string;
  bannerImage: string;
  phone: string;
  whatsapp?: string;
  address: string;
  coordinates: Coordinates;
  openingHours: string;
  operationalStatus?: BusinessOperationalStatus;
  pausedUntil?: string;
  weeklySchedule?: Record<string, DailySchedule>;
  holidayClosures?: string[]; // YYYY-MM-DD
  customCategories?: string[];
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  isActive: boolean;
  commissionRate: number; // e.g. 10 (%)
  customPinColor: string;
  deliveryTime: string; // e.g. '20-35 min'
  minOrder: number;
  tags: string[];
  isSponsor?: boolean;
  ownerUsername?: string;
  rif?: string;
  email?: string;
  city?: string;
  state?: string;
  paymentInfo?: {
    bankName?: string;
    phone?: string;
    documentId?: string;
    accountHolder?: string;
    zelleEmail?: string;
  };
}

export interface ProductVariantOption {
  id: string;
  label: string; // e.g. "Pequeña", "Mediana", "Grande", "Talla S", "Talla M"
  priceDelta: number; // in Bs. (+0, +50, etc.)
  priceDeltaUsd?: number; // in USD
  inStock?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Tamaño / Porción", "Talla", "Color", "Presentación"
  options: ProductVariantOption[];
}

export interface ProductModifierGroup {
  id: string;
  name: string; // e.g. "Término de la carne", "Salsas", "Contornos"
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: ProductVariantOption[];
}

export interface ProductExtra {
  id: string;
  name: string; // e.g. "Queso Cheddar Fundido", "Tocineta Crocante", "Salsa Especial"
  price: number; // in Bs.
  priceUsd?: number; // in USD
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number; // in Bs.
  priceUsd?: number; // in USD ($)
  originalPrice?: number;
  category: string;
  image: string; // primary image (base64 or URL)
  images?: string[]; // additional photo gallery from device
  inStock: boolean;
  stockCount: number;
  tags: string[]; // for Chatbot search: e.g. ['paracetamol', 'analgesico', 'fiebre']
  isOfferOfTheDay: boolean;
  isBoosted?: boolean;
  boostTier?: 'basic' | 'pro' | 'premium';
  boostExpiresAt?: string;

  // Restaurant & food specific attributes
  ingredients?: string[]; // e.g. ["Carne 150g", "Queso cheddar", "Tocineta"]
  extras?: ProductExtra[]; // e.g. customizable additions
  preparationTime?: string; // e.g. "15-20 min"
  foodTags?: string[]; // e.g. ["picante", "vegetariano", "sin_gluten"]

  // Variable product attributes & modifier groups
  hasVariants?: boolean;
  variants?: ProductVariant[];
  modifierGroups?: ProductModifierGroup[];
}

export interface BoostPlan {
  id: 'boost_3d' | 'boost_7d' | 'boost_15d';
  name: string;
  days: number;
  price: number;
  impressionsEstimate: string;
  badgeText: string;
  recommended?: boolean;
}

export interface FailedSearchRecord {
  id: string;
  term: string;
  categoryGuess: string;
  count: number;
  firstSearchedAt: string;
  lastSearchedAt: string;
  status: 'pending' | 'evaluating' | 'added' | 'dismissed';
  userLocationHint?: string;
  notes?: string;
}

export interface SelectedExtra {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  businessId: string;
  selectedVariantOption?: { variantName: string; optionLabel: string; priceDelta: number };
  selectedExtras?: SelectedExtra[];
  selectedModifiers?: { groupName: string; optionLabel: string; priceDelta: number }[];
  kitchenNotes?: string; // e.g. "Sin cebolla, salsa tártara aparte"
  itemTotalBs?: number; // total price per unit including variant & extras
}

export type OrderStatus =
  | 'pending_confirmation'
  | 'preparing'
  | 'ready'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';
export type DeliveryType = 'pickup' | 'delivery';
export type PaymentMethod =
  | 'pago_movil'
  | 'bank_transfer'
  | 'card'
  | 'cash_on_delivery'
  | 'pos_terminal';
export type OrderChannel = 'app' | 'whatsapp';
export type DriverStep =
  | 'assigned'
  | 'heading_to_store'
  | 'picked_up'
  | 'heading_to_client'
  | 'arrived_at_client'
  | 'delivered';

export interface OrderReview {
  rating: number; // 1-5 (negocio)
  comment?: string;
  driverRating?: number; // 1-5 (repartidor)
  driverComment?: string;
  ratedAt: string;
}

export interface OrderSettlement {
  storeNetBs: number;
  driverPayoutBs: number;
  platformCommissionBs: number;
  settledAt: string;
}

export interface Order {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo: string;
  customerName: string;
  customerPhone: string;
  customerUsername?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee?: number;
  serviceFeeRate?: number;
  promoCode?: string;
  discountAmount?: number;
  driverTip?: number;
  total: number;
  deliveryType: DeliveryType;
  deliveryAddress: string;
  deliveryCoordinates?: Coordinates;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentProofUrl?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  driverStep?: DriverStep;
  driverAssignedAt?: string;
  driverDeliveredAt?: string;
  prepTimeMinutes?: number;
  acceptedAt?: string;
  deliveryPin?: string;
  deliveryProofPhoto?: string;
  cashCollectedByDriver?: number;
  refundAmount?: number;
  refundReason?: string;
  cancellationReason?: string;
  review?: OrderReview;
  settlement?: OrderSettlement;
  orderChannel?: OrderChannel;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

export interface PromoCoupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percent' | 'fixed_bs' | 'free_delivery';
  discountValue: number; // e.g. 15 (%) or 50 (Bs.)
  minOrderBs: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  couponCode?: string;
  bgColor: string;
  isActive: boolean;
}

export interface PlatformTariffConfig {
  baseDeliveryFeeBs: number;
  perKmFeeBs: number;
  dynamicMultiplier: number; // 1.0 normal, 1.25 hora pico, 1.5 lluvia
  dynamicLabel: string;
  defaultCommissionRate: number;
  serviceFeeRatePercent: number;
  orderAcceptTimeoutMin: number;
  driverOfferTimeoutSec: number;
}

export interface DriverPayoutRequest {
  id: string;
  driverId: string;
  driverName: string;
  amountBs: number;
  bankName: string;
  bankPhone: string;
  bankIdNumber: string;
  status: 'pending' | 'paid' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

export interface SupportTicket {
  id: string;
  orderId?: string;
  requesterName: string;
  requesterRole: Role;
  subject: string;
  message: string;
  status: 'open' | 'resolved' | 'refunded';
  resolutionNote?: string;
  createdAt: string;
}

export interface WhatsAppCampaign {
  id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'farmacias_users' | 'food_users' | 'inactive_users';
  status: 'draft' | 'scheduled' | 'sent';
  sentCount: number;
  openRate: number;
  clickRate: number;
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  type?: 'text' | 'location' | 'product_card' | 'business_card' | 'quick_reply';
  data?: any;
}

export interface ChatbotConfig {
  metaApiToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
  welcomeMessage: string;
  featuredOfferId: string;
  autoDeepLinksEnabled: boolean;
  geminiSmartSearch: boolean;
  maxDistanceKm: number;
  customKeywords: { keyword: string; category: BusinessCategory; targetTag: string }[];
}

export interface SavedAddress {
  id: string;
  label: string; // 'Casa', 'Oficina', 'Mamá'
  address: string;
  coordinates: Coordinates;
  isDefault?: boolean;
}

export type AccountStatus = 'active' | 'suspended';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: Role;
  status: AccountStatus;
  phone?: string;
  address?: string;
  businessId?: string;
  department?: string;
  createdAt: string;
  lastLogin?: string;
  isSponsor?: boolean;
}

export interface ClientProfile {
  id: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  status: AccountStatus;
  registeredAt: string;
}

export interface EmployeeProfile {
  id: string;
  userId: string;
  fullName: string;
  username: string;
  email: string;
  password: string; // Plain/masked representation for administrative credential review
  roleTitle: string; // e.g. 'Superadministrador', 'Administrador de Operaciones'
  systemRole: Role;
  department: string;
  status: AccountStatus;
  createdAt: string;
}

export type DriverStatus = 'pending_approval' | 'active' | 'busy' | 'suspended';
export type DriverVehicleType = 'moto' | 'bicicleta' | 'auto';

export interface DriverProfile {
  id: string;
  userId: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  ciDni: string;
  vehicleType?: DriverVehicleType;
  motorcycleBrandModel: string;
  plateNumber: string;
  driverLicense?: string;
  status: DriverStatus;
  isAvailable: boolean;
  currentCoords?: Coordinates;
  rating: number; // 1-5
  totalDeliveries: number;
  earningsBalance: number; // In Bs.
  tipsBalance?: number;
  bonusBalance?: number;
  cashCollectedDebt?: number; // Efectivo cobrado contra entrega pendiente de cuadrar
  bankName?: string;
  bankPhone?: string;
  bankIdNumber?: string;
  city?: string;
  createdAt: string;

  // Fotografías y Documentos de Verificación desde dispositivo/cámara
  avatarUrl?: string; // Foto de perfil / selfie del conductor
  idDocumentPhoto?: string; // Foto de Cédula de Identidad / DNI
  licensePhoto?: string; // Foto de la Licencia de Conducir
  motorcyclePhoto?: string; // Foto de la Moto y Placa
  vehicleDocPhoto?: string; // Carnet de circulación / Título
}

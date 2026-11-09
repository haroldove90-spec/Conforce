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

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  description?: string;
  logo: string;
  bannerImage: string;
  phone: string;
  address: string;
  coordinates: Coordinates;
  openingHours: string;
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
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  inStock: boolean;
  stockCount: number;
  tags: string[]; // for Chatbot search: e.g. ['paracetamol', 'analgesico', 'fiebre']
  isOfferOfTheDay: boolean;
  isBoosted?: boolean;
  boostTier?: 'basic' | 'pro' | 'premium';
  boostExpiresAt?: string;
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

export interface CartItem {
  product: Product;
  quantity: number;
  businessId: string;
}

export type OrderStatus = 'preparing' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled';
export type DeliveryType = 'pickup' | 'delivery';
export type PaymentMethod =
  | 'pago_movil'
  | 'bank_transfer'
  | 'card'
  | 'cash_on_delivery'
  | 'pos_terminal';
export type OrderChannel = 'app' | 'whatsapp';
export type DriverStep = 'assigned' | 'heading_to_store' | 'picked_up' | 'heading_to_client' | 'delivered';

export interface OrderReview {
  rating: number; // 1-5
  comment?: string;
  ratedAt: string;
}

export interface Order {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee?: number;
  serviceFeeRate?: number;
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
  cancellationReason?: string;
  review?: OrderReview;
  orderChannel?: OrderChannel;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
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

export interface DriverProfile {
  id: string;
  userId: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  ciDni: string;
  motorcycleBrandModel: string;
  plateNumber: string;
  driverLicense?: string;
  status: DriverStatus;
  isAvailable: boolean;
  currentCoords?: Coordinates;
  rating: number; // 1-5
  totalDeliveries: number;
  earningsBalance: number; // In Bs.
  bankName?: string;
  bankPhone?: string;
  bankIdNumber?: string;
  city?: string;
  createdAt: string;
}


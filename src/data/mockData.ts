import {
  Business,
  Product,
  Order,
  WhatsAppCampaign,
  ChatbotConfig,
  SavedAddress,
  UserAccount,
  ClientProfile,
  EmployeeProfile,
  DriverProfile,
  BoostPlan,
  FailedSearchRecord
} from '../types';

export const DATA_VERSION = 'conforce_mock_v7';

export const INITIAL_EMPLOYEES: EmployeeProfile[] = [
  {
    id: 'emp-admin-master',
    userId: 'usr-admin-master',
    fullName: 'Administrador Master ConForce',
    username: 'admin_master',
    email: 'admin_master@conforce.com',
    password: 'Chevropar#1970',
    roleTitle: 'Superadministrador Master & Control Global',
    systemRole: 'admin',
    department: 'Dirección General & Superadministración',
    status: 'active',
    createdAt: '2026-01-01'
  },
  {
    id: 'emp-harold',
    userId: 'usr-harold',
    fullName: 'Harold Anguiano Morales',
    username: 'haroldo90',
    email: 'haroldo90@hotmail.com',
    password: 'Chevropar#1970',
    roleTitle: 'Director General & Superadministrador',
    systemRole: 'admin',
    department: 'Dirección General & Tecnología',
    status: 'active',
    createdAt: '2026-01-15'
  },
  {
    id: 'emp-anyl',
    userId: 'usr-anyl',
    fullName: 'Anyl',
    username: 'anyl_admin',
    email: 'anyl@conforce.com',
    password: 'Anyl#ConForce2026*!',
    roleTitle: 'Administrador de Operaciones & Sistemas',
    systemRole: 'admin',
    department: 'Operaciones & Soporte',
    status: 'active',
    createdAt: '2026-02-01'
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-admin-master',
    name: 'Administrador Master ConForce',
    username: 'admin_master',
    email: 'admin_master@conforce.com',
    password: 'Chevropar#1970',
    role: 'admin',
    status: 'active',
    department: 'Dirección General',
    phone: '+52 55 9988 7766',
    createdAt: '2026-01-01',
    lastLogin: '2026-09-21 17:00'
  },
  {
    id: 'usr-harold',
    name: 'Harold Anguiano Morales',
    username: 'haroldo90',
    email: 'haroldove90@gmail.com',
    password: 'Chevropar#1970',
    role: 'admin',
    status: 'active',
    department: 'Dirección General & Superadministración',
    phone: '+52 55 1122 3344',
    createdAt: '2026-01-15',
    lastLogin: '2026-09-03 21:30'
  },
  {
    id: 'usr-anyl',
    name: 'Anyl',
    username: 'anyl_admin',
    email: 'anyl@conforce.com',
    password: 'Anyl#ConForce2026*!',
    role: 'admin',
    status: 'active',
    department: 'Operaciones & Sistemas',
    phone: '+52 55 2233 4455',
    createdAt: '2026-02-01',
    lastLogin: '2026-09-07 11:30'
  },
  {
    id: 'usr-biz-1',
    name: 'Gerente San Rafael',
    username: 'farmacia_sanrafael',
    email: 'contacto@sanrafael.com',
    password: 'SanRafael#2026',
    role: 'seller',
    status: 'active',
    businessId: 'biz-farmacia-1',
    phone: '+52 55 8765 4321',
    createdAt: '2026-03-10',
    lastLogin: '2026-09-03 18:40'
  },
  {
    id: 'usr-client-1',
    name: 'María Elena López',
    username: 'marialopez',
    email: 'maria.lopez@gmail.com',
    password: 'Cliente#2026',
    role: 'client',
    status: 'active',
    phone: '+52 55 4321 9876',
    address: 'Av. Insurgentes Sur 450, Roma Norte, CDMX',
    createdAt: '2026-04-12',
    lastLogin: '2026-09-03 19:10'
  },
  {
    id: 'usr-client-2',
    name: 'Carlos Mendoza',
    username: 'carlosm',
    email: 'carlos.mendoza@yahoo.com',
    password: 'Carlos#2026',
    role: 'client',
    status: 'active',
    phone: '+52 55 9876 5432',
    address: 'Calle Durango 220, Col. Roma Norte, CDMX',
    createdAt: '2026-05-20',
    lastLogin: '2026-09-02 14:22'
  },
  {
    id: 'usr-client-3',
    name: 'Sofía Ramírez',
    username: 'sofiaramirez',
    email: 'sofia.ramirez@outlook.com',
    password: 'Sofia#2026',
    role: 'client',
    status: 'active',
    phone: '+52 55 3344 5566',
    address: 'Av. Coyoacán 810, Col. Del Valle, CDMX',
    createdAt: '2026-06-08',
    lastLogin: '2026-08-30 11:05'
  },
  {
    id: 'usr-driver-1',
    name: 'Carlos Mendoza (Motorizado)',
    username: 'carlos_moto',
    email: 'carlos.moto@conforce.com',
    password: 'Chevropar#1970',
    role: 'driver',
    status: 'active',
    phone: '+58 412 9988776',
    address: 'Caracas Centro, Municipio Libertador',
    createdAt: '2026-07-01',
    lastLogin: '2026-09-08 10:15'
  },
  {
    id: 'usr-driver-2',
    name: 'José Gregorio Rivas',
    username: 'jose_moto',
    email: 'jose.moto@conforce.com',
    password: 'Chevropar#1970',
    role: 'driver',
    status: 'active',
    phone: '+58 414 5544332',
    address: 'Chacao, Caracas',
    createdAt: '2026-08-10',
    lastLogin: '2026-09-08 11:30'
  }
];

export const INITIAL_DRIVERS: DriverProfile[] = [
  {
    id: 'drv-1',
    userId: 'usr-driver-1',
    fullName: 'Carlos Mendoza',
    username: 'carlos_moto',
    email: 'carlos.moto@conforce.com',
    phone: '+58 412 9988776',
    ciDni: 'V-24.891.302',
    motorcycleBrandModel: 'Bera SBR 150 (Azul)',
    plateNumber: 'AA1B22',
    driverLicense: 'LIC-24891302',
    status: 'active',
    isAvailable: true,
    currentCoords: { lat: 10.4850, lng: -66.9020 },
    rating: 4.9,
    totalDeliveries: 128,
    earningsBalance: 1420.00,
    bankName: 'Banesco (0134)',
    bankPhone: '+58 412 9988776',
    bankIdNumber: 'V-24891302',
    city: 'Caracas',
    createdAt: '2026-07-01'
  },
  {
    id: 'drv-2',
    userId: 'usr-driver-2',
    fullName: 'José Gregorio Rivas',
    username: 'jose_moto',
    email: 'jose.moto@conforce.com',
    phone: '+58 414 5544332',
    ciDni: 'V-22.104.991',
    motorcycleBrandModel: 'Empire Keeway Horse 150 (Rojo)',
    plateNumber: 'AC9X10',
    driverLicense: 'LIC-22104991',
    status: 'active',
    isAvailable: true,
    currentCoords: { lat: 10.4910, lng: -66.8620 },
    rating: 4.8,
    totalDeliveries: 94,
    earningsBalance: 980.00,
    bankName: 'Banco de Venezuela (0102)',
    bankPhone: '+58 414 5544332',
    bankIdNumber: 'V-22104991',
    city: 'Caracas - Chacao',
    createdAt: '2026-08-10'
  },
  {
    id: 'drv-3',
    userId: 'usr-driver-3',
    fullName: 'Alejandro Morales',
    username: 'alejandro_repartidor',
    email: 'alejandro.moto@gmail.com',
    phone: '+58 424 7711223',
    ciDni: 'V-26.440.119',
    motorcycleBrandModel: 'Suzuki GN 125 (Negra)',
    plateNumber: 'AB8K44',
    driverLicense: 'LIC-26440119',
    status: 'pending_approval',
    isAvailable: false,
    currentCoords: { lat: 10.4780, lng: -66.8950 },
    rating: 5.0,
    totalDeliveries: 0,
    earningsBalance: 0,
    bankName: 'Bancamiga (0172)',
    bankPhone: '+58 424 7711223',
    bankIdNumber: 'V-26440119',
    city: 'Caracas - La Candelaria',
    createdAt: '2026-11-05'
  }
];

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'cli-1',
    userId: 'usr-client-1',
    name: 'María Elena López',
    username: 'marialopez',
    email: 'maria.lopez@gmail.com',
    phone: '+52 55 4321 9876',
    address: 'Av. Insurgentes Sur 450, Roma Norte, CDMX',
    totalOrders: 14,
    totalSpent: 3450,
    status: 'active',
    registeredAt: '2026-04-12'
  },
  {
    id: 'cli-2',
    userId: 'usr-client-2',
    name: 'Carlos Mendoza',
    username: 'carlosm',
    email: 'carlos.mendoza@yahoo.com',
    phone: '+52 55 9876 5432',
    address: 'Calle Durango 220, Col. Roma Norte, CDMX',
    totalOrders: 8,
    totalSpent: 1980,
    status: 'active',
    registeredAt: '2026-05-20'
  },
  {
    id: 'cli-3',
    userId: 'usr-client-3',
    name: 'Sofía Ramírez',
    username: 'sofiaramirez',
    email: 'sofia.ramirez@outlook.com',
    phone: '+52 55 3344 5566',
    address: 'Av. Coyoacán 810, Col. Del Valle, CDMX',
    totalOrders: 5,
    totalSpent: 1240,
    status: 'active',
    registeredAt: '2026-06-08'
  }
];

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'biz-farmacia-1',
    name: 'Farmacias San Rafael Express',
    category: 'farmacia',
    logo: '💊',
    bannerImage: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=60',
    phone: '+52 55 8765 4321',
    address: 'Av. Central 452, Col. Del Valle',
    coordinates: { lat: 19.3985, lng: -99.1685 },
    openingHours: '24 Horas (Lunes a Domingo)',
    rating: 4.8,
    reviewsCount: 142,
    isVerified: true,
    isActive: true,
    commissionRate: 8,
    customPinColor: '#10b981',
    deliveryTime: '15-25 min',
    minOrder: 100,
    tags: ['farmacia', 'medicamentos', 'urgencias', 'salud', 'paracetamol', 'antigripal', 'dolor']
  },
  {
    id: 'biz-farmacia-2',
    name: 'Farmacia & Dermocuidado Vitalis',
    category: 'farmacia',
    logo: '🌿',
    bannerImage: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&auto=format&fit=crop&q=60',
    phone: '+52 55 1234 5678',
    address: 'Calle Durango 188, Col. Roma Norte',
    coordinates: { lat: 19.4190, lng: -99.1650 },
    openingHours: '08:00 AM - 10:00 PM',
    rating: 4.9,
    reviewsCount: 98,
    isVerified: true,
    isActive: true,
    commissionRate: 9,
    customPinColor: '#059669',
    deliveryTime: '20-30 min',
    minOrder: 150,
    tags: ['dermocosmetica', 'vitaminas', 'suplementos', 'pediatria', 'analgesico', 'bloqueador', 'skincare']
  },
  {
    id: 'biz-farmacia-3',
    name: 'Farmacia Familiar & Pediátrica San Lucas',
    category: 'farmacia',
    logo: '🍼',
    bannerImage: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800&auto=format&fit=crop&q=60',
    phone: '+52 55 4433 2211',
    address: 'Av. Coyoacán 810, Col. Del Valle Sur',
    coordinates: { lat: 19.3750, lng: -99.1710 },
    openingHours: '07:00 AM - 11:00 PM',
    rating: 4.9,
    reviewsCount: 165,
    isVerified: true,
    isActive: true,
    commissionRate: 8,
    customPinColor: '#0ea5e9',
    deliveryTime: '20-35 min',
    minOrder: 120,
    tags: ['pediatria', 'bebes', 'panales', 'leche', 'termometro', 'infantil', 'salud']
  },
  {
    id: 'biz-farmacia-4',
    name: 'Farmacia Botica Natural VerdeVida',
    category: 'farmacia',
    logo: '🍃',
    bannerImage: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=800&auto=format&fit=crop&q=60',
    phone: '+52 55 9988 7766',
    address: 'Av. Tamaulipas 64, Col. Condesa',
    coordinates: { lat: 19.4110, lng: -99.1730 },
    openingHours: '09:00 AM - 09:00 PM',
    rating: 4.7,
    reviewsCount: 84,
    isVerified: true,
    isActive: true,
    commissionRate: 8,
    customPinColor: '#16a34a',
    deliveryTime: '25-40 min',
    minOrder: 130,
    tags: ['natural', 'homeopatia', 'propoleo', 'colageno', 'herbolaria', 'te', 'suplementos']
  },
  {
    id: 'biz-resto-1',
    name: 'Burger Craft & Wings House',
    category: 'restaurante',
    logo: '🍔',
    bannerImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
    phone: '+52 55 9876 5432',
    address: 'Av. Insurgentes Sur 1205, Mixcoac',
    coordinates: { lat: 19.3780, lng: -99.1790 },
    openingHours: '12:00 PM - 11:30 PM',
    rating: 4.7,
    reviewsCount: 310,
    isVerified: true,
    isActive: true,
    commissionRate: 12,
    customPinColor: '#f97316',
    deliveryTime: '25-40 min',
    minOrder: 120,
    tags: ['hamburguesas', 'alitas', 'papas', 'comida rapida', 'cena', 'bbq', 'tocino']
  },
  {
    id: 'biz-resto-2',
    name: 'Pizzería Napolitana Bella Forno',
    category: 'restaurante',
    logo: '🍕',
    bannerImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60',
    phone: '+52 55 4567 8901',
    address: 'Av. Álvaro Obregón 85, Col. Condesa',
    coordinates: { lat: 19.4165, lng: -99.1600 },
    openingHours: '01:00 PM - 11:00 PM',
    rating: 4.9,
    reviewsCount: 224,
    isVerified: true,
    isActive: true,
    commissionRate: 10,
    customPinColor: '#ef4444',
    deliveryTime: '30-45 min',
    minOrder: 180,
    tags: ['pizza', 'artesanal', 'italiana', 'pasta', 'lasagna', 'cena', 'pepperoni']
  },
  {
    id: 'biz-resto-3',
    name: 'Tacos Los Compadres & Birria',
    category: 'restaurante',
    logo: '🌮',
    bannerImage: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=60',
    phone: '+52 55 3322 1100',
    address: 'Eje Central Lázaro Cárdenas 210, Centro',
    coordinates: { lat: 19.4340, lng: -99.1410 },
    openingHours: '10:00 AM - 02:00 AM',
    rating: 4.8,
    reviewsCount: 450,
    isVerified: true,
    isActive: true,
    commissionRate: 10,
    customPinColor: '#eab308',
    deliveryTime: '15-30 min',
    minOrder: 80,
    tags: ['tacos', 'pastor', 'birria', 'consome', 'antojitos', 'cena', 'quesadillas']
  },
  {
    id: 'biz-resto-4',
    name: 'Sushi Roll Master & Poke Bar',
    category: 'restaurante',
    logo: '🍣',
    bannerImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=60',
    phone: '+52 55 6677 8899',
    address: 'Calle Michoacán 42, Col. Condesa',
    coordinates: { lat: 19.4125, lng: -99.1705 },
    openingHours: '12:30 PM - 10:30 PM',
    rating: 4.8,
    reviewsCount: 189,
    isVerified: true,
    isActive: true,
    commissionRate: 11,
    customPinColor: '#ec4899',
    deliveryTime: '25-35 min',
    minOrder: 150,
    tags: ['sushi', 'poke', 'salmon', 'japonesa', 'rollos', 'mariscos', 'tempura']
  },
  {
    id: 'biz-resto-5',
    name: 'Café & Panadería Artesanal La Toscana',
    category: 'restaurante',
    logo: '☕',
    bannerImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=60',
    phone: '+52 55 5544 3322',
    address: 'Av. Sonora 140, Parque México',
    coordinates: { lat: 19.4140, lng: -99.1680 },
    openingHours: '07:30 AM - 09:00 PM',
    rating: 4.9,
    reviewsCount: 278,
    isVerified: true,
    isActive: true,
    commissionRate: 9,
    customPinColor: '#8b5cf6',
    deliveryTime: '15-25 min',
    minOrder: 90,
    tags: ['cafe', 'panaderia', 'croissant', 'desayunos', 'postres', 'latte', 'sandwiches']
  },
  {
    id: 'biz-resto-6',
    name: 'Pollo Asado Campestre & Parrilla',
    category: 'restaurante',
    logo: '🍗',
    bannerImage: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&auto=format&fit=crop&q=60',
    phone: '+52 55 1199 8844',
    address: 'Calzada de Tlalpan 920, Benito Juárez',
    coordinates: { lat: 19.3890, lng: -99.1430 },
    openingHours: '11:00 AM - 08:00 PM',
    rating: 4.6,
    reviewsCount: 195,
    isVerified: true,
    isActive: true,
    commissionRate: 10,
    customPinColor: '#d97706',
    deliveryTime: '20-35 min',
    minOrder: 110,
    tags: ['pollo', 'asado', 'parrillada', 'frijoles', 'comida casera', 'familiar']
  },
  {
    id: 'biz-resto-7',
    name: 'Dulce Tentación & Gelato Italiano',
    category: 'restaurante',
    logo: '🍨',
    bannerImage: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&auto=format&fit=crop&q=60',
    phone: '+52 55 8822 6644',
    address: 'Calle Amsterdam 102, Col. Hipódromo',
    coordinates: { lat: 19.4115, lng: -99.1660 },
    openingHours: '11:30 AM - 10:00 PM',
    rating: 4.9,
    reviewsCount: 312,
    isVerified: true,
    isActive: true,
    commissionRate: 10,
    customPinColor: '#06b6d4',
    deliveryTime: '15-25 min',
    minOrder: 95,
    tags: ['helados', 'gelato', 'crepas', 'waffles', 'postres', 'malteadas', 'dulce']
  },
  {
    id: 'biz-resto-8',
    name: 'Burritos & Quesadillas Norteñas',
    category: 'restaurante',
    logo: '🌯',
    bannerImage: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&auto=format&fit=crop&q=60',
    phone: '+52 55 7711 2233',
    address: 'Calle Río Lerma 88, Col. Cuauhtémoc',
    coordinates: { lat: 19.4270, lng: -99.1670 },
    openingHours: '11:00 AM - 11:00 PM',
    rating: 4.7,
    reviewsCount: 140,
    isVerified: true,
    isActive: true,
    commissionRate: 10,
    customPinColor: '#b45309',
    deliveryTime: '20-30 min',
    minOrder: 100,
    tags: ['burritos', 'quesadillas', 'machaca', 'arrachera', 'guacamole', 'norteno']
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Farmacia San Rafael
  {
    id: 'prod-1',
    businessId: 'biz-farmacia-1',
    name: 'Paracetamol 500mg (Caja 20 tabletas)',
    description: 'Analgésico y antipirético para alivio rápido de dolor de cabeza, muscular y fiebre.',
    price: 45,
    originalPrice: 65,
    category: 'Medicamentos',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 85,
    tags: ['paracetamol', 'analgesico', 'fiebre', 'dolor de cabeza', 'medicamento', 'pastillas'],
    isOfferOfTheDay: true,
    isBoosted: true,
    boostTier: 'pro',
    boostExpiresAt: '2026-09-20'
  },
  {
    id: 'prod-2',
    businessId: 'biz-farmacia-1',
    name: 'Ibuprofeno 400mg (10 cápsulas)',
    description: 'Antiinflamatorio no esteroideo para dolores agudos, inflamación y cólicos.',
    price: 78,
    originalPrice: 95,
    category: 'Medicamentos',
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 42,
    tags: ['ibuprofeno', 'inflamacion', 'dolor', 'colicos', 'muscular', 'medicamento'],
    isOfferOfTheDay: false
  },
  {
    id: 'prod-3',
    businessId: 'biz-farmacia-1',
    name: 'Antigripal Descongestivo Jarabe 120ml',
    description: 'Fórmula completa para tos, congestión nasal y síntomas de gripe común.',
    price: 110,
    category: 'Respiratorio',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 20,
    tags: ['antigripal', 'gripe', 'tos', 'jarabe', 'resfriado', 'descongestivo'],
    isOfferOfTheDay: false
  },
  {
    id: 'prod-4',
    businessId: 'biz-farmacia-1',
    name: 'Suero Oral Electrolitos 500ml',
    description: 'Solución rehidratante oral sabor manzana para deshidratación y recuperación.',
    price: 32,
    originalPrice: 40,
    category: 'Cuidado & Bienestar',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 150,
    tags: ['suero', 'electrolitos', 'hidratacion', 'estomago', 'resaca', 'calor'],
    isOfferOfTheDay: false
  },

  // 2. Farmacia Vitalis
  {
    id: 'prod-5',
    businessId: 'biz-farmacia-2',
    name: 'Protector Solar Facial FPS 50+ 50ml',
    description: 'Toque seco ultra ligero con alta protección UV y ácido hialurónico.',
    price: 340,
    originalPrice: 420,
    category: 'Dermatología',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 30,
    tags: ['bloqueador', 'solar', 'protector', 'piel', 'crema', 'dermatologia', 'skincare'],
    isOfferOfTheDay: true
  },
  {
    id: 'prod-6',
    businessId: 'biz-farmacia-2',
    name: 'Multivitamínico + Zinc & Vitamina C',
    description: 'Refuerzo para el sistema inmune y energía diaria con 30 cápsulas.',
    price: 210,
    category: 'Suplementos',
    image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 65,
    tags: ['vitaminas', 'zinc', 'vitamina c', 'defensas', 'energia', 'suplemento'],
    isOfferOfTheDay: false
  },
  {
    id: 'prod-6b',
    businessId: 'biz-farmacia-2',
    name: 'Serum Ácido Hialurónico Hidratación Profunda',
    description: 'Fórmula concentrada antiarrugas para rejuvenecimiento y luminosidad facial.',
    price: 380,
    originalPrice: 460,
    category: 'Dermatología',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 25,
    tags: ['serum', 'acido hialuronico', 'antiarrugas', 'hidratante', 'skincare'],
    isOfferOfTheDay: true
  },

  // 3. Farmacia Pediátrica San Lucas
  {
    id: 'prod-ped-1',
    businessId: 'biz-farmacia-3',
    name: 'Fórmula Infantil Etapa 1 (Lata 800g)',
    description: 'Nutrición balanceada con probióticos, DHA y ARA para bebés de 0 a 6 meses.',
    price: 395,
    originalPrice: 450,
    category: 'Nutrición Infantil',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 40,
    tags: ['formula', 'leche', 'bebe', 'infantil', 'lactancia', 'pediatria'],
    isOfferOfTheDay: true
  },
  {
    id: 'prod-ped-2',
    businessId: 'biz-farmacia-3',
    name: 'Termómetro Digital Infrarrojo Sin Contacto',
    description: 'Lectura ultra rápida en 1 segundo con pantalla LCD a color para fiebre.',
    price: 320,
    originalPrice: 410,
    category: 'Equipos Médicos',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 28,
    tags: ['termometro', 'fiebre', 'digital', 'bebe', 'temperatura', 'equipo'],
    isOfferOfTheDay: false
  },

  // 4. Botica Natural VerdeVida
  {
    id: 'prod-nat-1',
    businessId: 'biz-farmacia-4',
    name: 'Extracto de Propóleo & Miel 100% Puro (Gotero)',
    description: 'Antibiótico natural para garganta irritada, defensas y vías respiratorias.',
    price: 135,
    originalPrice: 165,
    category: 'Herbolaria',
    image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 50,
    tags: ['propoleo', 'miel', 'garganta', 'tos', 'natural', 'defensas'],
    isOfferOfTheDay: true
  },
  {
    id: 'prod-nat-2',
    businessId: 'biz-farmacia-4',
    name: 'Colágeno Hidrolizado + Biotina & Vitamina E',
    description: 'Polvo 500g sabor frutos rojos para articulaciones, piel, cabello y uñas.',
    price: 310,
    originalPrice: 380,
    category: 'Suplementos',
    image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 35,
    tags: ['colageno', 'biotina', 'cabello', 'articulaciones', 'suplemento', 'belleza'],
    isOfferOfTheDay: false
  },

  // 5. Burger Craft
  {
    id: 'prod-7',
    businessId: 'biz-resto-1',
    name: 'Combo Monster Bacon Cheeseburger',
    description: 'Doble carne de res premium 300g, tocino ahumado crujiente, queso cheddar derretido + Papas + Bebida.',
    price: 189,
    originalPrice: 245,
    category: 'Hamburguesas',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 50,
    tags: ['hamburguesa', 'burger', 'queso', 'tocino', 'combo', 'papas', 'comida'],
    isOfferOfTheDay: true,
    isBoosted: true,
    boostTier: 'premium',
    boostExpiresAt: '2026-09-25'
  },
  {
    id: 'prod-8',
    businessId: 'biz-resto-1',
    name: 'Alitas BBQ Habanero (12 piezas)',
    description: 'Alitas doradas bañadas en salsa BBQ artesanal con toque de chile habanero y aderezo ranch.',
    price: 165,
    category: 'Alitas & Snacks',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 40,
    tags: ['alitas', 'wings', 'bbq', 'picante', 'botana', 'snack'],
    isOfferOfTheDay: false
  },

  // 6. Pizzería Bella Forno
  {
    id: 'prod-9',
    businessId: 'biz-resto-2',
    name: 'Pizza Pepperoni Clásica Grande (8 rebanadas)',
    description: 'Masa madre fermentada 48 hrs, salsa pomodoro San Marzano, mozzarella fior di latte y pepperoni selecto.',
    price: 230,
    originalPrice: 280,
    category: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 35,
    tags: ['pizza', 'pepperoni', 'queso', 'italiana', 'cena', 'horno'],
    isOfferOfTheDay: true
  },
  {
    id: 'prod-9b',
    businessId: 'biz-resto-2',
    name: 'Lasagna Boloñesa al Horno de Leña',
    description: 'Capas de pasta artesanal con ragú de res y cerdo, salsa bechamel cremosa y queso gratinado.',
    price: 175,
    originalPrice: 210,
    category: 'Pastas',
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 20,
    tags: ['lasagna', 'pasta', 'queso', 'italiana', 'cena', 'horno'],
    isOfferOfTheDay: false
  },

  // 7. Tacos Los Compadres
  {
    id: 'prod-10',
    businessId: 'biz-resto-3',
    name: 'Orden 5 Tacos de Pastor con Queso y Piña',
    description: 'Carne al pastor marinada al carbón en doble tortilla de maíz taquera con cebolla, cilantro y salsas.',
    price: 120,
    originalPrice: 150,
    category: 'Tacos',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 120,
    tags: ['tacos', 'pastor', 'taqueria', 'mexicana', 'antojitos', 'salsa'],
    isOfferOfTheDay: true
  },
  {
    id: 'prod-10b',
    businessId: 'biz-resto-3',
    name: 'Consomé & 3 Quesabirrias Doraditas',
    description: 'Birria estilo Jalisco cocinada a fuego lento con queso Oaxaca derretido en tortilla dorada.',
    price: 145,
    category: 'Especialidades',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 70,
    tags: ['quesabirria', 'birria', 'consome', 'mexicana', 'tacos', 'queso'],
    isOfferOfTheDay: false
  },

  // 8. Sushi Roll Master
  {
    id: 'prod-sush-1',
    businessId: 'biz-resto-4',
    name: 'Dragon Roll Especial (10 piezas)',
    description: 'Relleno de camarón empanizado y queso crema, forrado en aguacate fresco con salsa de anguila y ajonjolí.',
    price: 195,
    originalPrice: 240,
    category: 'Sushi Rolls',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 45,
    tags: ['sushi', 'dragon roll', 'camaron', 'aguacate', 'japonesa', 'rollos'],
    isOfferOfTheDay: true
  },
  {
    id: 'prod-sush-2',
    businessId: 'biz-resto-4',
    name: 'Poke Bowl Salmón Fresco & Mango',
    description: 'Base de arroz de sushi, salmón fresco en cubos, edamames, aguacate, pepino, mango y aderezo ponzu.',
    price: 215,
    category: 'Poke Bowls',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 30,
    tags: ['poke', 'salmon', 'bowl', 'saludable', 'mango', 'arroz'],
    isOfferOfTheDay: false
  },

  // 9. Café & Panadería La Toscana
  {
    id: 'prod-cafe-1',
    businessId: 'biz-resto-5',
    name: 'Combo Desayuno: Croissant Relleno + Cappuccino Vainilla',
    description: 'Croissant artesanal hojaldrado con jamón de pavo y queso gouda + Café cappuccino caliente 12oz.',
    price: 125,
    originalPrice: 160,
    category: 'Desayunos & Combos',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 60,
    tags: ['croissant', 'cafe', 'cappuccino', 'desayuno', 'panaderia', 'combo'],
    isOfferOfTheDay: true
  },
  {
    id: 'prod-cafe-2',
    businessId: 'biz-resto-5',
    name: 'Tarta de Frutos Rojos & Crema Pastelera',
    description: 'Base de masa sablé crujiente con fresas, frambuesas y moras frescas de temporada.',
    price: 85,
    category: 'Postres',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 25,
    tags: ['tarta', 'frutos rojos', 'postre', 'pastel', 'dulce'],
    isOfferOfTheDay: false
  },

  // 10. Pollo Asado Campestre
  {
    id: 'prod-pol-1',
    businessId: 'biz-resto-6',
    name: 'Paquete Familiar 1 Pollo Entero al Carbón + Guarniciones',
    description: 'Pollo marinado con receta secreta campestre, incluye arroz, frijoles charros, tortillas y salsas.',
    price: 260,
    originalPrice: 320,
    category: 'Paquetes Familiares',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 40,
    tags: ['pollo', 'asado', 'familiar', 'frijoles', 'comida', 'arroz'],
    isOfferOfTheDay: true
  },

  // 11. Dulce Tentación & Gelato
  {
    id: 'prod-hel-1',
    businessId: 'biz-resto-7',
    name: 'Waffle Belga con Helado de Nutella & Fresas',
    description: 'Waffle caliente recién horneado con 2 bolas de gelato artesanal italiano, fresas y chocolate.',
    price: 135,
    originalPrice: 170,
    category: 'Waffles & Crepas',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 50,
    tags: ['waffle', 'helado', 'gelato', 'nutella', 'postre', 'dulce', 'fresas'],
    isOfferOfTheDay: true
  },

  // 12. Burritos & Quesadillas Norteñas
  {
    id: 'prod-bur-1',
    businessId: 'biz-resto-8',
    name: 'Mega Burrito de Arrachera Norteña con Queso y Frijoles',
    description: 'Tortilla de harina de 30cm rellena de arrachera asada, queso asadero fundido, frijoles y guacamole.',
    price: 155,
    originalPrice: 190,
    category: 'Burritos',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 65,
    tags: ['burrito', 'arrachera', 'queso', 'guacamole', 'norteno', 'carne'],
    isOfferOfTheDay: true
  },

  // --- CROSS-STORE COMPARABLE ITEMS (Farmacias & Restaurantes) ---
  // Paracetamol in other pharmacies:
  {
    id: 'prod-comp-para-2',
    businessId: 'biz-farmacia-2',
    name: 'Paracetamol 500mg Genérico (Caja 20 tabletas)',
    description: 'Analgésico y antipirético para alivio rápido de dolor leve a moderado.',
    price: 48,
    category: 'Medicamentos',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 60,
    tags: ['paracetamol', 'analgesico', 'fiebre', 'dolor', 'medicamento'],
    isOfferOfTheDay: false
  },
  {
    id: 'prod-comp-para-3',
    businessId: 'biz-farmacia-3',
    name: 'Paracetamol 500mg Línea Familiar (20 tabletas)',
    description: 'Fórmula efectiva para control térmico y malestar general en adultos.',
    price: 42,
    originalPrice: 55,
    category: 'Medicamentos',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 95,
    tags: ['paracetamol', 'analgesico', 'fiebre', 'dolor de cabeza', 'medicamento'],
    isOfferOfTheDay: true
  },
  {
    id: 'prod-comp-para-4',
    businessId: 'biz-farmacia-4',
    name: 'Paracetamol 500mg Botica Natural (20 tabletas)',
    description: 'Tabletas de rápida absorción con certificación de pureza.',
    price: 50,
    category: 'Medicamentos',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 40,
    tags: ['paracetamol', 'analgesico', 'fiebre', 'dolor', 'medicamento'],
    isOfferOfTheDay: false
  },

  // Suero Oral in other pharmacies:
  {
    id: 'prod-comp-suero-2',
    businessId: 'biz-farmacia-2',
    name: 'Suero Oral Electrolitos 500ml Fresa-Kiwi',
    description: 'Bebida isotónica grado farmacéutico para rehidratación inmediata.',
    price: 35,
    category: 'Cuidado & Bienestar',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 80,
    tags: ['suero', 'electrolitos', 'hidratacion', 'resaca', 'estomago'],
    isOfferOfTheDay: false
  },
  {
    id: 'prod-comp-suero-3',
    businessId: 'biz-farmacia-3',
    name: 'Suero Oral Pediátrico & Familiar 500ml',
    description: 'Fórmula balanceada con zinc para recuperación gastrointestinal.',
    price: 29,
    originalPrice: 38,
    category: 'Cuidado & Bienestar',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 110,
    tags: ['suero', 'electrolitos', 'bebe', 'pediatria', 'hidratacion', 'fiebre'],
    isOfferOfTheDay: true
  },

  // Hamburguesas in other restaurants:
  {
    id: 'prod-comp-burg-2',
    businessId: 'biz-resto-8',
    name: 'Hamburguesa Norteña con Arrachera & Queso Asadero',
    description: 'Jugosa carne de res con fajitas de arrachera, queso asadero y aderezo chipotle + Papas.',
    price: 165,
    originalPrice: 195,
    category: 'Hamburguesas',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 30,
    tags: ['hamburguesa', 'burger', 'arrachera', 'queso', 'papas', 'comida'],
    isOfferOfTheDay: false
  },
  {
    id: 'prod-comp-burg-3',
    businessId: 'biz-resto-6',
    name: 'Hamburguesa Campestre al Carbón + Papas Rústicas',
    description: 'Carne asada a la parrilla con queso gouda, lechuga orgánica y salsa bbq casera.',
    price: 145,
    originalPrice: 175,
    category: 'Hamburguesas',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 45,
    tags: ['hamburguesa', 'burger', 'asado', 'parrilla', 'papas', 'comida'],
    isOfferOfTheDay: true
  },

  // Pizzas in other restaurants:
  {
    id: 'prod-comp-piz-2',
    businessId: 'biz-resto-1',
    name: 'Pizza Artesanal Pepperoni & Mozzarella 8 Rebanadas',
    description: 'Masa crujiente horneada a la piedra con doble capa de pepperoni y queso.',
    price: 210,
    originalPrice: 250,
    category: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 25,
    tags: ['pizza', 'pepperoni', 'queso', 'cena', 'comida'],
    isOfferOfTheDay: false
  },

  // Refrescos / Bebidas across stores:
  {
    id: 'prod-comp-soda-1',
    businessId: 'biz-resto-1',
    name: 'Refresco Coca-Cola / Sprite 600ml Frío',
    description: 'Botella de 600ml bien fría para acompañar tus alimentos.',
    price: 35,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 150,
    tags: ['refresco', 'coca cola', 'soda', 'bebida', 'frio'],
    isOfferOfTheDay: false
  },
  {
    id: 'prod-comp-soda-2',
    businessId: 'biz-resto-3',
    name: 'Refresco Coca-Cola de Vidrio 500ml',
    description: 'Clásico refresco en botella de vidrio bien frío.',
    price: 30,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 200,
    tags: ['refresco', 'coca cola', 'soda', 'bebida', 'taqueria'],
    isOfferOfTheDay: false
  },
  {
    id: 'prod-comp-soda-3',
    businessId: 'biz-resto-8',
    name: 'Refresco Lata 355ml Surtido Frío',
    description: 'Coca-Cola, Manzana, Sprite o Fanta bien fría.',
    price: 28,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60',
    inStock: true,
    stockCount: 120,
    tags: ['refresco', 'soda', 'bebida', 'lata'],
    isOfferOfTheDay: false
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-9821',
    businessId: 'biz-resto-1',
    businessName: 'Burger Craft & Wings House',
    businessLogo: '🍔',
    customerName: 'Carlos Mendoza',
    customerPhone: '+52 55 8912 3456',
    items: [
      {
        product: INITIAL_PRODUCTS[8], // Burger combo
        quantity: 2,
        businessId: 'biz-resto-1'
      },
      {
        product: INITIAL_PRODUCTS[9], // Wings
        quantity: 1,
        businessId: 'biz-resto-1'
      }
    ],
    subtotal: 543,
    deliveryFee: 35,
    total: 578,
    deliveryType: 'delivery',
    deliveryAddress: 'Calle Insurgentes Sur 950, Depto 402',
    deliveryCoordinates: { lat: 19.3820, lng: -99.1760 },
    paymentMethod: 'card',
    status: 'on_the_way',
    createdAt: 'Hace 15 min',
    notes: 'Tocar el timbre 402 por favor'
  },
  {
    id: 'ORD-9820',
    businessId: 'biz-farmacia-1',
    businessName: 'Farmacias San Rafael Express',
    businessLogo: '💊',
    customerName: 'Mariana Gómez',
    customerPhone: '+52 55 7766 5544',
    items: [
      {
        product: INITIAL_PRODUCTS[0], // Paracetamol
        quantity: 2,
        businessId: 'biz-farmacia-1'
      },
      {
        product: INITIAL_PRODUCTS[2], // Jarabe
        quantity: 1,
        businessId: 'biz-farmacia-1'
      }
    ],
    subtotal: 200,
    deliveryFee: 25,
    total: 225,
    deliveryType: 'delivery',
    deliveryAddress: 'Av. Coyoacán 1230, Col. Del Valle',
    deliveryCoordinates: { lat: 19.3900, lng: -99.1670 },
    paymentMethod: 'cash_on_delivery',
    status: 'delivered',
    createdAt: 'Hace 45 min'
  },
  {
    id: 'ORD-9819',
    businessId: 'biz-resto-2',
    businessName: 'Pizzería Napolitana Bella Forno',
    businessLogo: '🍕',
    customerName: 'Roberto Garza',
    customerPhone: '+52 55 2211 4455',
    items: [
      {
        product: INITIAL_PRODUCTS[10], // Pizza
        quantity: 1,
        businessId: 'biz-resto-2'
      }
    ],
    subtotal: 230,
    deliveryFee: 0,
    total: 230,
    deliveryType: 'pickup',
    deliveryAddress: 'Recojo en local - Mostrador',
    deliveryCoordinates: { lat: 19.4165, lng: -99.1600 },
    paymentMethod: 'card',
    status: 'ready',
    createdAt: 'Hace 20 min'
  },
  {
    id: 'ORD-9818',
    businessId: 'biz-resto-4',
    businessName: 'Sushi Roll Master & Poke Bar',
    businessLogo: '🍣',
    customerName: 'Alejandra Ruiz',
    customerPhone: '+52 55 9900 1122',
    items: [
      {
        product: INITIAL_PRODUCTS[14], // Dragon roll
        quantity: 2,
        businessId: 'biz-resto-4'
      }
    ],
    subtotal: 390,
    deliveryFee: 30,
    total: 420,
    deliveryType: 'delivery',
    deliveryAddress: 'Calle Mazatlán 78, Col. Condesa',
    deliveryCoordinates: { lat: 19.4130, lng: -99.1720 },
    paymentMethod: 'card',
    status: 'preparing',
    createdAt: 'Hace 10 min'
  }
];

export const INITIAL_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-1',
    label: 'Casa 🏠',
    address: 'Av. Insurgentes Sur 950, Depto 402, Benito Juárez, CDMX',
    coordinates: { lat: 19.3820, lng: -99.1760 }
  },
  {
    id: 'addr-2',
    label: 'Oficina 💼',
    address: 'Paseo de la Reforma 222, Piso 14, Cuauhtémoc, CDMX',
    coordinates: { lat: 19.4280, lng: -99.1610 }
  },
  {
    id: 'addr-3',
    label: 'Depa Roma 🏙️',
    address: 'Calle Orizaba 45, Col. Roma Norte, CDMX',
    coordinates: { lat: 19.4210, lng: -99.1600 }
  }
];

export const INITIAL_CAMPAIGNS: WhatsAppCampaign[] = [
  {
    id: 'camp-1',
    title: '🔥 Fin de Semana de Pizzas & Burgers 30% OFF',
    message: '¡Hola! 🎉 Este fin de semana disfruta 30% de descuento en tus restaurantes favoritos en ConForce. Ordena directo en: https://venezuela-iota.vercel.app/?filter=offers',
    targetAudience: 'all',
    status: 'sent',
    sentCount: 1420,
    openRate: 94.2,
    clickRate: 38.5,
    date: '2026-08-22'
  },
  {
    id: 'camp-2',
    title: '💊 Farmacias Express: Medicamentos y Antigripales 24 Horas',
    message: '¿Te sientes indispuesto? Recibe medicamentos y sueros en menos de 25 minutos directo a tu puerta con ConForce: https://venezuela-iota.vercel.app/?filter=farmacia',
    targetAudience: 'farmacias_users',
    status: 'sent',
    sentCount: 890,
    openRate: 96.1,
    clickRate: 44.2,
    date: '2026-08-20'
  }
];

export const INITIAL_CHATBOT_CONFIG: ChatbotConfig = {
  metaApiToken: 'EAAG...META_CLOUD_API_TOKEN_PULSO',
  phoneNumberId: '10982348572194',
  businessAccountId: 'WABA_992817264819',
  webhookVerifyToken: 'pulso_secure_webhook_token_2026',
  welcomeMessage: '👋 ¡Hola! Bienvenido al asistente inteligente de *ConForce Venezuela*. 🛒\n\nSomos tu Marketplace integral: aquí consigues de todo (tecnología, alimentos, farmacia, restaurantes, ferretería, repuestos, moda y servicios).\n\n¿Qué producto o comercio estás buscando hoy? Escribe lo que necesitas y te ayudaré con opciones y precios en Bs.',
  featuredOfferId: 'prod-7', // Monster burger
  autoDeepLinksEnabled: true,
  geminiSmartSearch: true,
  maxDistanceKm: 15,
  customKeywords: [
    { keyword: 'medicina', category: 'farmacia', targetTag: 'medicamentos' },
    { keyword: 'hamburguesa', category: 'restaurante', targetTag: 'hamburguesas' },
    { keyword: 'pizza', category: 'restaurante', targetTag: 'pizza' },
    { keyword: 'tacos', category: 'restaurante', targetTag: 'tacos' },
    { keyword: 'sushi', category: 'restaurante', targetTag: 'sushi' }
  ]
};

export const BOOST_PLANS: BoostPlan[] = [
  {
    id: 'boost_3d',
    name: 'Impulso Flash (3 Días)',
    days: 3,
    price: 49,
    impressionsEstimate: '+1,800 vistas estimadas',
    badgeText: '🚀 Flash'
  },
  {
    id: 'boost_7d',
    name: 'Top Semanal Pro (7 Días)',
    days: 7,
    price: 89,
    impressionsEstimate: '+5,200 vistas estimadas',
    badgeText: '⭐ Recomendado',
    recommended: true
  },
  {
    id: 'boost_15d',
    name: 'Dominio Mensual (15 Días)',
    days: 15,
    price: 169,
    impressionsEstimate: '+12,500 vistas estimadas',
    badgeText: '👑 Máximo Alcance'
  }
];

export const INITIAL_FAILED_SEARCHES: FailedSearchRecord[] = [
  {
    id: 'fs-1',
    term: 'Insulina Glargina 100UI pluma',
    categoryGuess: 'Farmacia / Medicamentos Crónicos',
    count: 24,
    firstSearchedAt: '2026-08-15 09:20',
    lastSearchedAt: '2026-09-06 18:45',
    status: 'pending',
    userLocationHint: 'Col. Roma Norte / Condesa',
    notes: 'Alta demanda en medicamentos especializados para diabetes. Contactar con Farmacia San Rafael para surtir.'
  },
  {
    id: 'fs-2',
    term: 'Alitas BBQ con aderezo blue cheese',
    categoryGuess: 'Restaurante / Snacks',
    count: 18,
    firstSearchedAt: '2026-08-18 20:10',
    lastSearchedAt: '2026-09-07 01:15',
    status: 'evaluating',
    userLocationHint: 'Zona Centro / Juárez',
    notes: 'Se evaluó con Burger Craft para incorporar combo nocturno de alitas con blue cheese.'
  },
  {
    id: 'fs-3',
    term: 'Pañales Huggies Etapa 4 (paquete x40)',
    categoryGuess: 'Farmacia / Bebés',
    count: 15,
    firstSearchedAt: '2026-08-21 14:05',
    lastSearchedAt: '2026-09-05 11:30',
    status: 'pending',
    userLocationHint: 'Col. Cuauhtémoc',
    notes: 'Buscar distribuidor de pañales o conveniencia 24h.'
  },
  {
    id: 'fs-4',
    term: 'Cargador USB-C Carga Rápida 45W',
    categoryGuess: 'Conveniencia / Electrónica',
    count: 11,
    firstSearchedAt: '2026-08-25 16:40',
    lastSearchedAt: '2026-09-06 22:10',
    status: 'evaluating',
    userLocationHint: 'Paseo de la Reforma',
    notes: 'Comercios cercanos de accesorios de celular interesados en afiliarse.'
  },
  {
    id: 'fs-5',
    term: 'Sushi Roll Philadelphia Empanizado',
    categoryGuess: 'Restaurante / Comida Asiática',
    count: 9,
    firstSearchedAt: '2026-08-26 13:00',
    lastSearchedAt: '2026-09-04 15:20',
    status: 'added',
    userLocationHint: 'Col. Roma Sur',
    notes: 'Resuelto: Afiliación de restaurante de sushi en proceso de carga de menú.'
  },
  {
    id: 'fs-6',
    term: 'Electrolit Fresa Kiwi 625ml',
    categoryGuess: 'Farmacia / Hidratación',
    count: 8,
    firstSearchedAt: '2026-08-29 10:15',
    lastSearchedAt: '2026-09-06 08:30',
    status: 'added',
    userLocationHint: 'Col. Del Valle',
    notes: 'Resuelto: Stock actualizado en Farmacia San Rafael y Farmacia Roma.'
  }
];


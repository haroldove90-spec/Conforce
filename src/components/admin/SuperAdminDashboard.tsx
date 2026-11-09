import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Business, BusinessCategory, WhatsAppCampaign } from '../../types';
import {
  buildDeepLink,
  VERCEL_PRODUCTION_URL,
  VERCEL_MARKETPLACE_URL,
  VERCEL_MARKETPLACE_QUERY_URL,
  VERCEL_ADMIN_URL,
  VERCEL_SELLER_URL
} from '../../utils/urlUtils';
import {
  LayoutDashboard,
  Store,
  MessageSquare,
  Layers,
  DollarSign,
  Plus,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  TrendingUp,
  Users,
  Send,
  Link,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Search,
  Check,
  Navigation,
  Flame,
  Radio,
  FileCheck,
  Database,
  Briefcase,
  FileText,
  Download,
  Radar,
  AlertTriangle,
  RotateCcw,
  LogOut
} from 'lucide-react';
import { SupabaseAdminView } from './SupabaseAdminView';
import { AdminUsersView } from './AdminUsersView';
import { AdminClientsView } from './AdminClientsView';
import { AdminEmployeesView } from './AdminEmployeesView';
import { PdfFeatureView } from './PdfFeatureView';
import { DemandRadarView } from './DemandRadarView';

export const SuperAdminDashboard: React.FC = () => {
  const {
    businesses,
    addBusiness,
    updateBusiness,
    deleteBusiness,
    orders,
    products,
    campaigns,
    addCampaign,
    chatbotConfig,
    updateChatbotConfig,
    activeAdminTab,
    setActiveAdminTab,
    users,
    clients,
    employees,
    failedSearches,
    serviceFeeRate,
    clearAllSampleData,
    restoreSampleData,
    isMockDataCleared,
    isClearingData,
    openBusinessRegistration,
    logout
  } = useApp();

  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [clearToast, setClearToast] = useState<{ success: boolean; message: string } | null>(null);

  // Metrics Calculations (Defensively protected against null/empty state)
  const safeOrders = orders || [];
  const safeBusinesses = businesses || [];
  const safeProducts = products || [];
  const safeCampaigns = campaigns || [];

  const totalSales = safeOrders.reduce((sum, o) => sum + (o?.total || 0), 0);
  const deliveryOrdersCount = safeOrders.filter((o) => o?.deliveryType === 'delivery').length;
  const pickupOrdersCount = safeOrders.filter((o) => o?.deliveryType === 'pickup').length;
  const activeSellersCount = safeBusinesses.filter((b) => b?.isActive).length;
  const totalBotInteractions = 1420 + safeOrders.length * 12;

  // Seller CRUD States
  const [showAddBizModal, setShowAddBizModal] = useState(false);
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);
  const [newBizName, setNewBizName] = useState('');
  const [newBizCategory, setNewBizCategory] = useState<BusinessCategory>('farmacia');
  const [newBizLogo, setNewBizLogo] = useState('💊');
  const [newBizPhone, setNewBizPhone] = useState('+52 55 0000 0000');
  const [newBizAddress, setNewBizAddress] = useState('');
  const [newBizLat, setNewBizLat] = useState(19.4120);
  const [newBizLng, setNewBizLng] = useState(-99.1650);
  const [newBizPinColor, setNewBizPinColor] = useState('#2563eb');
  const [newBizCommission, setNewBizCommission] = useState(10);
  const [newBizHours, setNewBizHours] = useState('08:00 AM - 10:00 PM');

  // WhatsApp Campaign States
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignMsg, setCampaignMsg] = useState('');
  const [campaignAudience, setCampaignAudience] = useState<'all' | 'farmacias_users' | 'food_users'>('all');
  const [campaignSentToast, setCampaignSentToast] = useState(false);

  // Chatbot Config States (Safeguarded against undefined/null)
  const [metaToken, setMetaToken] = useState(chatbotConfig?.metaApiToken || '');
  const [phoneId, setPhoneId] = useState(chatbotConfig?.phoneNumberId || '');
  const [welcomeText, setWelcomeText] = useState(chatbotConfig?.welcomeMessage || '');
  const [featuredOffer, setFeaturedOffer] = useState(chatbotConfig?.featuredOfferId || '');
  const [newKeyword, setNewKeyword] = useState('');
  const [newKeywordCat, setNewKeywordCat] = useState<BusinessCategory>('farmacia');
  const [newKeywordTag, setNewKeywordTag] = useState('');

  // Deep Link Generator
  const [deepLinkBizId, setDeepLinkBizId] = useState(safeBusinesses[0]?.id || '');
  const [deepLinkProdId, setDeepLinkProdId] = useState('');
  const [copiedDeepLink, setCopiedDeepLink] = useState(false);
  const [copiedMarketplaceLink, setCopiedMarketplaceLink] = useState(false);
  const [copiedMarketplaceQueryLink, setCopiedMarketplaceQueryLink] = useState(false);
  const [copiedAdminLink, setCopiedAdminLink] = useState(false);
  const [copiedSellerLink, setCopiedSellerLink] = useState(false);

  // Deep Link URL builder pointing directly to production Marketplace
  const generatedDeepLink = buildDeepLink({
    businessId: deepLinkBizId,
    productId: deepLinkProdId || undefined
  });

  const handleCopyDeepLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedDeepLink);
      setCopiedDeepLink(true);
      setTimeout(() => setCopiedDeepLink(false), 2000);
    }
  };

  const handleCopyMarketplaceLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(VERCEL_PRODUCTION_URL);
      setCopiedMarketplaceLink(true);
      setTimeout(() => setCopiedMarketplaceLink(false), 2000);
    }
  };

  const handleCopyMarketplaceQueryLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(VERCEL_MARKETPLACE_QUERY_URL);
      setCopiedMarketplaceQueryLink(true);
      setTimeout(() => setCopiedMarketplaceQueryLink(false), 2000);
    }
  };

  const handleCopyAdminLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(VERCEL_ADMIN_URL);
      setCopiedAdminLink(true);
      setTimeout(() => setCopiedAdminLink(false), 2000);
    }
  };

  const handleCopySellerLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(VERCEL_SELLER_URL);
      setCopiedSellerLink(true);
      setTimeout(() => setCopiedSellerLink(false), 2000);
    }
  };

  // Business Save
  const handleSaveBusiness = () => {
    if (!newBizName.trim()) return;

    if (editingBiz) {
      updateBusiness(editingBiz.id, {
        name: newBizName.trim(),
        category: newBizCategory,
        logo: newBizLogo,
        phone: newBizPhone,
        address: newBizAddress,
        coordinates: { lat: Number(newBizLat), lng: Number(newBizLng) },
        customPinColor: newBizPinColor,
        commissionRate: Number(newBizCommission),
        openingHours: newBizHours
      });
    } else {
      addBusiness({
        name: newBizName.trim(),
        category: newBizCategory,
        logo: newBizLogo,
        bannerImage:
          newBizCategory === 'farmacia'
            ? 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=60'
            : 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
        phone: newBizPhone,
        address: newBizAddress || 'Av. Principal 100, Centro',
        coordinates: { lat: Number(newBizLat), lng: Number(newBizLng) },
        openingHours: newBizHours,
        rating: 5.0,
        reviewsCount: 1,
        isVerified: true,
        isActive: true,
        commissionRate: Number(newBizCommission),
        customPinColor: newBizPinColor,
        deliveryTime: '20-35 min',
        minOrder: 100,
        tags: [newBizCategory]
      });
    }

    setShowAddBizModal(false);
  };

  const openAddBizModal = () => {
    setEditingBiz(null);
    setNewBizName('');
    setNewBizCategory('farmacia');
    setNewBizLogo('💊');
    setNewBizPhone('+52 55 1234 5678');
    setNewBizAddress('');
    setNewBizLat(19.4120);
    setNewBizLng(-99.1650);
    setNewBizPinColor('#2563eb');
    setNewBizCommission(10);
    setNewBizHours('08:00 AM - 10:00 PM');
    setShowAddBizModal(true);
  };

  const openEditBizModal = (b: Business) => {
    setEditingBiz(b);
    setNewBizName(b.name);
    setNewBizCategory(b.category);
    setNewBizLogo(b.logo);
    setNewBizPhone(b.phone);
    setNewBizAddress(b.address);
    setNewBizLat(b.coordinates.lat);
    setNewBizLng(b.coordinates.lng);
    setNewBizPinColor(b.customPinColor || '#2563eb');
    setNewBizCommission(b.commissionRate);
    setNewBizHours(b.openingHours);
    setShowAddBizModal(true);
  };

  // Broadcast campaign send
  const handleSendCampaign = () => {
    if (!campaignTitle.trim() || !campaignMsg.trim()) return;

    addCampaign({
      title: campaignTitle.trim(),
      message: campaignMsg.trim(),
      targetAudience: campaignAudience,
      status: 'sent'
    });

    setCampaignTitle('');
    setCampaignMsg('');
    setCampaignSentToast(true);
    setTimeout(() => setCampaignSentToast(false), 3000);
  };

  // Add Keyword
  const handleAddKeyword = () => {
    if (!newKeyword.trim() || !newKeywordTag.trim()) return;
    updateChatbotConfig({
      customKeywords: [
        ...chatbotConfig.customKeywords,
        {
          keyword: newKeyword.trim().toLowerCase(),
          category: newKeywordCat,
          targetTag: newKeywordTag.trim().toLowerCase()
        }
      ]
    });
    setNewKeyword('');
    setNewKeywordTag('');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 space-y-6 pb-24 md:pb-12 bg-white">
      
      {/* Top Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-slate-50 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-2xl shadow-md shadow-purple-600/25">
            ⚡
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black text-slate-900">
              Superadministrador (Owner)
            </h1>
            <p className="text-xs text-slate-500">
              Panel de control global, WhatsApp Business API y Finanzas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Action to Wipe Sample / Mock Data across the Entire System and Supabase */}
          {isMockDataCleared ? (
            <button
              onClick={() => {
                restoreSampleData();
                setClearToast({ success: true, message: 'Datos de prueba restaurados en el sistema.' });
                setTimeout(() => setClearToast(null), 3500);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Restaurar comercios y productos de muestra en el sistema"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Datos Demo</span>
            </button>
          ) : (
            <button
              onClick={() => setShowClearConfirmModal(true)}
              disabled={isClearingData}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-950/20 transition-all cursor-pointer disabled:opacity-50"
              title="Borrar todos los comercios, productos, pedidos y clientes de muestra de todo el sistema y de Supabase"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isClearingData ? 'Borrando...' : 'Borrar Datos de Muestra'}</span>
            </button>
          )}

          <a
            href="/Con_Force_Caracteristicas_Por_Rol.pdf"
            download="Con_Force_Caracteristicas_Por_Rol.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Descargar Ficha Técnica Oficial en PDF con Características por Rol"
          >
            <FileText className="w-4 h-4" />
            <span>Ficha PDF</span>
            <Download className="w-3.5 h-3.5 opacity-80" />
          </a>

          <span className="px-3 py-1 bg-red-50 border border-red-200 text-[#D4021D] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#D4021D] animate-pulse" />
            Meta API Online
          </span>

          {/* Cerrar Sesión Button */}
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-[#D4021D] hover:text-red-800 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Cerrar sesión de Superadministrador"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Clear Sample Data Confirmation Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  ¿Borrar datos de muestra de todo el sistema?
                </h3>
                <p className="text-xs text-slate-500">
                  Acción general para producción y limpieza de base de datos
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-900">
                Al confirmar esta acción:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Se vaciarán comercios, productos y órdenes demo del sistema.</li>
                <li>Se borrarán los registros correspondientes en Supabase PostgreSQL.</li>
                <li>Se bloqueará la recarga automática de prueba.</li>
                <li>
                  <strong className="text-emerald-700">Protección garantizada:</strong> Tu cuenta de acceso{' '}
                  <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-900">admin_master</code>{' '}
                  y su contraseña permanecerán intactas.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isClearingData}
                onClick={async () => {
                  setShowClearConfirmModal(false);
                  const result = await clearAllSampleData();
                  setClearToast(result);
                  setTimeout(() => setClearToast(null), 5000);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-950/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearingData ? 'Borrando...' : 'Sí, Borrar Registros de Muestra'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {clearToast && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold shadow-md flex items-center justify-between gap-3 ${
            clearToast.success ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{clearToast.message}</span>
          </div>
          <button
            onClick={() => setClearToast(null)}
            className="text-white/80 hover:text-white text-xs underline cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Admin Module Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Dashboard General', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'pdf', label: 'Ficha PDF Roles', icon: <FileText className="w-4 h-4 text-[#D4021D]" /> },
          { id: 'users', label: `Usuarios & Roles (${users.length})`, icon: <ShieldCheck className="w-4 h-4 text-[#D4021D]" /> },
          { id: 'clients', label: `Clientes (${clients.length})`, icon: <Users className="w-4 h-4" /> },
          { id: 'employees', label: `Colaboradores (${employees.length})`, icon: <Briefcase className="w-4 h-4" /> },
          { id: 'sellers', label: `Gestión de Negocios (${businesses.length})`, icon: <Store className="w-4 h-4" /> },
          { id: 'whatsapp', label: 'WhatsApp & Bot IA', icon: <MessageSquare className="w-4 h-4" /> },
          { id: 'map', label: 'Mapa & Navegación', icon: <Layers className="w-4 h-4" /> },
          { id: 'radar', label: `Radar de Demanda (${failedSearches.length})`, icon: <Radar className="w-4 h-4 text-amber-500" /> },
          { id: 'finances', label: 'Finanzas & Comisiones', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'supabase', label: 'Base de Datos Supabase', icon: <Database className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeAdminTab === tab.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. DASHBOARD GENERAL */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Ventas Globales
              </span>
              <p className="text-xl md:text-2xl font-black text-[#D4021D]">
                Bs. {totalSales.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 block">
                {orders.length} pedidos procesados
              </span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Sellers Activos
              </span>
              <p className="text-xl md:text-2xl font-black text-[#D4021D]">
                {activeSellersCount} Negocios
              </p>
              <span className="text-[10px] text-slate-400 block">
                {businesses.filter((b) => b.category === 'farmacia').length} Farmacias · {businesses.filter((b) => b.category === 'restaurante').length} Restaurantes
              </span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Modalidad Entregas
              </span>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold text-purple-600">🛵 {deliveryOrdersCount} Domicilio</span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-bold text-amber-600">🏬 {pickupOrdersCount} Recojo</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Ratio 70/30</span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Chats WhatsApp IA
              </span>
              <p className="text-xl md:text-2xl font-black text-purple-600">
                {totalBotInteractions} Chats
              </p>
              <span className="text-[10px] text-[#D4021D] font-bold block">
                94.2% Apertura · 38% Clicks
              </span>
            </div>
          </div>

          {/* Quick Deep Link & Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Oferta del Día Destacada Global
              </h3>
              {(() => {
                const offerProd = products.find((p) => p.isOfferOfTheDay) || (products.length > 0 ? products[0] : null);
                if (!offerProd) {
                  return (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                      <p className="text-xs text-slate-500 font-medium">No hay productos registrados aún.</p>
                    </div>
                  );
                }
                const offerBiz = businesses.find((b) => b.id === offerProd?.businessId);
                return (
                  <div className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <img
                      src={offerProd.image || 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=200'}
                      alt={offerProd.name}
                      className="w-16 h-16 rounded-xl object-cover bg-white"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase">
                        Destacada en WhatsApp
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs">{offerProd.name}</h4>
                      <p className="text-xs text-[#D4021D] font-extrabold">
                        Bs. {offerProd.price} · {offerBiz?.name || 'Comercio'}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#D4021D]" />
                Última Campaña Masiva WhatsApp
              </h3>
              {campaigns[0] && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span className="truncate">{campaigns[0].title}</span>
                    <span className="text-[#D4021D] shrink-0 font-bold">{campaigns[0].sentCount} envíos</span>
                  </div>
                  <p className="text-slate-600 text-[11px] line-clamp-2">
                    {campaigns[0].message}
                  </p>
                  <div className="flex gap-3 text-[10px] text-slate-500 font-mono pt-1">
                    <span>Apertura: {campaigns[0].openRate}%</span>
                    <span>Clicks: {campaigns[0].clickRate}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* USUARIOS Y ROLES RBAC */}
      {activeAdminTab === 'users' && <AdminUsersView />}

      {/* DIRECTORIO DE CLIENTES */}
      {activeAdminTab === 'clients' && <AdminClientsView />}

      {/* PLANTILLA DE COLABORADORES */}
      {activeAdminTab === 'employees' && <AdminEmployeesView />}

      {/* 2. GESTIÓN DE NEGOCIOS (SELLERS) */}
      {activeAdminTab === 'sellers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Gestión de Negocios y Validación</h3>
              <p className="text-xs text-slate-500">
                Alta, edición, comisiones y asignación de pines con logos personalizados
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => openBusinessRegistration(false)}
                className="flex items-center gap-1.5 bg-[#D4021D] hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                title="Registrar un nuevo comercio con cuenta y credenciales para el dueño"
              >
                <Plus className="w-4 h-4" />
                <span>+ Registrar Comercio con Cuenta</span>
              </button>

              <button
                type="button"
                onClick={openAddBizModal}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                title="Alta rápida de sucursal en el mapa"
              >
                <Store className="w-4 h-4" />
                <span>Alta Rápida de Sucursal</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border-2 border-white"
                        style={{ backgroundColor: biz.customPinColor || '#D4021D' }}
                      >
                        {biz.logo}
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          {biz.category}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1 mt-0.5">
                          {biz.name}
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => updateBusiness(biz.id, { isActive: !biz.isActive })}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        biz.isActive
                          ? 'bg-slate-100 text-slate-800 border border-slate-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {biz.isActive ? 'Activo' : 'Pausado'}
                    </button>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <p className="line-clamp-1">📍 {biz.address}</p>
                    <p>📞 {biz.phone}</p>
                    <p className="font-mono text-[11px] text-slate-400">
                      Pin GPS: [{biz.coordinates.lat.toFixed(4)}, {biz.coordinates.lng.toFixed(4)}]
                    </p>
                    <div className="flex items-center justify-between text-slate-700 font-semibold pt-1">
                      <span>Comisión Plataforma:</span>
                      <span className="text-purple-600 font-bold">{biz.commissionRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-[#D4021D] font-bold">
                    {biz.isVerified ? '✓ Validado' : '⏳ Pendiente'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditBizModal(biz)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs cursor-pointer font-medium"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBusiness(biz.id)}
                      className="p-1.5 bg-slate-100 hover:bg-red-50 text-red-500 rounded-lg text-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MÓDULO WHATSAPP & CHATBOT IA */}
      {activeAdminTab === 'whatsapp' && (
        <div className="space-y-6">
          {/* Section A: Meta Cloud API Config */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#D4021D]" />
                <h3 className="font-bold text-slate-900 text-base">
                  Configuración API Oficial WhatsApp Business (Meta Cloud API / WATI)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-bold rounded-lg uppercase">
                Conectado
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-600 uppercase text-[10px] font-bold">
                  Meta Access Token (Bearer)
                </label>
                <input
                  type="password"
                  value={metaToken}
                  onChange={(e) => setMetaToken(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-slate-600 uppercase text-[10px] font-bold">
                  Phone Number ID (WABA)
                </label>
                <input
                  type="text"
                  value={phoneId}
                  onChange={(e) => setPhoneId(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-slate-600 uppercase text-[10px] font-bold">
                  Webhook Verify Token
                </label>
                <input
                  type="text"
                  value={chatbotConfig.webhookVerifyToken}
                  readOnly
                  className="w-full mt-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <button
              onClick={() => {
                updateChatbotConfig({ metaApiToken: metaToken, phoneNumberId: phoneId });
                alert('Configuración de WhatsApp guardada.');
              }}
              className="px-4 py-2 bg-[#D4021D] hover:bg-[#b50218] text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
            >
              Guardar Credenciales Meta
            </button>
          </div>

          {/* Section B: Chatbot Control Panel & Deep Link Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Welcome & Featured Offer */}
            <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Panel de Control del Chatbot
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-600 uppercase text-[10px] font-bold">
                    Mensaje de Bienvenida Automatizado
                  </label>
                  <textarea
                    value={welcomeText}
                    onChange={(e) => setWelcomeText(e.target.value)}
                    rows={3}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 resize-none focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="text-slate-600 uppercase text-[10px] font-bold">
                    Oferta del Día Promocionada en el Bot
                  </label>
                  <select
                    value={featuredOffer}
                    onChange={(e) => setFeaturedOffer(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - Bs. {p.price}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    updateChatbotConfig({
                      welcomeMessage: welcomeText,
                      featuredOfferId: featuredOffer
                    });
                    alert('Panel del Bot actualizado.');
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Actualizar Mensajes del Bot
                </button>
              </div>
            </div>

            {/* Deep Link Generator */}
            <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Link className="w-4 h-4 text-[#D4021D]" />
                Generador Automático de Deep Links
              </h3>
              <p className="text-xs text-slate-500">
                Enlaces dinámicos que abren la web PWA directo en el negocio o producto.
              </p>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 uppercase text-[10px] font-bold">
                      Negocio Destino
                    </label>
                    <select
                      value={deepLinkBizId}
                      onChange={(e) => setDeepLinkBizId(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#D4021D] cursor-pointer"
                    >
                      {(businesses || []).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 uppercase text-[10px] font-bold">
                      Producto (Opcional)
                    </label>
                    <select
                      value={deepLinkProdId}
                      onChange={(e) => setDeepLinkProdId(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#D4021D] cursor-pointer"
                    >
                      <option value="">Todo el Catálogo</option>
                      {(products || [])
                        .filter((p) => p && p.businessId === deepLinkBizId)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Official Direct Marketplace Link (Works 100% on Vercel) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-emerald-700">1. Enlace Directo Marketplace (Clientes)</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">100% Activo</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-2 font-mono text-[11px] text-emerald-900">
                    <span className="truncate font-semibold">{VERCEL_PRODUCTION_URL}</span>
                    <button
                      onClick={handleCopyMarketplaceLink}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-sans text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-xs transition-colors"
                      title="Copiar enlace directo al Marketplace"
                    >
                      {copiedMarketplaceLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedMarketplaceLink ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Direct Link to Admin Panel */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-red-700">2. Enlace Directo Superadmin</span>
                    <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">Gestión Total</span>
                  </div>
                  <div className="p-2.5 bg-red-50/70 rounded-xl border border-red-200/80 flex items-center justify-between gap-2 font-mono text-[11px] text-red-900">
                    <span className="truncate font-semibold">{VERCEL_ADMIN_URL}</span>
                    <button
                      onClick={handleCopyAdminLink}
                      className="p-1.5 bg-[#D4021D] hover:bg-red-700 text-white rounded-lg font-sans text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-xs transition-colors"
                      title="Copiar enlace directo de Superadmin"
                    >
                      {copiedAdminLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAdminLink ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Direct Link to Seller / Business Panel */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-700">3. Enlace Directo Portal Negocios</span>
                    <span className="text-[9px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-bold">Comercios</span>
                  </div>
                  <div className="p-2.5 bg-slate-100/80 rounded-xl border border-slate-300 flex items-center justify-between gap-2 font-mono text-[11px] text-slate-900">
                    <span className="truncate font-semibold">{VERCEL_SELLER_URL}</span>
                    <button
                      onClick={handleCopySellerLink}
                      className="p-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-sans text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-xs transition-colors"
                      title="Copiar enlace directo para Negocios"
                    >
                      {copiedSellerLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSellerLink ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Specific Deep Link */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">4. Enlace Específico con Filtros / Producto</span>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 font-mono text-[11px] text-[#D4021D]">
                    <span className="truncate">{generatedDeepLink}</span>
                    <button
                      onClick={handleCopyDeepLink}
                      className="p-1.5 bg-[#D4021D] hover:bg-[#b50218] text-white rounded-lg font-sans text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-xs transition-colors"
                      title="Copiar enlace específico"
                    >
                      {copiedDeepLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDeepLink ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section C: WhatsApp Mass Campaign Manager */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Gestor de Campañas Masivas & Promociones
                </h3>
              </div>

              {campaignSentToast && (
                <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200">
                  ✓ Campaña Enviada con Éxito
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-600 uppercase text-[10px] font-bold">
                  Título de la Campaña
                </label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="Ej. Fin de semana 30% OFF Burgers"
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-slate-600 uppercase text-[10px] font-bold">
                  Audiencia Objetivo
                </label>
                <select
                  value={campaignAudience}
                  onChange={(e) => setCampaignAudience(e.target.value as any)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                >
                  <option value="all">Todos los Usuarios Registrados</option>
                  <option value="farmacias_users">Clientes de Farmacias</option>
                  <option value="food_users">Clientes de Comida / Restaurantes</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="text-slate-600 uppercase text-[10px] font-bold">
                  Mensaje del Broadcast
                </label>
                <textarea
                  value={campaignMsg}
                  onChange={(e) => setCampaignMsg(e.target.value)}
                  placeholder="Escribe el mensaje con emojis y enlaces deep link..."
                  rows={3}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 resize-none focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <button
              onClick={handleSendCampaign}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md shadow-purple-600/25 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Campaña Masiva WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. MAPA & NAVEGACIÓN */}
      {activeAdminTab === 'map' && (
        <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-xs max-w-3xl">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#D4021D]" />
            Configuración de Capas del Mapa & Navegación Externa
          </h3>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Integración con Google Maps</h4>
                  <p className="text-slate-500 text-[11px]">
                    Permite a los usuarios trazar rutas en tiempo real mediante deeplink
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 font-bold rounded">
                  Habilitado
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Integración con Waze</h4>
                  <p className="text-slate-500 text-[11px]">
                    Lanza navegación directa por tráfico en la app oficial de Waze
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold rounded">
                  Habilitado
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Radio Máximo de Cobertura Geográfica</h4>
                  <p className="text-slate-500 text-[11px]">
                    Límite en kilómetros para mostrar negocios y calcular envíos
                  </p>
                </div>
                <span className="font-black text-[#D4021D] text-sm">15 KM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. FINANZAS & COMISIONES */}
      {activeAdminTab === 'finances' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Volumen Transaccionado
              </span>
              <p className="text-2xl font-black text-slate-900">Bs. {totalSales.toLocaleString()}</p>
              <span className="text-[10px] text-slate-400">En {orders.length} pedidos totales</span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Comisión Base Comercios
              </span>
              <p className="text-2xl font-black text-purple-600">
                Bs. {Math.round(totalSales * 0.1).toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400">Promedio 10% por venta</span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Tarifa Servicio Consumidor ({serviceFeeRate}%)
              </span>
              <p className="text-2xl font-black text-emerald-600">
                Bs. {orders.reduce((acc, o) => acc + (o.serviceFee || Math.round((o.total - (o.deliveryFee || 0)) * (serviceFeeRate / 100))), 0).toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400">Cobro automático en checkout</span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Ingresos Ads & Boost
              </span>
              <p className="text-2xl font-black text-[#D4021D]">
                Bs. {(products.filter((p) => p.isBoosted).length * 89).toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400">
                {products.filter((p) => p.isBoosted).length} productos destacados
              </span>
            </div>
          </div>

          {/* Breakdown per seller table */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base">
              Balance y Comisiones por Negocio (Sellers)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-3">Negocio</th>
                    <th className="pb-3">Categoría</th>
                    <th className="pb-3">Comisión</th>
                    <th className="pb-3">Ventas</th>
                    <th className="pb-3">Comisión Ganada</th>
                    <th className="pb-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(businesses || []).map((b) => {
                    if (!b) return null;
                    const bizSales = (orders || [])
                      .filter((o) => o && o.businessId === b.id)
                      .reduce((sum, o) => sum + (o.total || 0), 0);
                    const commissionRate = typeof b.commissionRate === 'number' ? b.commissionRate : 10;
                    const commissionAmount = Math.round((bizSales * commissionRate) / 100);

                    return (
                      <tr key={b.id} className="text-slate-800">
                        <td className="py-3 font-bold flex items-center gap-2">
                          <span>{b.logo || '🏪'}</span>
                          <span>{b.name || 'Comercio'}</span>
                        </td>
                        <td className="py-3 capitalize text-slate-500">{b.category || 'general'}</td>
                        <td className="py-3 font-mono font-bold text-purple-600">
                          {commissionRate}%
                        </td>
                        <td className="py-3 font-bold text-slate-900">Bs. {bizSales.toLocaleString()}</td>
                        <td className="py-3 font-bold text-[#D4021D]">
                          Bs. {commissionAmount.toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => alert(`Liquidación de Bs. ${(bizSales - commissionAmount).toLocaleString()} procesada para ${b.name}`)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] cursor-pointer"
                          >
                            Liquidar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUPABASE DATABASE & SQL MANAGEMENT */}
      {activeAdminTab === 'supabase' && <SupabaseAdminView />}

      {/* 7. RADAR DE DEMANDA */}
      {activeAdminTab === 'radar' && <DemandRadarView />}

      {/* 8. FICHA TÉCNICA Y CARACTERÍSTICAS PDF */}
      {activeAdminTab === 'pdf' && <PdfFeatureView />}

      {/* CREATE / EDIT BUSINESS MODAL */}
      {showAddBizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {editingBiz ? 'Editar Negocio' : 'Alta de Nuevo Negocio'}
              </h3>
              <button
                onClick={() => setShowAddBizModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
              <div>
                <label className="text-slate-600 uppercase text-[10px] font-bold">
                  Nombre del Negocio
                </label>
                <input
                  type="text"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 uppercase text-[10px] font-bold">
                    Categoría
                  </label>
                  <select
                    value={newBizCategory}
                    onChange={(e) => setNewBizCategory(e.target.value as BusinessCategory)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                  >
                    <option value="farmacia">💊 Farmacia</option>
                    <option value="restaurante">🍔 Restaurante / Comida</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 uppercase text-[10px] font-bold">
                    Comisión Plataforma (%)
                  </label>
                  <input
                    type="number"
                    value={newBizCommission}
                    onChange={(e) => setNewBizCommission(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 uppercase text-[10px] font-bold">
                  Dirección Física
                </label>
                <input
                  type="text"
                  value={newBizAddress}
                  onChange={(e) => setNewBizAddress(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 uppercase text-[10px] font-bold">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={newBizPhone}
                    onChange={(e) => setNewBizPhone(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="text-slate-600 uppercase text-[10px] font-bold">
                    Horario
                  </label>
                  <input
                    type="text"
                    value={newBizHours}
                    onChange={(e) => setNewBizHours(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Logo / Pin Icon Picker */}
              <div>
                <label className="text-slate-600 uppercase text-[10px] font-bold">
                  Logo Emoji del Marcador en el Mapa
                </label>
                <div className="flex gap-2 mt-1">
                  {['💊', '🌿', '🍔', '🍕', '🌮', '🥩', '🥗', '☕'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewBizLogo(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                        newBizLogo === emoji
                          ? 'bg-purple-600 text-white border-purple-600 scale-110 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pin Color */}
              <div>
                <label className="text-slate-600 uppercase text-[10px] font-bold">
                  Color del Pin en el Mapa
                </label>
                <div className="flex gap-2 mt-1">
                  {['#2563eb', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#eab308'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewBizPinColor(c)}
                      className={`w-8 h-8 rounded-xl border-2 transition-all cursor-pointer ${
                        newBizPinColor === c ? 'border-slate-900 scale-110 shadow-xs' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Coords */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 uppercase text-[10px]">Latitud:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newBizLat}
                    onChange={(e) => setNewBizLat(parseFloat(e.target.value))}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="text-slate-600 uppercase text-[10px]">Longitud:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newBizLng}
                    onChange={(e) => setNewBizLng(parseFloat(e.target.value))}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddBizModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBusiness}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Guardar Negocio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

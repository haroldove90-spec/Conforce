import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  ShoppingBag,
  Clock,
  User,
  LayoutDashboard,
  Store,
  Package,
  BarChart3,
  MessageSquare,
  DollarSign,
  Layers,
  Sparkles,
  Map as MapIcon,
  ChevronRight,
  Home,
  LogOut,
  LogIn,
  Share2,
  FileText,
  Download,
  MessageCircle,
  KeyRound,
  Check,
  X,
  Bike,
  ShieldCheck
} from 'lucide-react';

interface NavigationProps {
  onOpenRoleModal: () => void;
  onOpenCart: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onOpenRoleModal, onOpenCart }) => {
  const {
    currentRole,
    currentUser,
    logout,
    activeClientTab,
    setActiveClientTab,
    activeSellerTab,
    setActiveSellerTab,
    activeAdminTab,
    setActiveAdminTab,
    activeDriverTab,
    setActiveDriverTab,
    cartTotalCount,
    orders,
    currentSellerBusiness,
    navigateToHome,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    getMarketplaceShareUrl,
    openWhatsAppWithPrompt,
    installPWA,
    isAppInstalled,
    setIsClientAuthModalOpen,
    setIsCorporateAuthModalOpen,
    openCorporateAuth
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyClientLink = () => {
    const url = getMarketplaceShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  // Active pending orders count for badge
  const pendingOrdersCount = orders.filter(
    o => o.status === 'preparing' || o.status === 'ready' || o.status === 'on_the_way'
  ).length;

  // Desktop Left Sidebar navigation items by role
  const getSidebarNavItems = () => {
    switch (currentRole) {
      case 'seller':
        return [
          { id: 'orders', label: 'Pedidos en Vivo', icon: <Clock className="w-4 h-4" />, badge: pendingOrdersCount },
          { id: 'catalog', label: 'Catálogo e Inventario', icon: <Package className="w-4 h-4" /> },
          { id: 'profile', label: 'Perfil Comercial y GPS', icon: <Store className="w-4 h-4" /> },
          { id: 'stats', label: 'Métricas de Tienda', icon: <BarChart3 className="w-4 h-4" /> }
        ];
      case 'admin':
        return [
          { id: 'overview', label: 'Dashboard General', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'sellers', label: 'Gestión de Negocios', icon: <Store className="w-4 h-4" /> },
          { id: 'whatsapp', label: 'WhatsApp & Bot IA', icon: <MessageSquare className="w-4 h-4" /> },
          { id: 'map', label: 'Mapa & Navegación', icon: <Layers className="w-4 h-4" /> },
          { id: 'finances', label: 'Finanzas & Comisiones', icon: <DollarSign className="w-4 h-4" /> }
        ];
      case 'driver':
        return [
          { id: 'deliveries', label: 'Despachos en Vivo', icon: <Bike className="w-4 h-4 text-emerald-400" /> },
          { id: 'history', label: 'Historial de Carreras', icon: <Clock className="w-4 h-4" /> },
          { id: 'wallet', label: 'Billetera Pago Móvil', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
          { id: 'profile', label: 'Mi Moto y Licencia', icon: <User className="w-4 h-4" /> }
        ];
      default:
        return [
          { id: 'explore', label: 'Vitrina de Tiendas', icon: <Compass className="w-4 h-4" /> },
          { id: 'map', label: 'Mapa de Cobertura', icon: <MapIcon className="w-4 h-4 text-[#D4021D]" /> },
          { id: 'orders', label: 'Mis Pedidos', icon: <Clock className="w-4 h-4" />, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
          { id: 'account', label: 'Mi Cuenta & Direcciones', icon: <User className="w-4 h-4" /> },
          { id: 'roles_hub', label: 'Portal de Roles', icon: <Sparkles className="w-4 h-4 text-amber-500" /> }
        ];
    }
  };

  // Mobile Bottom Navigation Bar items
  const getMobileNavItems = () => {
    switch (currentRole) {
      case 'seller':
        return [
          { id: 'orders', label: 'Pedidos', icon: <Clock className="w-5 h-5 text-white" />, badge: pendingOrdersCount },
          { id: 'catalog', label: 'Catálogo', icon: <Package className="w-5 h-5 text-white" /> },
          { id: 'profile', label: 'Perfil GPS', icon: <Store className="w-5 h-5 text-white" /> },
          { id: 'roles_modal', label: 'Roles', icon: <Sparkles className="w-5 h-5 text-white" /> }
        ];
      case 'admin':
        return [
          { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 text-white" /> },
          { id: 'sellers', label: 'Sellers', icon: <Store className="w-5 h-5 text-white" /> },
          { id: 'whatsapp', label: 'WhatsApp IA', icon: <MessageSquare className="w-5 h-5 text-white" /> },
          { id: 'finances', label: 'Finanzas', icon: <DollarSign className="w-5 h-5 text-white" /> },
          { id: 'roles_modal', label: 'Roles', icon: <Sparkles className="w-5 h-5 text-white" /> }
        ];
      case 'driver':
        return [
          { id: 'deliveries', label: 'Despachos', icon: <Bike className="w-5 h-5 text-emerald-400" /> },
          { id: 'wallet', label: 'Billetera', icon: <DollarSign className="w-5 h-5 text-white" /> },
          { id: 'profile', label: 'Mi Moto', icon: <User className="w-5 h-5 text-white" /> },
          { id: 'roles_modal', label: 'Roles', icon: <Sparkles className="w-5 h-5 text-white" /> }
        ];
      default:
        return [
          { id: 'explore', label: 'Inicio', icon: <Compass className="w-5 h-5 text-white" /> },
          { id: 'map', label: 'Mapa', icon: <MapIcon className="w-5 h-5 text-white" /> },
          { id: 'cart_modal', label: 'Carrito', icon: <ShoppingBag className="w-5 h-5 text-white" />, badge: cartTotalCount },
          { id: 'orders', label: 'Pedidos', icon: <Clock className="w-5 h-5 text-white" /> },
          { id: 'account', label: 'Cuenta', icon: <User className="w-5 h-5 text-white" /> }
        ];
    }
  };

  const currentTab =
    currentRole === 'client'
      ? activeClientTab
      : currentRole === 'seller'
      ? activeSellerTab
      : currentRole === 'admin'
      ? activeAdminTab
      : activeDriverTab;

  const handleTabClick = (tabId: string) => {
    if (tabId === 'roles_modal' || tabId === 'roles_hub') {
      onOpenRoleModal();
      setIsMobileMenuOpen(false);
      return;
    }
    if (tabId === 'cart_modal') {
      onOpenCart();
      setIsMobileMenuOpen(false);
      return;
    }

    if (currentRole === 'client') setActiveClientTab(tabId);
    if (currentRole === 'seller') setActiveSellerTab(tabId);
    if (currentRole === 'admin') setActiveAdminTab(tabId);
    if (currentRole === 'driver') setActiveDriverTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // Reusable Sidebar content (used for desktop sidebar & mobile drawer)
  const renderSidebarContent = (isDrawer = false) => (
    <div className="flex flex-col h-full space-y-4">
      {/* 1. Quick Home Button */}
      <button
        onClick={() => {
          navigateToHome();
          if (isDrawer) setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
          currentRole === 'client' && activeClientTab === 'explore'
            ? 'bg-zinc-950 text-white'
            : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 hover:text-black'
        }`}
      >
        <Home className="w-4 h-4 text-[#D4021D] shrink-0" />
        <span>Ir a Inicio (Marketplace)</span>
      </button>

      {/* 2. Role Selector Card */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Rol Activo
          </span>
          <button
            onClick={() => {
              onOpenRoleModal();
              if (isDrawer) setIsMobileMenuOpen(false);
            }}
            className="text-[10px] font-bold text-[#D4021D] hover:text-[#b50218] flex items-center gap-0.5 cursor-pointer"
          >
            Cambiar <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-xl">
            {currentRole === 'client' ? '🛒' : currentRole === 'seller' ? '🏪' : '⚡'}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-xs truncate">
              {currentRole === 'client'
                ? 'Cliente Final'
                : currentRole === 'seller'
                ? currentSellerBusiness?.name || 'Vendedor'
                : 'Superadministrador'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {currentRole === 'client'
                ? 'Explorar & Comprar'
                : currentRole === 'seller'
                ? 'Panel de Comercio'
                : 'Control del Sistema'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Modules */}
      <div className="space-y-1">
        <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Módulos
        </span>

        {getSidebarNavItems().map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white text-[#D4021D]' : 'bg-[#D4021D] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. HERRAMIENTAS & ACCESOS RÁPIDOS (Opciones trasladadas del Header) */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200">
        <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Herramientas y Accesos
        </span>

        {/* Share Client Link Button */}
        <button
          onClick={handleCopyClientLink}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
            copiedLink
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Copiar link directo a la tienda (/marketplace)"
        >
          <div className="flex items-center gap-2 min-w-0">
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Share2 className="w-4 h-4 text-[#D4021D] shrink-0" />}
            <span className="truncate">{copiedLink ? '¡Link Copiado!' : 'Copiar Link Clientes'}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono shrink-0">/market</span>
        </button>

        {/* Download PDF Roles */}
        <a
          href="/Con_Force_Caracteristicas_Por_Rol.pdf"
          download="Con_Force_Caracteristicas_Por_Rol.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all cursor-pointer shadow-2xs"
          title="Descargar Ficha Técnica PDF de Roles"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-[#D4021D] shrink-0" />
            <span className="truncate">Descargar PDF Roles</span>
          </div>
          <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </a>

        {/* WhatsApp Bot IA */}
        <button
          onClick={() => {
            openWhatsAppWithPrompt();
            if (isDrawer) setIsMobileMenuOpen(false);
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition-all cursor-pointer shadow-2xs"
          title="Iniciar asistente de WhatsApp"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Asistente Bot IA</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black shrink-0">
            24/7
          </span>
        </button>

        {/* Install PWA Button (if not already installed) */}
        {!isAppInstalled && (
          <button
            onClick={() => {
              installPWA();
              if (isDrawer) setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            title="Instalar la aplicación en el dispositivo"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Download className="w-4 h-4 text-[#D4021D] shrink-0" />
              <span className="truncate">Instalar Aplicación</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold shrink-0">PWA</span>
          </button>
        )}

        {/* Corporate Portal Access (For Admins & Businesses) */}
        {currentRole === 'client' && (
          <button
            onClick={() => {
              setIsCorporateAuthModalOpen(true);
              if (isDrawer) setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-zinc-100 hover:text-zinc-950 transition-all cursor-pointer shadow-2xs"
            title="Acceso para Administradores y Comercios"
          >
            <div className="flex items-center gap-2 min-w-0">
              <KeyRound className="w-4 h-4 text-[#D4021D] shrink-0" />
              <span className="truncate">Admin / Negocios</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        )}
      </div>

      {/* 5. Bottom: Active User Session & Cerrar Sesión Button */}
      <div className="mt-auto pt-3 border-t border-slate-200 space-y-2">
        {currentUser ? (
          <>
            {/* User Mini Card */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#D4021D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {(currentUser.name || currentUser.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name || currentUser.username || 'Usuario'}</p>
                  <p className="text-[10px] text-slate-500 truncate">@{currentUser.username || 'usuario'}</p>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[9px] font-bold uppercase shrink-0">
                {currentUser.role || 'client'}
              </span>
            </div>

            {/* Dedicated, Prominent Cerrar Sesión Button */}
            <button
              onClick={() => {
                logout();
                if (isDrawer) setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-[#D4021D] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Cerrar la sesión actual"
            >
              <LogOut className="w-4 h-4 text-[#D4021D]" />
              <span>Cerrar Sesión</span>
            </button>
          </>
        ) : (
          <div className="space-y-1.5">
            <button
              onClick={() => {
                setIsClientAuthModalOpen(true);
                if (isDrawer) setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#D4021D] hover:bg-[#b50218] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Formulario Cliente</span>
            </button>

            <button
              onClick={() => {
                openCorporateAuth('seller');
                if (isDrawer) setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-100 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Store className="w-4 h-4 text-zinc-300" />
              <span>Formulario Negocios</span>
            </button>

            <button
              onClick={() => {
                openCorporateAuth('driver');
                if (isDrawer) setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-emerald-700/60 hover:border-emerald-500 text-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Bike className="w-4 h-4 text-emerald-400" />
              <span>Formulario Mensajeros</span>
            </button>

            <button
              onClick={() => {
                openCorporateAuth('admin');
                if (isDrawer) setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-red-800/60 hover:border-red-600 text-red-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-[#D4021D]" />
              <span>Formulario Admin</span>
            </button>
          </div>
        )}

        {/* Connectivity Status Indicator */}
        <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between">
          <span className="font-medium">ConForce PWA</span>
          <span className="flex items-center gap-1 text-slate-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#D4021D] animate-pulse" />
            En línea
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP / FULLSCREEN LEFT SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-61px)] sticky top-[61px] bg-slate-50/90 backdrop-blur-xl border-r border-slate-200 p-4 shrink-0 overflow-y-auto no-scrollbar">
        {renderSidebarContent(false)}
      </aside>

      {/* 2. MOBILE SLIDE-IN DRAWER (TRIGGERED FROM HEADER HAMBURGER) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-72 max-w-[85vw] bg-slate-50 h-full shadow-2xl flex flex-col p-4 overflow-y-auto no-scrollbar z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
              <span className="text-xs font-black tracking-wider uppercase text-slate-900">
                Menú de Navegación
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                title="Cerrar menú"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Content inside Drawer */}
            {renderSidebarContent(true)}
          </div>
        </div>
      )}

      {/* 3. MOBILE & TABLET BOTTOM NAVIGATION BAR (Background #000000, white icons, white module names) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#000000] border-t border-white/10 px-2 py-2 shadow-2xl safe-area-inset-bottom">
        <div className="flex items-center justify-around">
          {getMobileNavItems().map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer text-white ${
                  isActive ? 'opacity-100 font-bold' : 'opacity-80 hover:opacity-100'
                }`}
              >
                {/* Icon with white color and badge */}
                <div className="relative p-1 text-white">
                  {item.icon}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#D4021D] text-white text-[10px] font-black flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Module name in legible white */}
                <span className="text-[10px] text-white tracking-tight leading-none mt-0.5 font-medium">
                  {item.label}
                </span>

                {/* Active Indicator dot */}
                {isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#D4021D]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

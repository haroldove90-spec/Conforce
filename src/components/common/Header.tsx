import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PulsoLogo } from './PulsoLogo';
import { CurrencySelector } from './CurrencySelector';
import {
  MapPin,
  LocateFixed,
  ShoppingBag,
  ShieldCheck,
  Store,
  User,
  ChevronDown,
  LogIn,
  LogOut,
  Home,
  Menu,
  Bike
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenRoleModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenRoleModal }) => {
  const {
    currentRole,
    currentUser,
    logout,
    cartTotalCount,
    userAddressLabel,
    detectUserLocation,
    isLocating,
    locationPermissionStatus,
    setIsLocationPickerOpen,
    setIsClientAuthModalOpen,
    setIsCorporateAuthModalOpen,
    openCorporateAuth,
    setIsProfileModalOpen,
    navigateToHome,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRoleAccessDropdown, setShowRoleAccessDropdown] = useState(false);

  const getRoleDisplay = () => {
    switch (currentRole) {
      case 'admin':
        return {
          name: 'Superadmin',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-[#D4021D]" />,
          color: 'bg-red-950/40 border-red-800/60 text-red-200 hover:bg-red-950/70'
        };
      case 'seller':
        return {
          name: 'Negocio',
          icon: <Store className="w-3.5 h-3.5 text-zinc-300" />,
          color: 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
        };
      case 'driver':
        return {
          name: 'Mensajero Moto',
          icon: <Bike className="w-3.5 h-3.5 text-emerald-400" />,
          color: 'bg-emerald-950/50 border-emerald-700/60 text-emerald-200 hover:bg-emerald-900/60'
        };
      default:
        return {
          name: 'Marketplace',
          icon: <ShoppingBag className="w-3.5 h-3.5 text-[#D4021D]" />,
          color: 'bg-white/10 border-white/20 text-white hover:bg-white/20'
        };
    }
  };

  const roleInfo = getRoleDisplay();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#000000] border-b border-zinc-800/80 px-3 md:px-6 py-2.5 shadow-md text-white select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
        
        {/* Left: Brand Logo & Quick Home Button */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Logo with direct Home click */}
          <button
            onClick={navigateToHome}
            className="flex items-center gap-2 cursor-pointer text-left group transition-transform active:scale-95"
            title="Ir a Inicio / Marketplace"
          >
            <PulsoLogo size="md" textColor="text-white" />
          </button>

          {/* Explicit Home Button */}
          <button
            onClick={navigateToHome}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 hover:border-zinc-700 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
            title="Ir a la pantalla de Inicio"
          >
            <Home className="w-4 h-4 text-[#D4021D]" />
            <span className="hidden sm:inline">Inicio</span>
          </button>

          {/* Role Pill */}
          {currentUser?.role === 'admin' ? (
            <button
              onClick={onOpenRoleModal}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs ${roleInfo.color}`}
              title="Superadministrador: Conmutador de roles"
            >
              {roleInfo.icon}
              <span className="hidden md:inline">{roleInfo.name}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
          ) : (
            <div
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-xs select-none ${roleInfo.color}`}
            >
              {roleInfo.icon}
              <span className="hidden md:inline">{roleInfo.name}</span>
            </div>
          )}
        </div>

        {/* Center: GPS Location Pill & Currency Switcher */}
        <div className="flex-1 max-w-md hidden md:flex items-center justify-center gap-2 min-w-0">
          <div className="w-full max-w-[230px] flex items-center justify-between gap-1 px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white shadow-xs">
            <button
              type="button"
              onClick={() => setIsLocationPickerOpen(true)}
              className="flex items-center gap-1.5 min-w-0 flex-1 text-left hover:text-white transition-colors py-0.5 cursor-pointer"
              title="Cambiar ciudad o activar GPS"
            >
              <MapPin className="w-3.5 h-3.5 text-[#D4021D] shrink-0" />
              <span className="truncate text-zinc-300 font-medium text-xs">
                {locationPermissionStatus === 'granted' ? userAddressLabel : 'Activar GPS · Elegir ciudad'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => detectUserLocation(true)}
              disabled={isLocating}
              className="p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title="Actualizar mi ubicación GPS"
            >
              <LocateFixed className={`w-3.5 h-3.5 text-zinc-400 ${isLocating ? 'animate-spin text-[#D4021D]' : ''}`} />
            </button>
          </div>

          <CurrencySelector variant="dark" />
        </div>

        {/* Right: User, Logout & Cart Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* User Auth & Cerrar Sesión Section */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              {/* Profile dropdown trigger */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-white font-semibold transition-all cursor-pointer"
                  title="Opciones de cuenta"
                >
                  <div className="w-5 h-5 rounded-full bg-[#D4021D] text-white flex items-center justify-center font-bold text-[10px]">
                    {(currentUser.name || currentUser.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline max-w-[90px] truncate">
                    {(currentUser.name || currentUser.username || 'Usuario').split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {showUserDropdown && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-50 text-xs text-white animate-fade-in"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <div className="p-2 border-b border-zinc-800">
                      <p className="font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-zinc-400 text-[11px] truncate">@{currentUser.username}</p>
                      <div className="mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-bold border border-red-800 uppercase">
                          Rol: {currentUser.role}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-zinc-900 rounded-lg flex items-center gap-2 text-zinc-300 hover:text-white cursor-pointer font-semibold"
                      >
                        <User className="w-3.5 h-3.5 text-[#D4021D]" />
                        <span>Mi Perfil y Clave</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          navigateToHome();
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-zinc-900 rounded-lg flex items-center gap-2 text-zinc-300 hover:text-white cursor-pointer font-semibold"
                      >
                        <Home className="w-3.5 h-3.5 text-[#D4021D]" />
                        <span>Ir a Inicio (Marketplace)</span>
                      </button>

                      <button
                        onClick={() => logout()}
                        className="w-full text-left px-2.5 py-2 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded-lg flex items-center gap-2 cursor-pointer font-bold border-t border-zinc-800/80 mt-1 pt-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct, Prominent Cerrar Sesión Button */}
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-red-950/70 hover:bg-red-900 border border-red-800/80 text-red-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                title="Cerrar Sesión Activa"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
          ) : (
            /* Login / Register Buttons for all 4 profiles */
            <div className="flex items-center gap-1 sm:gap-1.5 relative">
              {/* 1. Cliente Final */}
              <button
                onClick={() => setIsClientAuthModalOpen(true)}
                className="flex items-center gap-1 bg-[#D4021D] hover:bg-[#b50218] text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                title="Formulario de Acceso y Registro para Clientes"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Cliente</span>
              </button>

              {/* 2. Negocios (Desktop) */}
              <button
                onClick={() => openCorporateAuth('seller')}
                className="hidden md:flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                title="Formulario de Acceso para Comercios y Tiendas"
              >
                <Store className="w-3.5 h-3.5 text-zinc-300" />
                <span>Negocio</span>
              </button>

              {/* 3. Mensajeros en Moto (Desktop) */}
              <button
                onClick={() => openCorporateAuth('driver')}
                className="hidden md:flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 border border-emerald-700/60 hover:border-emerald-500 text-emerald-300 hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                title="Formulario de Acceso para Mensajeros en Moto"
              >
                <Bike className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mensajero</span>
              </button>

              {/* 4. Superadmin (Desktop) */}
              <button
                onClick={() => openCorporateAuth('admin')}
                className="hidden md:flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 border border-red-800/60 hover:border-red-600 text-red-300 hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                title="Formulario de Acceso Superadministrador"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4021D]" />
                <span>Admin</span>
              </button>

              {/* Mobile Role Switcher Menu Trigger (< md) */}
              <div className="md:hidden relative">
                <button
                  type="button"
                  onClick={() => setShowRoleAccessDropdown(!showRoleAccessDropdown)}
                  className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Más formularios de acceso"
                >
                  <span>Roles</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {showRoleAccessDropdown && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-50 text-xs text-white animate-fade-in space-y-1"
                    onClick={() => setShowRoleAccessDropdown(false)}
                  >
                    <p className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      Formularios de Acceso
                    </p>

                    <button
                      type="button"
                      onClick={() => openCorporateAuth('seller')}
                      className="w-full text-left px-2.5 py-2 hover:bg-zinc-900 rounded-xl flex items-center gap-2 text-zinc-200 cursor-pointer font-bold"
                    >
                      <Store className="w-4 h-4 text-zinc-300" />
                      <span>Formulario Negocios</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openCorporateAuth('driver')}
                      className="w-full text-left px-2.5 py-2 hover:bg-zinc-900 rounded-xl flex items-center gap-2 text-emerald-400 cursor-pointer font-bold"
                    >
                      <Bike className="w-4 h-4 text-emerald-400" />
                      <span>Formulario Mensajeros</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openCorporateAuth('admin')}
                      className="w-full text-left px-2.5 py-2 hover:bg-zinc-900 rounded-xl flex items-center gap-2 text-red-400 cursor-pointer font-bold"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#D4021D]" />
                      <span>Formulario Admin</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cart Button with Count Badge (Client role only) */}
          {currentRole === 'client' && (
            <button
              onClick={onOpenCart}
              className="relative p-2 sm:px-3 sm:py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
              aria-label="Ver carrito"
              title="Carrito de compras"
            >
              <ShoppingBag className="w-4 h-4 text-[#D4021D]" />
              <span className="hidden sm:inline">Carrito</span>
              {cartTotalCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#D4021D] text-white font-black text-[11px] flex items-center justify-center shadow-xs">
                  {cartTotalCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile Navigation Drawer Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Abrir menú de opciones"
            aria-label="Abrir menú"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

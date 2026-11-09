import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PulsoLogo } from './PulsoLogo';
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
  Menu
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
    setIsClientAuthModalOpen,
    setIsCorporateAuthModalOpen,
    setIsProfileModalOpen,
    navigateToHome,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);

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

        {/* Center: GPS Location Pill (Clean, compact, and truncated) */}
        <div className="flex-1 max-w-xs hidden md:flex items-center justify-center min-w-0">
          <button
            onClick={detectUserLocation}
            disabled={isLocating}
            className="w-full max-w-[220px] flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-xs text-white transition-all text-left shadow-xs cursor-pointer"
            title="Actualizar mi ubicación GPS"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-[#D4021D] shrink-0" />
              <span className="truncate text-zinc-300 font-medium text-xs">
                {userAddressLabel}
              </span>
            </div>
            <LocateFixed className={`w-3.5 h-3.5 text-zinc-400 shrink-0 ${isLocating ? 'animate-spin text-[#D4021D]' : ''}`} />
          </button>
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
            /* Login / Register Buttons when not logged in */
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsClientAuthModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#D4021D] hover:bg-[#b50218] text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                title="Iniciar Sesión o Registrarse como Cliente"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Entrar Cliente</span>
                <span className="sm:hidden">Cliente</span>
              </button>

              <button
                onClick={() => setIsCorporateAuthModalOpen(true)}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-red-600/60 text-zinc-200 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                title="Formulario de Acceso para Administradores y Negocios"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4021D]" />
                <span className="hidden sm:inline">Acceso Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>
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

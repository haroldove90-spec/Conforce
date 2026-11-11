import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PasswordInput } from './PasswordInput';
import {
  X,
  ShieldCheck,
  Building2,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Bike,
  Store,
  ShoppingBag
} from 'lucide-react';

export const CorporateAuthModal: React.FC = () => {
  const {
    isCorporateAuthModalOpen,
    setIsCorporateAuthModalOpen,
    setIsClientAuthModalOpen,
    corporateAuthInitialTab,
    loginAsCorporate,
    loginDirectAsAdmin,
    loginDirectAsSeller,
    loginDirectAsDriver,
    openBusinessRegistration,
    openDriverRegistration
  } = useApp();

  const [activeTab, setActiveTab] = useState<'admin' | 'seller' | 'driver'>('admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isCorporateAuthModalOpen) {
      setActiveTab(corporateAuthInitialTab || 'admin');
      setErrorMessage('');
      setSuccessMessage('');
      // Set helpful default placeholder hint
      if (corporateAuthInitialTab === 'seller') setIdentifier('tienda_sanrafael');
      else if (corporateAuthInitialTab === 'driver') setIdentifier('carlos_moto');
      else setIdentifier('haroldo90');
    }
  }, [isCorporateAuthModalOpen, corporateAuthInitialTab]);

  if (!isCorporateAuthModalOpen) return null;

  const handleDirectAdminLogin = (type: 'harold' | 'master') => {
    const res = loginDirectAsAdmin(type);
    setSuccessMessage(res.message);
    setTimeout(() => {
      setIsCorporateAuthModalOpen(false);
    }, 400);
  };

  const handleDirectSellerLogin = () => {
    const res = loginDirectAsSeller();
    setSuccessMessage(res.message);
    setTimeout(() => {
      setIsCorporateAuthModalOpen(false);
    }, 400);
  };

  const handleDirectDriverLogin = () => {
    const res = loginDirectAsDriver();
    setSuccessMessage(res.message);
    setTimeout(() => {
      setIsCorporateAuthModalOpen(false);
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier.trim() || !password) {
      setErrorMessage('Por favor ingresa usuario/correo y tu contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginAsCorporate(identifier, password);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(res.message);
        setTimeout(() => {
          setIsCorporateAuthModalOpen(false);
        }, 600);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error al autenticar en Supabase.');
    }
  };

  // Tab dynamic meta
  const getTabMeta = () => {
    switch (activeTab) {
      case 'seller':
        return {
          title: 'Formulario de Acceso para Negocios',
          badge: 'Portal Comercios & Tiendas',
          desc: 'Gestión de catálogo, actualización de precios e inventario, pedidos y ventas en vivo.',
          icon: <Store className="w-6 h-6 text-white" />,
          accentBg: 'bg-zinc-800',
          pillBg: 'bg-zinc-900 border-zinc-700 text-zinc-300',
          inputPlaceholder: 'ej. tienda_sanrafael o contacto@sanrafael.com',
          buttonLabel: 'Validar y Entrar como Comercio'
        };
      case 'driver':
        return {
          title: 'Formulario de Acceso para Mensajeros en Moto',
          badge: 'Flota Delivery & Motorizados',
          desc: 'Recepción de carreras en vivo, mapa GPS y billetera con cobros directos por Pago Móvil en Bs.',
          icon: <Bike className="w-6 h-6 text-white" />,
          accentBg: 'bg-emerald-600',
          pillBg: 'bg-emerald-950 border-emerald-700/60 text-emerald-300',
          inputPlaceholder: 'ej. carlos_moto o jose_moto',
          buttonLabel: 'Validar y Entrar al Manillar de Moto'
        };
      default:
        return {
          title: 'Formulario de Acceso Administrador',
          badge: 'Control Master & Dirección',
          desc: 'Superadministrador Harold Anguiano, Dirección General, métricas globales y finanzas.',
          icon: <ShieldCheck className="w-6 h-6 text-white" />,
          accentBg: 'bg-[#D4021D]',
          pillBg: 'bg-red-950/80 border-red-800/50 text-red-300',
          inputPlaceholder: 'ej. haroldo90 o admin_master',
          buttonLabel: 'Validar y Entrar como Administrador'
        };
    }
  };

  const meta = getTabMeta();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-white flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-br from-black via-zinc-900 to-red-950/40 p-6 border-b border-zinc-800 relative">
          <button
            onClick={() => setIsCorporateAuthModalOpen(false)}
            className="absolute right-4 top-4 w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl ${meta.accentBg} flex items-center justify-center text-white shadow-xl shadow-black/40`}>
              {meta.icon}
            </div>
            <div>
              <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${meta.pillBg}`}>
                {meta.badge}
              </div>
              <h2 className="text-lg md:text-xl font-black text-white mt-1">
                {meta.title}
              </h2>
              <p className="text-xs text-zinc-400">
                {meta.desc}
              </p>
            </div>
          </div>
        </div>

        {/* 4-Tab Navigation Selector */}
        <div className="p-2.5 bg-zinc-950 border-b border-zinc-800 grid grid-cols-4 gap-1.5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsCorporateAuthModalOpen(false);
              setIsClientAuthModalOpen(true);
            }}
            className="py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Ir a Formulario de Clientes Compradores"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
            <span className="truncate">Clientes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('seller');
              setIdentifier('tienda_sanrafael');
              setErrorMessage('');
            }}
            className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 border ${
              activeTab === 'seller'
                ? 'bg-zinc-800 text-white border-zinc-600 shadow-md'
                : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800/80'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-zinc-300" />
            <span className="truncate">Negocios</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('driver');
              setIdentifier('carlos_moto');
              setErrorMessage('');
            }}
            className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 border ${
              activeTab === 'driver'
                ? 'bg-emerald-700 text-white border-emerald-500 shadow-md shadow-emerald-900/30'
                : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800/80'
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Mensajeros</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setIdentifier('haroldo90');
              setErrorMessage('');
            }}
            className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 border ${
              activeTab === 'admin'
                ? 'bg-[#D4021D] text-white border-red-500 shadow-md shadow-red-900/30'
                : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800/80'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span className="truncate">Admin</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-red-950/80 border border-red-700/60 rounded-xl flex items-center gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {activeTab === 'seller'
                  ? 'Usuario o Correo del Negocio'
                  : activeTab === 'driver'
                  ? 'Usuario del Mensajero / Repartidor'
                  : 'Usuario o Correo Administrador'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={meta.inputPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4021D] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Contraseña de Seguridad
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                showGenerator={false}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1 ${
                activeTab === 'driver'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                  : activeTab === 'seller'
                  ? 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700'
                  : 'bg-[#D4021D] hover:bg-red-700 shadow-red-950/50'
              }`}
            >
              {isSubmitting ? (
                <span>Validando acceso...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{meta.buttonLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Guaranteed 1-Click Access specific to selected role */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                ⚡ Acceso Directo de Prueba (1-Clic)
              </span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {activeTab === 'admin' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectAdminLogin('harold')}
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-red-600/50 text-left flex items-center gap-2.5 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    👑
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">Harold Anguiano</div>
                    <div className="text-[10px] text-zinc-400 truncate">Superadmin ConForce</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectAdminLogin('master')}
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-red-600/50 text-left flex items-center gap-2.5 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    🛡️
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">Admin Master</div>
                    <div className="text-[10px] text-zinc-400 truncate">Dirección General</div>
                  </div>
                </button>
              </div>
            )}

            {activeTab === 'seller' && (
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={handleDirectSellerLogin}
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-500 text-left flex items-center gap-2.5 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-700/60 text-zinc-200 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-zinc-600 group-hover:text-white transition-colors">
                    🏪
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">Farmacia San Rafael</div>
                    <div className="text-[10px] text-zinc-400 truncate">Comercio Aliado (Demo)</div>
                  </div>
                </button>
              </div>
            )}

            {activeTab === 'driver' && (
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={handleDirectDriverLogin}
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/50 text-left flex items-center gap-2.5 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Bike className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">Carlos Mendoza</div>
                    <div className="text-[10px] text-emerald-400 font-semibold truncate">Mensajero Moto (Demo)</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Role specific Registration / Afiliación Action */}
          {activeTab === 'seller' && (
            <div className="p-3.5 bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-zinc-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">¿Aún no tienes tienda registrada?</h4>
                  <p className="text-[11px] text-zinc-400">Afíliate y empieza a vender en ConForce</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCorporateAuthModalOpen(false);
                  openBusinessRegistration(false);
                }}
                className="px-3 py-1.5 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg text-xs font-black shrink-0 transition-colors cursor-pointer"
              >
                + Afiliar Tienda
              </button>
            </div>
          )}

          {activeTab === 'driver' && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-black border border-emerald-900/40 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Bike className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">¿Tienes moto y buscas ingresos?</h4>
                  <p className="text-[11px] text-zinc-400">Afíliate como mensajero y cobra por Pago Móvil</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCorporateAuthModalOpen(false);
                  openDriverRegistration();
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-md"
              >
                + Registrar Moto
              </button>
            </div>
          )}

          {/* Switch to Client Modal */}
          <div className="pt-2 border-t border-zinc-900 text-center">
            <button
              type="button"
              onClick={() => {
                setIsCorporateAuthModalOpen(false);
                setIsClientAuthModalOpen(true);
              }}
              className="text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer font-medium"
            >
              ¿Eres un Cliente comprador? Ir a Iniciar Sesión / Registro de Clientes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

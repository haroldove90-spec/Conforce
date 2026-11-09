import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Store,
  Sparkles,
  ShoppingBag,
  KeyRound,
  Eye,
  EyeOff,
  Home,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CorporatePortalHome: React.FC = () => {
  const {
    currentUser,
    logout,
    loginAsCorporate,
    loginDirectAsAdmin,
    loginDirectAsSeller,
    openBusinessRegistration,
    navigateToRoute,
    navigateToHome,
    getMarketplaceShareUrl,
    getCorporateShareUrl
  } = useApp();

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Link copy feedback
  const [copiedLink, setCopiedLink] = useState<'marketplace' | 'corporate' | null>(null);

  const handleCopy = (type: 'marketplace' | 'corporate') => {
    const url = type === 'marketplace' ? getMarketplaceShareUrl() : getCorporateShareUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleDirectAdminLogin = (type: 'harold' | 'master') => {
    const res = loginDirectAsAdmin(type);
    setSuccessMessage(res.message);
  };

  const handleDirectSellerLogin = () => {
    const res = loginDirectAsSeller();
    setSuccessMessage(res.message);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier.trim() || !password) {
      setErrorMessage('Por favor ingresa usuario/correo y contraseña.');
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
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error al autenticar en Supabase.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-zinc-900 flex flex-col overflow-y-auto overflow-x-hidden">
      {/* Top Navbar */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://cjoszqkgqtgfvzqxcsvi.supabase.co/storage/v1/object/public/logos/conforcelogo.png"
              alt="ConForce Logo"
              className="h-9 md:h-10 w-auto object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-zinc-950">CONFORCE</span>
                <span className="px-2 py-0.5 rounded-full bg-red-50 text-[#D4021D] text-[10px] font-bold border border-red-200">
                  PORTAL CORPORATIVO
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">Administración y Comercios Afiliados</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={navigateToHome}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              title="Ir a Inicio / Marketplace"
            >
              <Home className="w-3.5 h-3.5 text-[#D4021D]" />
              <span>Ir a Inicio</span>
            </button>

            {currentUser && (
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-[#D4021D] text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                title="Cerrar sesión activa"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero & Authentication Card */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-16 flex flex-col">
        {/* URL Separation Notification Banner */}
        <div className="mb-8 p-4 bg-red-50/50 border border-red-200/80 rounded-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-[#D4021D] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900">
                  Rutas y Enlaces Personalizados Activos
                </h4>
                <p className="text-xs text-zinc-600 mt-0.5">
                  El sistema cuenta con accesos independientes para clientes finales y para la gestión corporativa.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Marketplace Link Pill */}
              <div className="flex items-center gap-1.5 bg-white border border-zinc-200 px-3 py-1.5 rounded-xl text-xs shadow-2xs">
                <ShoppingBag className="w-3.5 h-3.5 text-[#D4021D]" />
                <span className="text-zinc-500">Clientes:</span>
                <span className="font-mono text-zinc-900 font-semibold">/marketplace</span>
                <button
                  onClick={() => handleCopy('marketplace')}
                  className="p-1 hover:text-zinc-950 text-zinc-400 transition-colors ml-1 cursor-pointer"
                  title="Copiar link del Marketplace"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copiedLink === 'marketplace' && (
                  <span className="text-[10px] text-emerald-600 font-bold">¡Copiado!</span>
                )}
              </div>

              {/* Corporate Link Pill */}
              <div className="flex items-center gap-1.5 bg-white border border-zinc-200 px-3 py-1.5 rounded-xl text-xs shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4021D]" />
                <span className="text-zinc-500">Admin/Negocios:</span>
                <span className="font-mono text-zinc-900 font-semibold">/</span>
                <button
                  onClick={() => handleCopy('corporate')}
                  className="p-1 hover:text-zinc-950 text-zinc-400 transition-colors ml-1 cursor-pointer"
                  title="Copiar link Corporativo"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copiedLink === 'corporate' && (
                  <span className="text-[10px] text-emerald-600 font-bold">¡Copiado!</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Branding and Business Invitation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-[#D4021D] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4021D]" />
              <span>Centro de Gestión & Alianzas</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
              Control Maestro para <span className="text-[#D4021D]">Administradores</span> y <span className="text-zinc-950">Negocios</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              Plataforma centralizada para la administración integral de tiendas y negocios, gestión de pedidos y ventas en tiempo real, supervisión de inventario y afiliación de comercios aliados y marcas oficiales a nivel global.
            </p>

            {/* Business Registration Callout Card */}
            <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D4021D] flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">¿Tienes un Negocio, Tienda o Empresa?</h3>
                  <p className="text-xs text-zinc-500">Regístrate como comercio aliado y empieza a vender tus productos o servicios hoy mismo.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-zinc-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Catálogo digital verificado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pedidos por WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Geolocalización en mapa</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Todos los rubros y servicios</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => openBusinessRegistration(false, false)}
                  className="w-full py-3.5 bg-[#D4021D] hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md shadow-red-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Store className="w-4 h-4 shrink-0" />
                  <span>Registrar Comercio o Negocio</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Unified Corporate Login Form */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
                <div>
                  <h2 className="text-xl font-bold text-zinc-950">Acceso al Sistema</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Ingresa tus credenciales de Administrador o Negocio</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#D4021D]">
                  <KeyRound className="w-5 h-5" />
                </div>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Usuario o Correo Electrónico
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Tu usuario o correo electrónico"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#D4021D] focus:ring-2 focus:ring-red-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#D4021D] focus:ring-2 focus:ring-red-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#D4021D] hover:bg-red-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <span>Verificando...</span>
                  ) : (
                    <>
                      <span>Ingresar al Panel de Control</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Guaranteed Direct Admin Access Section */}
              <div className="mt-5 pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    ⚡ Acceso Rápido Garantizado
                  </span>
                  <div className="flex-1 h-px bg-zinc-200" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDirectAdminLogin('harold')}
                    className="p-2.5 rounded-xl bg-zinc-50 hover:bg-red-50 border border-zinc-200 hover:border-red-300 text-left flex items-center gap-2.5 transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-[#D4021D] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#D4021D] group-hover:text-white transition-colors">
                      👑
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 truncate">Harold Anguiano</div>
                      <div className="text-[10px] text-zinc-500 truncate">Superadmin ConForce</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDirectAdminLogin('master')}
                    className="p-2.5 rounded-xl bg-zinc-50 hover:bg-red-50 border border-zinc-200 hover:border-red-300 text-left flex items-center gap-2.5 transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-[#D4021D] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#D4021D] group-hover:text-white transition-colors">
                      🛡️
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 truncate">Admin Master</div>
                      <div className="text-[10px] text-zinc-500 truncate">Dirección General</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Customer Link Box */}
              <div className="mt-6 pt-5 border-t border-zinc-100 text-center">
                <button
                  type="button"
                  onClick={() => navigateToRoute('marketplace')}
                  className="text-xs text-zinc-600 hover:text-[#D4021D] transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#D4021D]" />
                  <span>¿Eres cliente final? Ir a explorar el Marketplace Global</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 py-6 text-center text-xs text-zinc-500 shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} CON FORCE. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => navigateToRoute('marketplace')}
              className="text-zinc-600 hover:text-[#D4021D] transition-colors cursor-pointer"
            >
              Marketplace Clientes
            </button>
            <span className="text-zinc-300">•</span>
            <button
              onClick={() => openBusinessRegistration(false, false)}
              className="text-[#D4021D] hover:underline transition-colors cursor-pointer"
            >
              Registrar Negocio
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};


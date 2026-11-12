import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PasswordInput } from './PasswordInput';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Store,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { openWhatsAppDirect, buildProductWhatsAppOrderMessage } from '../../utils/urlUtils';

export const ClientAuthModal: React.FC = () => {
  const {
    isClientAuthModalOpen,
    setIsClientAuthModalOpen,
    setIsCorporateAuthModalOpen,
    clientAuthIntent,
    loginAsClient,
    registerClient,
    openBusinessRegistration,
    users,
    pendingProductOrder,
    setPendingProductOrder,
    userAddressLabel,
    exchangeRateUsd
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Synchronize activeTab based on clientAuthIntent and prior login history
  useEffect(() => {
    if (!isClientAuthModalOpen) return;
    if (clientAuthIntent === 'register') {
      setActiveTab('register');
    } else if (clientAuthIntent === 'login') {
      setActiveTab('login');
    } else if (clientAuthIntent === 'order_checkout') {
      const savedUser = localStorage.getItem('mk_last_client_username');
      setActiveTab(savedUser ? 'login' : 'register');
    }
  }, [clientAuthIntent, isClientAuthModalOpen]);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isClientAuthModalOpen) return null;

  // Real-time duplicate check for user convenience
  const existingUser = users.find(
    (u) =>
      (regUsername.trim() && u.username.toLowerCase() === regUsername.trim().toLowerCase()) ||
      (regEmail.trim() && u.email.toLowerCase() === regEmail.trim().toLowerCase())
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMessage('Por favor introduce tu usuario/correo y tu contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginAsClient(loginIdentifier.trim(), loginPassword);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        localStorage.setItem('mk_last_client_username', loginIdentifier.trim());
        setSuccessMessage(res.message);

        // If there was a pending product WhatsApp order, open it with authenticated user info
        if (pendingProductOrder) {
          setTimeout(() => {
            const finalCustName = res.user?.name || loginIdentifier.trim();
            const finalCustAddr = res.user?.address || userAddressLabel;
            const msg = buildProductWhatsAppOrderMessage({
              productName: pendingProductOrder.productName,
              priceBs: pendingProductOrder.priceBs,
              priceUsd: pendingProductOrder.priceUsd,
              businessName: pendingProductOrder.businessName,
              businessPhone: pendingProductOrder.businessPhone,
              quantity: pendingProductOrder.quantity,
              variantLabel: pendingProductOrder.variantLabel,
              extras: pendingProductOrder.extras,
              customerName: finalCustName,
              customerAddress: finalCustAddr
            });
            openWhatsAppDirect(pendingProductOrder.businessPhone, msg);
            setPendingProductOrder(null);
          }, 300);
        }

        setTimeout(() => {
          setIsClientAuthModalOpen(false);
        }, 700);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error al iniciar sesión.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanName = regName.trim();
    const cleanUsername = regUsername.trim().toLowerCase().replace(/\s+/g, '');
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanName || !cleanUsername || !cleanEmail || !regPassword) {
      setErrorMessage('Por favor completa Nombre, Usuario, Correo y Contraseña.');
      return;
    }

    if (regPassword.length < 5) {
      setErrorMessage('La contraseña debe tener al menos 5 caracteres.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido (ej. nombre@correo.com).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerClient({
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password: regPassword,
        phone: regPhone.trim() || '+58 412 000 0000',
        address: regAddress.trim() || 'Dirección de Entrega Predeterminada'
      });

      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        localStorage.setItem('mk_last_client_username', cleanUsername);
        setSuccessMessage(res.message);

        // If there was a pending product WhatsApp order, open it with registered user info
        if (pendingProductOrder) {
          setTimeout(() => {
            const msg = buildProductWhatsAppOrderMessage({
              productName: pendingProductOrder.productName,
              priceBs: pendingProductOrder.priceBs,
              priceUsd: pendingProductOrder.priceUsd,
              businessName: pendingProductOrder.businessName,
              businessPhone: pendingProductOrder.businessPhone,
              quantity: pendingProductOrder.quantity,
              variantLabel: pendingProductOrder.variantLabel,
              extras: pendingProductOrder.extras,
              customerName: cleanName,
              customerAddress: regAddress.trim() || userAddressLabel
            });
            openWhatsAppDirect(pendingProductOrder.businessPhone, msg);
            setPendingProductOrder(null);
          }, 300);
        }

        setTimeout(() => {
          setIsClientAuthModalOpen(false);
        }, 1200);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error al guardar credenciales en Supabase.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-white flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-black via-zinc-900 to-[#D4021D]/30 p-6 border-b border-zinc-800 relative">
          <button
            onClick={() => setIsClientAuthModalOpen(false)}
            className="absolute right-4 top-4 w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D4021D] flex items-center justify-center text-white shadow-lg shadow-red-600/30 font-black text-xl">
              CF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">
                  CON FORCE MARKETPLACE
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                Acceso para Clientes • Compras, Pedidos y Envíos
              </p>
            </div>
          </div>
        </div>

        {/* Selector Primario: Formulario Cliente vs Formulario Administrador */}
        <div className="p-3 bg-zinc-950 border-b border-zinc-800 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 bg-[#D4021D] text-white shadow-xs"
          >
            <User className="w-4 h-4" />
            <span>Formulario Cliente</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsClientAuthModalOpen(false);
              setIsCorporateAuthModalOpen(true);
            }}
            className="py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 hover:border-red-500 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Abrir Formulario de Acceso para Administrador / Negocio"
          >
            <ShieldCheck className="w-4 h-4 text-[#D4021D]" />
            <span>Formulario Admin 🛡️</span>
          </button>
        </div>

        {/* Tab switcher: Login vs Register */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-3.5 text-sm font-bold text-center transition-all cursor-pointer border-b-2 ${
              activeTab === 'login'
                ? 'border-[#D4021D] text-white bg-zinc-800/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-3.5 text-sm font-bold text-center transition-all cursor-pointer border-b-2 ${
              activeTab === 'register'
                ? 'border-[#D4021D] text-white bg-zinc-800/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Nuevo Cliente (Registrarme)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Banner especial para usuarios que quieren solicitar un producto o hacer pedido */}
          {clientAuthIntent === 'order_checkout' && (
            <div className="p-3.5 bg-gradient-to-r from-red-950/90 via-zinc-900 to-black border-2 border-red-600/80 rounded-2xl space-y-2 shadow-lg animate-fade-in">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#D4021D] flex items-center justify-center text-white shrink-0 shadow-md">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wide">
                    🛒 Completa tu Pedido o Solicitud de Producto
                  </h4>
                  <p className="text-[11px] text-zinc-300 leading-snug mt-0.5">
                    Para coordinar el despacho y datos con el negocio, por favor ingresa o regístrate:
                  </p>
                </div>
              </div>

              {/* Botones de acción rápida para elegir entre Iniciar Sesión o Registrarse */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage('');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    activeTab === 'login'
                      ? 'bg-[#D4021D] text-white border-red-500 shadow-md ring-1 ring-red-400'
                      : 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  🔑 Ya tengo cuenta (Entrar)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage('');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    activeTab === 'register'
                      ? 'bg-[#D4021D] text-white border-red-500 shadow-md ring-1 ring-red-400'
                      : 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  ✨ Nuevo (Registrarme)
                </button>
              </div>
            </div>
          )}

          {/* Banner destacado para Administradores */}
          <div className="p-3 bg-gradient-to-r from-red-950/70 via-zinc-900 to-black border border-red-800/60 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#D4021D] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">¿Buscas entrar como Administrador?</p>
                <p className="text-[10px] text-zinc-400 truncate">Superadmin Harold Anguiano o Dueño de Negocio</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsClientAuthModalOpen(false);
                setIsCorporateAuthModalOpen(true);
              }}
              className="px-3 py-1.5 bg-[#D4021D] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              Abrir Admin
            </button>
          </div>
          {errorMessage && (
            <div className="p-3 bg-red-950/70 border border-red-700/50 rounded-xl flex items-center gap-2.5 text-xs text-red-200 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-700/50 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Correo Electrónico o Nombre de Usuario
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="ej. haroldo90_cli o haroldo90@cliente.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4021D] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Contraseña
                </label>
                <PasswordInput
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Tu contraseña de cliente"
                  showGenerator={false}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#D4021D] hover:bg-red-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Verificando en Supabase...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Entrar a mi Cuenta de Cliente</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage('');
                  }}
                  className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  ¿No tienes cuenta de cliente todavía?{' '}
                  <span className="text-[#D4021D] font-bold underline underline-offset-2">
                    Crear cuenta gratis aquí
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="ej. Harold Anguiano Morales"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4021D] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nombre de Usuario *
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="ej. haroldo_cli"
                    className={`w-full px-3 py-2.5 bg-black/50 border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                      existingUser && existingUser.username.toLowerCase() === regUsername.trim().toLowerCase()
                        ? 'border-amber-500 text-amber-200'
                        : 'border-zinc-800 focus:border-[#D4021D]'
                    }`}
                  />
                  {existingUser && existingUser.username.toLowerCase() === regUsername.trim().toLowerCase() && (
                    <p className="text-[10px] text-amber-400 mt-1">
                      ⚠️ Este usuario ya existe en Supabase.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ej. correo@cliente.com"
                    className="w-full px-3 py-2.5 bg-black/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4021D] transition-colors"
                  />
                </div>
              </div>

              {/* Password with Eye and Generator */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Contraseña de Acceso *
                </label>
                <PasswordInput
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Introduce o genera una contraseña"
                  showGenerator={true}
                  required
                />
              </div>

              {/* Optional Phone & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Teléfono Móvil (Opcional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+58 412 1234567"
                      className="w-full pl-10 pr-4 py-2 bg-black/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4021D] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Dirección de Entrega (Opcional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="Caracas / Valencia / Maracay"
                      className="w-full pl-10 pr-4 py-2 bg-black/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4021D] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#D4021D] hover:bg-red-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span>Registrando en Supabase...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Guardar y Crear Cuenta en Supabase</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage('');
                  }}
                  className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  ¿Ya estás registrado en ConForce?{' '}
                  <span className="text-[#D4021D] font-bold underline underline-offset-2">
                    Inicia sesión aquí con tus credenciales
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Quick link to register a business */}
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-2 text-xs">
            <span className="text-zinc-300">
              ¿Tienes un negocio, comercio o empresa?
            </span>
            <button
              type="button"
              onClick={() => {
                setIsClientAuthModalOpen(false);
                openBusinessRegistration(false);
              }}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Registrar Negocio</span>
            </button>
          </div>

          {/* Switch to Corporate login */}
          <div className="pt-2 border-t border-zinc-800 text-center">
            <button
              type="button"
              onClick={() => {
                setIsClientAuthModalOpen(false);
                setIsCorporateAuthModalOpen(true);
              }}
              className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              ¿Eres Administrador o Vendedor de Tienda? <span className="text-[#D4021D] font-bold">Portal Corporativo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

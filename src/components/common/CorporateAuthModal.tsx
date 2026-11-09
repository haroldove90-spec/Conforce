import React, { useState } from 'react';
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
  KeyRound
} from 'lucide-react';

export const CorporateAuthModal: React.FC = () => {
  const {
    isCorporateAuthModalOpen,
    setIsCorporateAuthModalOpen,
    setIsClientAuthModalOpen,
    loginAsCorporate,
    loginDirectAsAdmin,
    loginDirectAsSeller,
    openBusinessRegistration
  } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            <div className="w-12 h-12 rounded-2xl bg-[#D4021D] flex items-center justify-center text-white shadow-xl shadow-red-600/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800/50 text-[11px] font-bold text-red-300 uppercase tracking-wider">
                Acceso Administrativo
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                Formulario de Acceso Administrador & Negocios
              </h2>
              <p className="text-xs text-zinc-400">
                Superadministrador Harold Anguiano, Dirección General y Comercios Aliados
              </p>
            </div>
          </div>
        </div>

        {/* Selector Primario: Formulario Cliente vs Formulario Administrador */}
        <div className="p-3 bg-zinc-950 border-b border-zinc-800 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setIsCorporateAuthModalOpen(false);
              setIsClientAuthModalOpen(true);
            }}
            className="py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Ir a Formulario de Acceso para Clientes"
          >
            <User className="w-4 h-4" />
            <span>Formulario Cliente</span>
          </button>
          <button
            type="button"
            className="py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 bg-[#D4021D] text-white shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Formulario Admin 🛡️</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Usuario o Correo Electrónico
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ej. haroldo90, anyl_admin o contacto@sanrafael.com"
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
              className="w-full py-3 bg-[#D4021D] hover:bg-red-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Validar Credenciales y Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Guaranteed Instant Access Section for Administrators */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                ⚡ Acceso Directo Garantizado (1-Clic)
              </span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

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
          </div>

          {/* Business Registration Banner */}
          <div className="p-4 bg-gradient-to-r from-red-950/40 via-zinc-900 to-black border border-red-900/40 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">¿Tienes un comercio o tienda?</h4>
                <p className="text-[11px] text-zinc-400">Afíliate y vende tus productos en el Marketplace</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCorporateAuthModalOpen(false);
                openBusinessRegistration(false);
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shrink-0 transition-colors shadow cursor-pointer"
            >
              Registrar Negocio
            </button>
          </div>

          {/* Switch to Client Modal */}
          <div className="pt-3 border-t border-zinc-900 text-center">
            <button
              type="button"
              onClick={() => {
                setIsCorporateAuthModalOpen(false);
                setIsClientAuthModalOpen(true);
              }}
              className="text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer font-medium"
            >
              ¿Eres un Cliente comprador? Inicia sesión o regístrate en el Portal de Clientes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

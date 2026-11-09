import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { ShoppingBag, Store, ShieldCheck, X, Lock, Check, AlertCircle } from 'lucide-react';

interface RoleAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleAccessModal: React.FC<RoleAccessModalProps> = ({ isOpen, onClose }) => {
  const {
    currentRole,
    currentUser,
    switchRole,
    setIsCorporateAuthModalOpen,
    setIsClientAuthModalOpen,
    openBusinessRegistration,
    logout
  } = useApp();

  const [restrictionError, setRestrictionError] = useState<string | null>(null);

  if (!isOpen) return null;

  const rolesConfig: { id: Role; name: string; icon: React.ReactNode; logo: string; desc: string }[] = [
    {
      id: 'client',
      name: 'Cliente (Marketplace)',
      icon: <ShoppingBag className="w-6 h-6 text-[#D4021D]" />,
      logo: '🛒',
      desc: 'Explorar negocios, productos y realizar pedidos'
    },
    {
      id: 'seller',
      name: 'Negocio / Vendedor',
      icon: <Store className="w-6 h-6 text-zinc-200" />,
      logo: '🏪',
      desc: 'Gestionar pedidos de la tienda, catálogo y horarios'
    },
    {
      id: 'admin',
      name: 'Superadministrador',
      icon: <ShieldCheck className="w-6 h-6 text-[#D4021D]" />,
      logo: '⚡',
      desc: 'Control total de usuarios, clientes, empleados y finanzas'
    }
  ];

  const handleSelectRole = (targetRole: Role) => {
    setRestrictionError(null);
    const res = switchRole(targetRole);
    if (!res.allowed) {
      setRestrictionError(res.message || 'Acceso restringido para este rol.');
      if (!currentUser) {
        setTimeout(() => {
          onClose();
          setIsCorporateAuthModalOpen(true);
        }, 1200);
      }
    } else {
      onClose();
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isSeller = currentUser?.role === 'seller';
  const isClient = currentUser?.role === 'client';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-white shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-800/40 text-[10px] font-bold text-red-300 uppercase">
              Control de Acceso RBAC
            </div>
            <h3 className="font-extrabold text-lg text-white mt-1">Conmutador de Roles</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current status info */}
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="text-zinc-400 block text-[11px]">Usuario Conectado:</span>
            <span className="font-bold text-white">
              {currentUser ? `${currentUser.name} (@${currentUser.username})` : 'Invitado sin sesión activa'}
            </span>
          </div>
          <div>
            {isAdmin && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                <Check className="w-3 h-3" /> Acceso Ilimitado (Admin)
              </span>
            )}
            {isSeller && (
              <span className="px-2.5 py-1 rounded-full bg-amber-950 border border-amber-700 text-amber-300 font-bold text-[10px] flex items-center gap-1">
                <Lock className="w-3 h-3" /> Restringido a Negocio
              </span>
            )}
            {isClient && (
              <span className="px-2.5 py-1 rounded-full bg-blue-950 border border-blue-700 text-blue-300 font-bold text-[10px] flex items-center gap-1">
                <Lock className="w-3 h-3" /> Restringido a Cliente
              </span>
            )}
            {!currentUser && (
              <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[10px]">
                Nivel Público
              </span>
            )}
          </div>
        </div>

        {restrictionError && (
          <div className="p-3 bg-red-950/80 border border-red-700/60 rounded-xl flex items-center gap-2 text-xs text-red-200 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{restrictionError}</span>
          </div>
        )}

        {/* Roles list */}
        <div className="space-y-2.5 pt-1">
          {rolesConfig.map((item) => {
            const isSelected = currentRole === item.id;
            const isAllowed =
              isAdmin ||
              (isSeller && item.id === 'seller') ||
              (isClient && item.id === 'client') ||
              (!currentUser && item.id === 'client');

            return (
              <button
                key={item.id}
                onClick={() => handleSelectRole(item.id)}
                className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3.5 cursor-pointer relative ${
                  isSelected
                    ? 'border-[#D4021D] bg-red-950/20 shadow-lg shadow-red-950/40 ring-1 ring-[#D4021D]'
                    : isAllowed
                    ? 'border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800/80 hover:border-zinc-700'
                    : 'border-zinc-800/40 bg-zinc-900/30 opacity-70 hover:opacity-100 hover:border-red-900/50'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl shrink-0 border border-zinc-700/60">
                  {item.logo}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">
                      {item.name}
                    </span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-[#D4021D] text-white text-[9px] font-bold">
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{item.desc}</p>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-[#D4021D] text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  ) : !isAllowed ? (
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Bloqueado</span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400 font-bold hover:text-white">Cambiar</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footnote */}
        <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
          <button
            onClick={() => {
              onClose();
              openBusinessRegistration(currentUser?.role === 'client');
            }}
            className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
          >
            + Registrar Nuevo Negocio
          </button>
          <div className="flex items-center gap-3">
            {currentUser && (
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
              >
                Cerrar Sesión
              </button>
            )}
            {!currentUser && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    setIsCorporateAuthModalOpen(true);
                  }}
                  className="text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
                >
                  Acceso Admin/Negocio
                </button>
                <button
                  onClick={() => {
                    onClose();
                    setIsClientAuthModalOpen(true);
                  }}
                  className="text-zinc-300 hover:text-white font-medium transition-colors cursor-pointer"
                >
                  Portal Clientes
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

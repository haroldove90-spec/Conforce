import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientProfile } from '../../types';
import {
  ShoppingBag,
  UserPlus,
  Search,
  MapPin,
  Phone,
  Mail,
  Share2,
  Check,
  Trash2
} from 'lucide-react';

export const AdminClientsView: React.FC = () => {
  const {
    clients,
    registerClientByAdmin,
    toggleSuspendClient,
    deleteClient,
    getMarketplaceShareUrl
  } = useApp();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('ClienteConForce#2026');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyLink = () => {
    const url = getMarketplaceShareUrl ? getMarketplaceShareUrl() : `${window.location.origin}/marketplace`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const filteredClients = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  const totalClientOrders = clients.reduce((acc, c) => acc + c.totalOrders, 0);
  const totalClientSpent = clients.reduce((acc, c) => acc + c.totalSpent, 0);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !username.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setFormError('Todos los campos con asterisco (*) son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    const res = await registerClientByAdmin({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      password: password.trim() || 'ClienteConForce#2026'
    });
    setIsSubmitting(false);

    if (!res.success) {
      setFormError(res.message);
      return;
    }

    setName('');
    setUsername('');
    setEmail('');
    setPhone('');
    setAddress('');
    setPassword('ClienteConForce#2026');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Share Link */}
      <div className="bg-gradient-to-r from-black via-zinc-900 to-red-950 border border-zinc-800 p-5 rounded-3xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#D4021D] flex items-center justify-center text-white shadow-lg shadow-red-950">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-[10px] font-bold text-red-300 uppercase">
              Portal Clientes /marketplace
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              Directorio de Clientes Registrados ({clients.length})
            </h2>
            <p className="text-xs text-zinc-400">
              Link independiente para compartir con clientes para compra y autorregistro directo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              copiedLink
                ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white'
            }`}
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-[#D4021D]" />}
            <span>{copiedLink ? '¡Link Copiado!' : 'Copiar Link /marketplace'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D4021D] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-950 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Cliente</span>
          </button>
        </div>
      </div>

      {/* KPI mini cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Clientes</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{clients.length}</p>
          <span className="text-[10px] text-slate-400">100% Cuentas verificadas</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Pedidos de Clientes</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{totalClientOrders}</p>
          <span className="text-[10px] text-slate-400">Acumulado en Marketplace</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Facturación Clientes</span>
          <p className="text-2xl font-black text-[#D4021D] mt-1">Bs. {totalClientSpent.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Gasto total registrado</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente por nombre, usuario, correo, teléfono o dirección..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D4021D]"
        />
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-slate-200 hover:border-red-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#D4021D] border border-red-200 font-black text-sm flex items-center justify-center">
                    {(c.name || c.username || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{c.name || c.username || 'Cliente'}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">@{c.username || 'cliente'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleSuspendClient(c.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      c.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {c.status === 'active' ? 'Activo' : 'Suspendido'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar cliente ${c.name}?`)) {
                        deleteClient(c.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 text-xs text-slate-600 border-t border-slate-100 mt-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{c.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{c.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#D4021D] shrink-0 mt-0.5" />
                  <span className="line-clamp-2 text-[11px] text-slate-500">{c.address}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 -mx-5 -mb-5 px-5 py-3 rounded-b-3xl">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Pedidos</span>
                <span className="font-bold text-slate-900">{c.totalOrders} compras</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Gasto Total</span>
                <span className="font-bold text-[#D4021D]">Bs. {c.totalSpent.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#D4021D]" />
                Registrar Ficha de Cliente
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/80 border border-red-700 text-xs text-red-200 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Roberto Sánchez"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ej. roberto_s"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Teléfono Móvil *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+58 412..."
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="roberto@ejemplo.com"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Dirección de Entrega Principal *
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, colonia, referencias..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Contraseña de Acceso para el Cliente *
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ClienteConForce#2026"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-amber-300 focus:border-[#D4021D] focus:outline-none"
                />
                <span className="text-[10px] text-zinc-400">
                  Esta clave permitirá al cliente iniciar sesión en el formulario de clientes.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#D4021D] hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando en Supabase...' : 'Crear y Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

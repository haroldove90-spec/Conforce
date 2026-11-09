import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAccount, Role } from '../../types';
import { PasswordInput } from '../common/PasswordInput';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Store,
  ShoppingBag,
  Sparkles,
  Lock,
  UserCheck,
  Edit3,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Database
} from 'lucide-react';

export const AdminUsersView: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    toggleSuspendUser,
    deleteUser,
    syncAllUsersToSupabase,
    businesses
  } = useApp();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('seller');
  const [businessId, setBusinessId] = useState<string>(businesses[0]?.id || '');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');

  // Edit user state
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<Role>('seller');
  const [editBusinessId, setEditBusinessId] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState('');

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncAllUsersToSupabase();
      setSyncFeedback(res.message);
      setTimeout(() => setSyncFeedback(null), 6000);
    } catch (e: any) {
      setSyncFeedback('Error sincronizando: ' + (e.message || String(e)));
      setTimeout(() => setSyncFeedback(null), 6000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setFormError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      setFormError('Ese nombre de usuario ya está registrado.');
      return;
    }

    setIsCreating(true);
    const res = await addUser({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
      role,
      status: 'active',
      businessId: role === 'seller' ? businessId : undefined,
      phone: phone.trim() || undefined
    });
    setIsCreating(false);

    if (res && !res.success && res.error) {
      // Si hubo error en Supabase, podemos informar o cerrar si se guardó localmente
      console.warn('Supabase create user error:', res.error);
    }

    // Reset and close
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setPhone('');
    setShowAddModal(false);
  };

  const handleStartEdit = (u: UserAccount) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditUsername(u.username);
    setEditEmail(u.email);
    setEditPassword(u.password || '');
    setEditRole(u.role);
    setEditBusinessId(u.businessId || businesses[0]?.id || '');
    setEditPhone(u.phone || '');
    setEditError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');

    if (!editName.trim() || !editUsername.trim() || !editEmail.trim()) {
      setEditError('Por favor completa todos los campos requeridos.');
      return;
    }

    updateUser(editingUser.id, {
      name: editName.trim(),
      username: editUsername.trim().toLowerCase(),
      email: editEmail.trim().toLowerCase(),
      password: editPassword.trim() || undefined,
      role: editRole,
      businessId: editRole === 'seller' ? editBusinessId : undefined,
      phone: editPhone.trim() || undefined
    });

    setEditingUser(null);
  };

  const getRoleBadge = (r: Role) => {
    switch (r) {
      case 'admin':
        return (
          <span className="px-2.5 py-1 bg-red-950/80 border border-red-800 text-red-300 rounded-lg text-xs font-bold flex items-center gap-1.5 inline-flex">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4021D]" /> Superadmin
          </span>
        );
      case 'seller':
        return (
          <span className="px-2.5 py-1 bg-amber-950/60 border border-amber-800/80 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 inline-flex">
            <Store className="w-3.5 h-3.5 text-amber-400" /> Negocio / Seller
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-blue-950/60 border border-blue-800/80 text-blue-300 rounded-lg text-xs font-bold flex items-center gap-1.5 inline-flex">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-400" /> Cliente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 p-4 rounded-3xl text-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#D4021D] flex items-center justify-center text-white shadow-lg shadow-red-950">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              Gestión de Usuarios y Accesos
            </h2>
            <p className="text-xs text-zinc-400">
              Control centralizado de credenciales RBAC para Administradores, Negocios y Clientes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            title="Sincronizar todos los usuarios con Supabase"
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar a Supabase'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D4021D] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-950 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700/80 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-200 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, usuario o email..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D4021D]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['all', 'admin', 'seller', 'client'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                roleFilter === r
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {r === 'all' && 'Todos'}
              {r === 'admin' && 'Superadmins'}
              {r === 'seller' && 'Sellers'}
              {r === 'client' && 'Clientes'}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Usuario / Nombre</th>
                <th className="py-3 px-4">Rol en Sistema</th>
                <th className="py-3 px-4">Correo / Contacto</th>
                <th className="py-3 px-4">Negocio Asociado</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const biz = businesses.find((b) => b.id === u.businessId);
                const isSuperadminPreset = u.username === 'haroldo90' || u.username === 'anyl_admin' || u.username === 'anyel_admin';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                          {(u.name || u.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {u.name || u.username || 'Usuario'}
                            {isSuperadminPreset && (
                              <span className="text-[10px] text-red-600 font-black">★</span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">@{u.username || 'usuario'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {getRoleBadge(u.role)}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{u.email}</p>
                      {u.phone && <p className="text-[11px] text-slate-500">{u.phone}</p>}
                    </td>

                    <td className="py-3 px-4">
                      {biz ? (
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <span>{biz.logo}</span> {biz.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No aplica</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleSuspendUser(u.id)}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {u.status === 'active' ? 'Activo' : 'Suspendido'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStartEdit(u)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar datos y contraseña"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!isSuperadminPreset ? (
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar usuario @${u.username}?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold px-1">Fijo</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#D4021D]" />
                Registrar Nuevo Usuario
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

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Mariana Torres"
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
                    placeholder="ej. mariana_seller"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Contraseña *
                  </label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    showGenerator={true}
                    required
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
                  placeholder="mariana@ejemplo.com"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Rol en Sistema
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none cursor-pointer"
                  >
                    <option value="admin">Superadmin</option>
                    <option value="seller">Negocio / Seller</option>
                    <option value="client">Cliente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+52 55..."
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                  />
                </div>
              </div>

              {role === 'seller' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Asignar al Negocio
                  </label>
                  <select
                    value={businessId}
                    onChange={(e) => setBusinessId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none cursor-pointer"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.logo} {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  disabled={isCreating}
                  className="px-4 py-2 bg-[#D4021D] hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    'Guardar Usuario'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario & Contraseña */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {(editingUser.name || editingUser.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">
                    Editar Usuario: {editingUser.name || editingUser.username}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">@{editingUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5">
              {editError && (
                <div className="p-2.5 bg-red-950/70 border border-red-800 text-red-300 rounded-xl text-xs">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+52 55..."
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
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none"
                  required
                />
              </div>

              {/* Password update section */}
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Contraseña</span>
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    Deja vacío o modifica para cambiar
                  </span>
                </div>

                <PasswordInput
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Escribe o genera nueva contraseña"
                  showGenerator={true}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Rol de Usuario
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none cursor-pointer"
                >
                  <option value="admin">Superadmin</option>
                  <option value="seller">Negocio / Seller</option>
                  <option value="client">Cliente</option>
                </select>
              </div>

              {editRole === 'seller' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Negocio Asignado
                  </label>
                  <select
                    value={editBusinessId}
                    onChange={(e) => setEditBusinessId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-[#D4021D] focus:outline-none cursor-pointer"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.logo} {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4021D] hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

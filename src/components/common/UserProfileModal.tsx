import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Key,
  Check,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Save,
  CheckCircle2,
  LogOut
} from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    updateUser,
    logout,
    isProfileModalOpen,
    setIsProfileModalOpen,
    setIsCorporateAuthModalOpen,
    setIsClientAuthModalOpen
  } = useApp();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Password fields
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPasswordConfirm, setCurrentPasswordConfirm] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Status & notifications
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize fields whenever modal opens or currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPasswordConfirm('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [currentUser, isProfileModalOpen]);

  if (!isProfileModalOpen) return null;

  // Generate random secure password helper
  const handleGenerateSecurePassword = () => {
    const specials = ['#', '!', '*', '$', '@', '%'];
    const randomSpecial = specials[Math.floor(Math.random() * specials.length)];
    const cleanUser = (username || name || 'User').replace(/[^a-zA-Z]/g, '');
    const capitalized = cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const generated = `${capitalized}#${randomDigits}${randomSpecial}`;
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setSuccessMsg('Contraseña generada automáticamente. Guarda los cambios para aplicarla.');
  };

  const handleCopyPassword = () => {
    if (!newPassword && currentUser?.password) {
      navigator.clipboard.writeText(currentUser.password);
    } else if (newPassword) {
      navigator.clipboard.writeText(newPassword);
    }
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentUser) return;

    if (!name.trim()) {
      setErrorMsg('El nombre completo no puede estar vacío.');
      return;
    }

    if (!username.trim()) {
      setErrorMsg('El nombre de usuario no puede estar vacío.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico válido.');
      return;
    }

    // Password validation if requested
    if (isChangingPassword) {
      if (!newPassword.trim()) {
        setErrorMsg('Ingresa la nueva contraseña o desmarca la opción de cambiar contraseña.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Las nuevas contraseñas no coinciden.');
        return;
      }
    }

    setIsSaving(true);

    try {
      const updates: any = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim()
      };

      if (isChangingPassword && newPassword.trim()) {
        updates.password = newPassword.trim();
      }

      await updateUser(currentUser.id, updates);

      setIsSaving(false);
      setSuccessMsg('¡Tus datos personales y credenciales fueron actualizados con éxito!');

      if (isChangingPassword) {
        setIsChangingPassword(false);
        setNewPassword('');
        setConfirmPassword('');
      }

      setTimeout(() => {
        setSuccessMsg('');
      }, 3500);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMsg('Ocurrió un error al guardar los cambios: ' + (err?.message || err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-white">
        
        {/* Header */}
        <div className="relative p-5 sm:p-6 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950">
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-all cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#D4021D] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-[#D4021D]/25">
              {currentUser ? (currentUser.name || currentUser.username || 'U').charAt(0).toUpperCase() : '👤'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Mi Perfil y Seguridad
                </h2>
                {currentUser && (
                  <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider border border-zinc-700">
                    {currentUser.role}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {currentUser
                  ? `Gestiona tus datos personales y contraseña de acceso`
                  : 'Inicia sesión para editar tu perfil'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {!currentUser ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-400 border border-zinc-800">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No has iniciado sesión</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                Para ver y cambiar tus datos o contraseña, inicia sesión con tu usuario y contraseña.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsCorporateAuthModalOpen(true);
                }}
                className="px-4 py-2.5 bg-[#D4021D] hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
              >
                Acceso Administrador / Negocio
              </button>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsClientAuthModalOpen(true);
                }}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-all cursor-pointer border border-zinc-700"
              >
                Acceso Cliente
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Feedback notifications */}
            {errorMsg && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-start gap-2.5 text-xs text-red-200 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-200 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* SECCIÓN 1: DATOS PERSONALES */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-zinc-800/80">
                <User className="w-3.5 h-3.5 text-[#D4021D]" />
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Datos Personales
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nombre */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4021D] focus:ring-1 focus:ring-[#D4021D]"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4021D] focus:ring-1 focus:ring-[#D4021D]"
                    placeholder="ej. anyl_admin"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4021D] focus:ring-1 focus:ring-[#D4021D]"
                      placeholder="correo@ejemplo.com"
                      required
                    />
                    <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4021D] focus:ring-1 focus:ring-[#D4021D]"
                      placeholder="+52 55 1234 5678"
                    />
                    <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Dirección
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4021D] focus:ring-1 focus:ring-[#D4021D]"
                    placeholder="Calle, número, colonia, código postal"
                  />
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: SEGURIDAD Y CONTRASEÑA */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#D4021D]" />
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Seguridad & Contraseña
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="text-[11px] font-bold text-[#D4021D] hover:underline cursor-pointer"
                >
                  {isChangingPassword ? 'Cancelar cambio' : 'Cambiar Contraseña'}
                </button>
              </div>

              {/* Vista de contraseña actual y opción de copiarla */}
              {currentUser.password && !isChangingPassword && (
                <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Key className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-[11px] text-zinc-400 font-medium">Contraseña actual registrada:</p>
                      <p className="font-mono text-xs font-bold text-zinc-200">
                        {showPassword ? currentUser.password : '••••••••••••••••'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-all cursor-pointer"
                      title={showPassword ? 'Ocultar' : 'Mostrar'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-1.5 text-zinc-400 hover:text-emerald-400 rounded-lg hover:bg-zinc-800 transition-all cursor-pointer"
                      title="Copiar contraseña"
                    >
                      {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Formulario de cambio de contraseña */}
              {isChangingPassword && (
                <div className="p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-300">
                      Crear nueva contraseña segura
                    </span>
                    <button
                      type="button"
                      onClick={handleGenerateSecurePassword}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 hover:text-amber-200 text-[10px] font-bold transition-all cursor-pointer border border-zinc-700"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generar segura</span>
                    </button>
                  </div>

                  {/* Nueva Contraseña */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-3 pr-16 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4021D] font-mono"
                        placeholder="Mínimo 6 caracteres con símbolos"
                      />
                      <div className="absolute right-2 top-2 flex items-center gap-1 text-zinc-400">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 hover:text-white rounded cursor-pointer"
                          title={showPassword ? 'Ocultar' : 'Mostrar'}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        {newPassword && (
                          <button
                            type="button"
                            onClick={handleCopyPassword}
                            className="p-1 hover:text-emerald-400 rounded cursor-pointer"
                            title="Copiar contraseña"
                          >
                            {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Confirmar Contraseña */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4021D] font-mono"
                      placeholder="Repite la nueva contraseña"
                    />
                  </div>

                  {newPassword && (
                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className="text-zinc-400">Fortaleza:</span>
                      <span className={`font-bold ${
                        newPassword.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
                          ? 'text-emerald-400'
                          : newPassword.length >= 6
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}>
                        {newPassword.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
                          ? 'Excelente (Alta)'
                          : newPassword.length >= 6
                          ? 'Aceptable (Media)'
                          : 'Corta (Baja)'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  logout();
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Cerrar sesión actual"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-[#D4021D] hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#D4021D]/20"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Building2,
  X,
  Store,
  MapPin,
  Phone,
  FileText,
  User,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Award,
  Crown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PasswordInput } from './PasswordInput';

export const RegisterBusinessModal: React.FC = () => {
  const {
    isRegisterBusinessModalOpen,
    setIsRegisterBusinessModalOpen,
    isRegisteringAsSponsor,
    setIsRegisteringAsSponsor,
    registerBusiness,
    upgradeClientToBusiness,
    currentUser
  } = useApp();

  const isClientLoggedIn = Boolean(currentUser && currentUser.role === 'client');

  // Business Form State
  const [isSponsor, setIsSponsor] = useState(isRegisteringAsSponsor);
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Repuestos Nuevos Chevrolet / Ford / Toyota');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [rifOrNit, setRifOrNit] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🏢');

  // Owner Form State (if not logged in as client)
  const [ownerName, setOwnerName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI State
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync isSponsor with isRegisteringAsSponsor when opened
  useEffect(() => {
    if (isRegisterBusinessModalOpen) {
      setIsSponsor(isRegisteringAsSponsor);
      if (isRegisteringAsSponsor) {
        setSelectedEmoji('⭐');
        setCategory('Marca Oficial / Patrocinador Corporativo');
      } else {
        setSelectedEmoji('🏢');
        setCategory('Comercio General, Variedades & Regalos');
      }
    }
  }, [isRegisterBusinessModalOpen, isRegisteringAsSponsor]);

  if (!isRegisterBusinessModalOpen) return null;

  const handleClose = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsRegisterBusinessModalOpen(false);
    setIsRegisteringAsSponsor(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!businessName.trim()) {
      setErrorMsg('Por favor ingresa el nombre comercial de tu negocio o marca.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Por favor especifica la dirección o sede de la empresa.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Por favor ingresa el teléfono o WhatsApp de contacto.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isClientLoggedIn) {
        // Upgrade existing client
        const res = await upgradeClientToBusiness({
          businessName,
          category,
          address,
          phone,
          rifOrNit,
          description,
          logo: selectedEmoji,
          isSponsor
        });

        setIsSubmitting(false);
        if (res.success) {
          setSuccessMsg(res.message);
          setTimeout(() => {
            handleClose();
          }, 2000);
        } else {
          setErrorMsg(res.message);
        }
      } else {
        // New business + new seller account
        if (!ownerName.trim()) {
          setIsSubmitting(false);
          setErrorMsg('Por favor ingresa el nombre del encargado o representante legal.');
          return;
        }
        if (!username.trim()) {
          setIsSubmitting(false);
          setErrorMsg('Por favor define un nombre de usuario para el inicio de sesión.');
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setIsSubmitting(false);
          setErrorMsg('Por favor ingresa un correo electrónico válido.');
          return;
        }
        if (!password || password.length < 6) {
          setIsSubmitting(false);
          setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
          return;
        }

        const res = await registerBusiness({
          businessName,
          category,
          address,
          phone,
          rifOrNit,
          description,
          logo: selectedEmoji,
          ownerName,
          username,
          email,
          password,
          ownerPhone: phone,
          isSponsor
        });

        setIsSubmitting(false);
        if (res.success) {
          setSuccessMsg(res.message);
          setTimeout(() => {
            handleClose();
          }, 2000);
        } else {
          setErrorMsg(res.message);
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Error inesperado durante el registro.');
    }
  };

  const EMOJI_OPTIONS = isSponsor
    ? ['⭐', '🏆', '🏎️', '🚗', '⚡', '🛡️', '👑', '⚙️', '🏁']
    : ['🏢', '🚗', '🔧', '⚙️', '🛞', '🔋', '🛡️', '📦', '🏁'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
            isSponsor 
              ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm'
              : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {isSponsor ? <Crown className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isSponsor
                ? 'Registro de Marca / Patrocinador Oficial'
                : isClientLoggedIn
                  ? 'Dar de Alta Mi Negocio en el Marketplace'
                  : 'Registro de Nuevo Negocio / Comercio Aliado'}
            </h3>
            <p className="text-sm text-gray-500">
              {isSponsor
                ? 'Destaca tu marca automotriz en las primeras posiciones y maximiza tu visibilidad nacional.'
                : 'Vende tus repuestos, servicios o accesorios a miles de clientes en Venezuela.'}
            </p>
          </div>
        </div>

        {/* Sponsor / Standard Switcher Tab */}
        <div className="mb-6 p-1 bg-gray-100 rounded-xl flex items-center gap-1 border border-gray-200">
          <button
            type="button"
            onClick={() => {
              setIsSponsor(false);
              setSelectedEmoji('🏢');
              setCategory('Repuestos Nuevos Chevrolet / Ford / Toyota');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              !isSponsor
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200/80'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-red-600" />
            <span>Comercio Aliado / Taller</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSponsor(true);
              setSelectedEmoji('⭐');
              setCategory('Marca Oficial / Patrocinador');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isSponsor
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Crown className="w-4 h-4 text-white" />
            <span>Patrocinador Oficial ⭐</span>
          </button>
        </div>

        {/* Existing Client Alert Banner */}
        {isClientLoggedIn && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                ¡Sesión iniciada como @{currentUser.username}!
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Tu cuenta de usuario se actualizará automáticamente a Comercio Vendedor / Patrocinador para que puedas gestionar tus productos y pedidos sin crear una cuenta nueva.
              </p>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION: Business Info */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
              <Store className={`w-4 h-4 ${isSponsor ? 'text-amber-500' : 'text-red-600'}`} />
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                1. Datos Comerciales {isSponsor ? 'de la Marca Patrocinadora' : 'del Negocio'}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  {isSponsor ? 'Nombre de la Marca o Empresa Patrocinadora *' : 'Nombre Comercial del Negocio, Tienda o Empresa *'}
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={isSponsor ? 'Ej. Samsung / Polar / Nestlé / Motul / Bosch' : 'Ej. Supermercado Central / Farmacia La Fuente / Tienda Tech / Moda Caracas'}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Categoría o Rubro *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  {isSponsor ? (
                    <>
                      <option value="Marca Oficial / Patrocinador Corporativo">Marca Oficial / Patrocinador Corporativo</option>
                      <option value="Alimentos y Bebidas">Alimentos y Bebidas</option>
                      <option value="Salud y Cuidado Personal">Salud y Cuidado Personal</option>
                      <option value="Tecnología y Telecomunicaciones">Tecnología y Telecomunicaciones</option>
                      <option value="Moda y Calzado">Moda y Calzado</option>
                      <option value="Automotriz y Lubricantes">Automotriz y Lubricantes</option>
                      <option value="Hogar y Construcción">Hogar y Construcción</option>
                      <option value="Servicios Empresariales & Seguros">Servicios Empresariales & Seguros</option>
                    </>
                  ) : (
                    <>
                      <option value="Supermercados, Bodegones & Víveres">Supermercados, Bodegones & Víveres</option>
                      <option value="Farmacias, Salud & Cuidado Personal">Farmacias, Salud & Cuidado Personal</option>
                      <option value="Restaurantes, Comida & Gastronomía">Restaurantes, Comida & Gastronomía</option>
                      <option value="Tecnología, Computación & Celulares">Tecnología, Computación & Celulares</option>
                      <option value="Ropa, Calzado & Moda">Ropa, Calzado & Moda</option>
                      <option value="Hogar, Muebles & Ferretería">Hogar, Muebles & Ferretería</option>
                      <option value="Belleza, Estética & Barbería">Belleza, Estética & Barbería</option>
                      <option value="Repuestos, Talleres & Automotriz">Repuestos, Talleres & Automotriz</option>
                      <option value="Servicios Profesionales & Técnicos">Servicios Profesionales & Técnicos</option>
                      <option value="Comercio General, Variedades & Regalos">Comercio General, Variedades & Regalos</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Teléfono / WhatsApp de Contacto *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+58 412 1234567 o +58 424 9998888"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  {isSponsor ? 'Dirección Sede o Representación Comercial *' : 'Dirección Física de la Tienda o Taller *'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej. Av. Francisco de Miranda, Local 4-A, Chacao, Caracas"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  RIF / Identificador Fiscal (Opcional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={rifOrNit}
                    onChange={(e) => setRifOrNit(e.target.value)}
                    placeholder="J-12345678-9"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Insignia / Emoji Representativo
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-xl p-1.5 rounded-lg border transition-all ${
                        selectedEmoji === emoji
                          ? isSponsor
                            ? 'border-amber-500 bg-amber-50 scale-110 shadow-sm'
                            : 'border-red-500 bg-red-50 scale-110 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Descripción o Eslogan Comercial
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isSponsor ? 'Marca líder en soluciones automotrices, patrocinador oficial en Venezuela...' : 'Breve reseña de los repuestos que distribuyes, años de experiencia o servicios de taller...'}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION: Owner Credentials (Only if not already logged in as client) */}
          {!isClientLoggedIn && (
            <div>
              <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
                <User className={`w-4 h-4 ${isSponsor ? 'text-amber-500' : 'text-red-600'}`} />
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                  2. Datos del {isSponsor ? 'Representante de Marca' : 'Propietario / Encargado'} (Para Iniciar Sesión)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Nombre Completo del Responsable *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Ej. Carlos Mendoza"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Nombre de Usuario (@usuario) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">@</span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder={isSponsor ? 'marca_oficial' : 'carlos_repuestos'}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ventas@minegocio.com"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Contraseña de Acceso al Portal *
                  </label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    showGenerator={true}
                    required
                    inputClassName="!bg-white !text-gray-900 !border-gray-300 focus:!border-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 ${
                isSponsor ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <span>
                {isSubmitting
                  ? 'Guardando en Supabase...'
                  : isSponsor
                    ? 'Registrar Patrocinador Oficial'
                    : isClientLoggedIn
                      ? 'Vincular y Activar Mi Negocio'
                      : 'Registrar Negocio en Marketplace'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


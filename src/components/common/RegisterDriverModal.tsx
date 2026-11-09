import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bike, CheckCircle2, AlertCircle, ShieldCheck, CreditCard, User, Phone, FileText, MapPin } from 'lucide-react';
import { PasswordInput } from './PasswordInput';

export const RegisterDriverModal: React.FC = () => {
  const {
    isRegisterDriverModalOpen,
    setIsRegisterDriverModalOpen,
    registerDriver,
    switchRole
  } = useApp();

  const [fullName, setFullName] = useState('');
  const [ciDni, setCiDni] = useState('');
  const [phone, setPhone] = useState('+58 ');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Caracas');
  const [motorcycleBrandModel, setMotorcycleBrandModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  
  // Pago Móvil info for payouts
  const [bankName, setBankName] = useState('Banesco (0134)');
  const [bankPhone, setBankPhone] = useState('');
  const [bankIdNumber, setBankIdNumber] = useState('');

  const [acceptTerms, setAcceptTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<string | null>(null);

  if (!isRegisterDriverModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !ciDni.trim() || !phone.trim() || !username.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos obligatorios marcados con *');
      return;
    }

    if (!motorcycleBrandModel.trim() || !plateNumber.trim()) {
      setErrorMsg('Por favor especifica la marca/modelo de la moto y el número de placa.');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('Debes aceptar las condiciones del servicio de mensajería en moto.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerDriver({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim() || `${username.trim().toLowerCase()}@conforce.moto`,
        password: password.trim(),
        phone: phone.trim(),
        ciDni: ciDni.trim(),
        motorcycleBrandModel: motorcycleBrandModel.trim(),
        plateNumber: plateNumber.trim(),
        driverLicense: driverLicense.trim() || undefined,
        bankName,
        bankPhone: bankPhone.trim() || phone.trim(),
        bankIdNumber: bankIdNumber.trim() || ciDni.trim(),
        city: city.trim()
      });

      if (res.success) {
        setSuccessResult(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado al registrar el mensajero.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsRegisterDriverModalOpen(false);
    setSuccessResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                Flota Motorizada ConForce
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                Registro de Mensajero en Moto
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {successResult ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">¡Solicitud de Registro Enviada!</h3>
            <p className="text-sm text-zinc-300 max-w-md mx-auto">
              {successResult}
            </p>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-zinc-400 text-left space-y-1">
              <p><strong className="text-white">Usuario de acceso:</strong> @{username}</p>
              <p><strong className="text-white">Moto registrada:</strong> {motorcycleBrandModel} (Placa: {plateNumber})</p>
              <p><strong className="text-white">Pago Móvil asignado:</strong> {bankName} · {bankPhone || phone}</p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  switchRole('driver');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Ingresar al Panel de Mensajero
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-red-950/80 border border-red-700/60 rounded-xl flex items-center gap-2 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Datos Personales & Cuenta */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Datos del Conductor & Acceso</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Cédula de Identidad (C.I.) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. V-24.891.302"
                    value={ciDni}
                    onChange={(e) => setCiDni(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Teléfono Móvil (WhatsApp) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+58 412 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Ciudad / Zona de Cobertura *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Caracas, Libertador / Chacao"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Nombre de Usuario (Para iniciar sesión) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. carlos_moto"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Contraseña *
                  </label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Crea tu contraseña segura"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Datos de la Motocicleta */}
            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <Bike className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Datos del Vehículo (Motocicleta)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Marca, Modelo y Color *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Bera SBR 150 (Azul), Keeway Horse 150 (Rojo)"
                    value={motorcycleBrandModel}
                    onChange={(e) => setMotorcycleBrandModel(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Placa de la Moto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. AA1B22"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Número de Licencia de Conducir (2da o 3ra)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. LIC-24891302"
                    value={driverLicense}
                    onChange={(e) => setDriverLicense(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Datos de Pago Móvil para Cobro de Carreras */}
            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Datos para Pago Móvil (Liquidación de Ganancias en Bs.)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Banco Receptor
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Banesco (0134)">Banesco (0134)</option>
                    <option value="Banco de Venezuela (0102)">Banco de Venezuela (0102)</option>
                    <option value="Mercantil (0105)">Mercantil (0105)</option>
                    <option value="BBVA Provincial (0108)">BBVA Provincial (0108)</option>
                    <option value="BNC (0191)">BNC (0191)</option>
                    <option value="Bancaribe (0114)">Bancaribe (0114)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Teléfono Pago Móvil
                  </label>
                  <input
                    type="text"
                    placeholder="0412 1234567"
                    value={bankPhone}
                    onChange={(e) => setBankPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Cédula Titular
                  </label>
                  <input
                    type="text"
                    placeholder="V-24891302"
                    value={bankIdNumber}
                    onChange={(e) => setBankIdNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2 text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px] leading-relaxed text-zinc-400">
                  Declaro que poseo casco reglamentario, motocicleta en condiciones óptimas de circulación, documentación vigente y acepto las tarifas de despacho de ConForce.
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold cursor-pointer transition-colors shadow-lg shadow-emerald-950/40"
              >
                {loading ? 'Registrando...' : 'Completar Registro de Motorizado'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

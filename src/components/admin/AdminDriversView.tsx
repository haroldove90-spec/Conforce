import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DriverProfile, DriverStatus } from '../../types';
import {
  Bike,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Search,
  Plus,
  Ban,
  Check,
  Camera,
  Eye,
  X,
  FileCheck2,
  Phone,
  CreditCard,
  MapPin,
  ZoomIn
} from 'lucide-react';

export const AdminDriversView: React.FC = () => {
  const {
    drivers,
    updateDriverStatus,
    openDriverRegistration
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DriverStatus>('all');
  const [inspectingDriver, setInspectingDriver] = useState<DriverProfile | null>(null);
  const [zoomPhoto, setZoomPhoto] = useState<{ title: string; url: string } | null>(null);

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.motorcycleBrandModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.ciDni.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = drivers.filter(d => d.status === 'active').length;
  const pendingCount = drivers.filter(d => d.status === 'pending_approval').length;
  const availableNowCount = drivers.filter(d => d.status === 'active' && d.isAvailable).length;

  const countDriverPhotos = (drv: DriverProfile) => {
    let count = 0;
    if (drv.avatarUrl) count++;
    if (drv.idDocumentPhoto) count++;
    if (drv.licensePhoto) count++;
    if (drv.motorcyclePhoto) count++;
    if (drv.vehicleDocPhoto) count++;
    return count;
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-3xl shadow-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold uppercase">
              Flota de Logística & Moto
            </div>
            <h2 className="text-xl font-extrabold text-white mt-0.5">
              Gestión de Mensajeros en Moto ({drivers.length})
            </h2>
            <p className="text-xs text-slate-400">
              Validación de documentos, fotos de motocicleta, licencias C.I. y liquidaciones por Pago Móvil
            </p>
          </div>
        </div>

        <button
          onClick={openDriverRegistration}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Mensajero</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-white border border-slate-200 rounded-2xl">
          <span className="block text-slate-500 text-[11px] font-semibold">Total Mensajeros</span>
          <span className="text-xl font-extrabold text-slate-900">{drivers.length}</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-2xl">
          <span className="block text-emerald-600 text-[11px] font-semibold">Disponibles Ahora</span>
          <span className="text-xl font-extrabold text-emerald-600">{availableNowCount}</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-2xl">
          <span className="block text-amber-600 text-[11px] font-semibold">Por Aprobar</span>
          <span className="text-xl font-extrabold text-amber-600">{pendingCount}</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-2xl">
          <span className="block text-purple-600 text-[11px] font-semibold">Activos Habilitados</span>
          <span className="text-xl font-extrabold text-purple-600">{activeCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario, cédula, modelo o placa de moto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos ({drivers.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Activos ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending_approval')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              statusFilter === 'pending_approval'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Pendientes ({pendingCount})
          </button>
        </div>
      </div>

      {/* Drivers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDrivers.map((drv) => {
          const photoCount = countDriverPhotos(drv);
          return (
            <div
              key={drv.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 relative hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-slate-800 font-extrabold text-sm border border-slate-200 shrink-0">
                      {drv.avatarUrl ? (
                        <img
                          src={drv.avatarUrl}
                          alt={drv.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Bike className="w-6 h-6 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900">{drv.fullName}</h3>
                        <span className="text-[11px] text-slate-400">@{drv.username}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        C.I. <strong>{drv.ciDni}</strong> · Tel: {drv.phone}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                      drv.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : drv.status === 'pending_approval'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {drv.status === 'active' ? 'Aprobado ✓' : drv.status === 'pending_approval' ? 'Por Aprobar' : 'Suspendido'}
                  </span>
                </div>

                {/* Motorcycle & Plate Details */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs mt-3">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Moto</span>
                    <span className="font-bold text-slate-800">{drv.motorcycleBrandModel}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Placa</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 inline-block">
                      {drv.plateNumber}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Pago Móvil</span>
                    <span className="text-slate-700 truncate block">
                      {drv.bankName} · {drv.bankPhone || drv.phone}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Documentación</span>
                    <span className={`font-bold inline-flex items-center gap-1 ${photoCount >= 3 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      <Camera className="w-3 h-3" />
                      {photoCount}/5 fotos cargadas
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setInspectingDriver(drv)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Ver Documentos ({photoCount})</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {drv.status === 'pending_approval' && (
                    <button
                      onClick={() => updateDriverStatus(drv.id, 'active')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprobar</span>
                    </button>
                  )}

                  {drv.status === 'active' && (
                    <button
                      onClick={() => updateDriverStatus(drv.id, 'suspended')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 cursor-pointer transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Suspender</span>
                    </button>
                  )}

                  {drv.status === 'suspended' && (
                    <button
                      onClick={() => updateDriverStatus(drv.id, 'active')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Reactivar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Document Inspection Modal */}
      {inspectingDriver && (
        <div
          onClick={() => setInspectingDriver(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl my-8 bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-700 flex items-center justify-center overflow-hidden shrink-0">
                  {inspectingDriver.avatarUrl ? (
                    <img
                      src={inspectingDriver.avatarUrl}
                      alt={inspectingDriver.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Bike className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-white">
                    Expediente: {inspectingDriver.fullName}
                  </h2>
                  <p className="text-zinc-400 text-xs">
                    @{inspectingDriver.username} · C.I. {inspectingDriver.ciDni} · Tel: {inspectingDriver.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingDriver(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span className="block text-zinc-500 uppercase font-bold text-[9px]">Moto</span>
                <span className="font-bold text-white">{inspectingDriver.motorcycleBrandModel}</span>
              </div>
              <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span className="block text-zinc-500 uppercase font-bold text-[9px]">Placa</span>
                <span className="font-bold text-emerald-400">{inspectingDriver.plateNumber}</span>
              </div>
              <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span className="block text-zinc-500 uppercase font-bold text-[9px]">Licencia</span>
                <span className="font-semibold text-zinc-300">{inspectingDriver.driverLicense || 'En trámite'}</span>
              </div>
              <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span className="block text-zinc-500 uppercase font-bold text-[9px]">Pago Móvil</span>
                <span className="font-semibold text-zinc-300 truncate block">
                  {inspectingDriver.bankName}
                </span>
              </div>
            </div>

            {/* Document Photos Grid */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-white text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Fotografías Oficiales & Documentación ({countDriverPhotos(inspectingDriver)}/5)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    title: '1. Selfie / Foto de Perfil',
                    url: inspectingDriver.avatarUrl,
                    desc: 'Foto personal de frente'
                  },
                  {
                    title: '2. Cédula de Identidad',
                    url: inspectingDriver.idDocumentPhoto,
                    desc: 'Cédula de Identidad laminada'
                  },
                  {
                    title: '3. Licencia de Conducir',
                    url: inspectingDriver.licensePhoto,
                    desc: 'Licencia 2da/3ra grado'
                  },
                  {
                    title: '4. Foto Moto con Placa',
                    url: inspectingDriver.motorcyclePhoto,
                    desc: 'Vehículo con placa visible'
                  },
                  {
                    title: '5. Carnet de Circulación',
                    url: inspectingDriver.vehicleDocPhoto,
                    desc: 'Carnet INTT / Título'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-white text-[11px]">{item.title}</span>
                      {item.url ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-[9px] font-bold text-emerald-400">
                          OK ✓
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-500">
                          Sin foto
                        </span>
                      )}
                    </div>

                    {item.url ? (
                      <div
                        onClick={() => setZoomPhoto({ title: item.title, url: item.url! })}
                        className="relative w-full h-36 rounded-xl overflow-hidden bg-black border border-zinc-700 cursor-pointer group"
                      >
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-[11px] font-semibold">
                          <ZoomIn className="w-4 h-4 text-emerald-400" />
                          <span>Ampliar foto</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 rounded-xl border border-dashed border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center text-center p-3 text-zinc-500">
                        <Camera className="w-6 h-6 mb-1 text-zinc-600" />
                        <span className="text-[10px]">No cargada por el conductor</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <span className="text-[11px] text-zinc-400">
                Estado actual:{' '}
                <strong className={inspectingDriver.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}>
                  {inspectingDriver.status === 'active' ? 'Aprobado y Activo' : inspectingDriver.status === 'pending_approval' ? 'Pendiente de Aprobación' : 'Suspendido'}
                </strong>
              </span>

              <div className="flex items-center gap-2">
                {inspectingDriver.status !== 'active' && (
                  <button
                    type="button"
                    onClick={() => {
                      updateDriverStatus(inspectingDriver.id, 'active');
                      setInspectingDriver(prev => prev ? { ...prev, status: 'active' } : null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aprobar Mensajero</span>
                  </button>
                )}

                {inspectingDriver.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => {
                      updateDriverStatus(inspectingDriver.id, 'suspended');
                      setInspectingDriver(prev => prev ? { ...prev, status: 'suspended' } : null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-bold border border-rose-700 cursor-pointer transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Suspender Mensajero</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setInspectingDriver(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Zoom Modal */}
      {zoomPhoto && (
        <div
          onClick={() => setZoomPhoto(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-4 text-white shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-sm text-white">{zoomPhoto.title}</h3>
              <button
                onClick={() => setZoomPhoto(null)}
                className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
              <img
                src={zoomPhoto.url}
                alt={zoomPhoto.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

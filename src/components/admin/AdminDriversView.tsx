import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DriverProfile, DriverStatus } from '../../types';
import {
  Bike,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Power,
  DollarSign,
  Phone,
  CreditCard,
  Ban,
  Check
} from 'lucide-react';

export const AdminDriversView: React.FC = () => {
  const {
    drivers,
    updateDriverStatus,
    openDriverRegistration
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DriverStatus>('all');

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
              Control de aprobaciones, licencias, motocicletas y liquidaciones por Pago Móvil
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
        {filteredDrivers.map((drv) => (
          <div
            key={drv.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 relative hover:border-slate-300 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 font-extrabold text-sm border border-slate-200">
                  <Bike className="w-5 h-5 text-emerald-600" />
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
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
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
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
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
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Saldo Ganancias</span>
                <span className="font-extrabold text-emerald-600">
                  Bs. {drv.earningsBalance.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Admin Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 text-xs">
              {drv.status === 'pending_approval' && (
                <button
                  onClick={() => updateDriverStatus(drv.id, 'active')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aprobar Mensajero</span>
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
        ))}
      </div>
    </div>
  );
};

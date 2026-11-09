import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FailedSearchRecord } from '../../types';
import {
  Radar,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  MapPin,
  Tag,
  Store,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  ArrowRight,
  Filter,
  Download,
  Share2
} from 'lucide-react';

export const DemandRadarView: React.FC = () => {
  const {
    failedSearches,
    updateFailedSearchStatus,
    deleteFailedSearch,
    openWhatsAppWithPrompt
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'evaluating' | 'added'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  // Statistics
  const totalCount = failedSearches.length;
  const pendingCount = failedSearches.filter((r) => r.status === 'pending').length;
  const evaluatingCount = failedSearches.filter((r) => r.status === 'evaluating').length;
  const addedCount = failedSearches.filter((r) => r.status === 'added').length;
  const totalQueriesAccumulated = failedSearches.reduce((acc, r) => acc + r.count, 0);

  // Filtered records
  const filteredRecords = failedSearches.filter((record) => {
    if (filterStatus !== 'all' && record.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        record.term.toLowerCase().includes(q) ||
        record.categoryGuess.toLowerCase().includes(q) ||
        (record.notes && record.notes.toLowerCase().includes(q)) ||
        (record.userLocationHint && record.userLocationHint.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStartEditNotes = (record: FailedSearchRecord) => {
    setEditingNotesId(record.id);
    setNotesDraft(record.notes || '');
  };

  const handleSaveNotes = (id: string) => {
    updateFailedSearchStatus(id, undefined as any, notesDraft);
    setEditingNotesId(null);
  };

  const getStatusBadge = (status: FailedSearchRecord['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pendiente de Oferta
          </span>
        );
      case 'evaluating':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            En Prospección Comercial
          </span>
        );
      case 'added':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Surtido / Negocio Afiliado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#D4021D] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-red-200 text-xs font-black uppercase tracking-wider border border-white/20">
            <Radar className="w-4 h-4 text-red-400 animate-spin" />
            <span>Inteligencia de Mercado & Demanda Insatisfecha</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Radar de Demanda (Búsquedas sin Stock)</h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Registra en tiempo real los artículos o servicios que los clientes buscaron en la plataforma
            pero no encontraron. Úsalo para afiliar nuevos comercios estratégicos y priorizar la expansión del catálogo.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Búsquedas Totales</span>
            <TrendingUp className="w-4 h-4 text-[#D4021D]" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalQueriesAccumulated}</div>
          <p className="text-[11px] text-slate-500">{totalCount} términos únicos</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Sin Cobertura</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
          <p className="text-[11px] text-slate-500">Requiere afiliar proveedor</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">En Negociación</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">{evaluatingCount}</div>
          <p className="text-[11px] text-slate-500">Contactando distribuidores</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Resueltos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{addedCount}</div>
          <p className="text-[11px] text-slate-500">Producto o tienda sumada</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por término, categoría o zona..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos ({totalCount})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('evaluating')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'evaluating'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              En Prospección ({evaluatingCount})
            </button>
            <button
              onClick={() => setFilterStatus('added')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'added'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Surtidos ({addedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Records Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <Radar className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-bold text-slate-600">No se encontraron registros en el radar</p>
            <p className="text-xs text-slate-400">Intenta cambiar el filtro o el término de búsqueda.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Term and Category */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-slate-900 text-sm sm:text-base">
                      "{record.term}"
                    </span>
                    <span className="bg-red-50 text-[#D4021D] font-extrabold text-[11px] px-2 py-0.5 rounded-md border border-red-200">
                      🔥 {record.count} solicitudes
                    </span>
                    {getStatusBadge(record.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      {record.categoryGuess}
                    </span>
                    {record.userLocationHint && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {record.userLocationHint}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Última búsqueda: {record.lastSearchedAt}
                    </span>
                  </div>

                  {/* Commercial Notes */}
                  <div className="pt-1">
                    {editingNotesId === record.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="Nota comercial (ej. Afiliar tienda de abarrotes de la zona)..."
                          className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-red-500"
                        />
                        <button
                          onClick={() => handleSaveNotes(record.id)}
                          className="px-2.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="px-2 py-1.5 text-slate-500 hover:text-slate-800 text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleStartEditNotes(record)}
                        className="group/note inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-slate-400 group-hover/note:text-slate-700" />
                        <span className="line-clamp-1">
                          {record.notes || 'Añadir nota de prospección comercial...'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {record.status !== 'evaluating' && record.status !== 'added' && (
                    <button
                      onClick={() => updateFailedSearchStatus(record.id, 'evaluating')}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl border border-blue-200 transition-colors cursor-pointer"
                      title="Marcar como En Prospección"
                    >
                      Evaluar
                    </button>
                  )}

                  {record.status !== 'added' && (
                    <button
                      onClick={() => updateFailedSearchStatus(record.id, 'added')}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                      title="Marcar como Resuelto"
                    >
                      Marcar Surtido
                    </button>
                  )}

                  {record.status === 'added' && (
                    <button
                      onClick={() => updateFailedSearchStatus(record.id, 'pending')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Reabrir
                    </button>
                  )}

                  <button
                    onClick={() =>
                      openWhatsAppWithPrompt(
                        `Hola equipo, detectamos alta demanda de "${record.term}" (${record.count} búsquedas) en el Radar de Demanda ConForce.`
                      )
                    }
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                    title="Compartir por WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteFailedSearch(record.id)}
                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

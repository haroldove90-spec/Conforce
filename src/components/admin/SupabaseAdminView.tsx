import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  SUPABASE_PROJECT_INFO,
  SUPABASE_SQL_SCHEMA,
  SUPABASE_SPONSOR_UNLOCK_SQL,
  SUPABASE_PURGE_SAMPLE_DATA_SQL
} from '../../data/supabaseSql';
import {
  Database,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Server,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ArrowUpRight,
  Layers,
  Sparkles,
  Zap,
  Info,
  Trash2,
  RotateCcw
} from 'lucide-react';

export const SupabaseAdminView: React.FC = () => {
  const {
    supabaseStatus,
    checkSupabase,
    syncToSupabase,
    clearAllSampleData,
    restoreSampleData,
    isMockDataCleared,
    isClearingData,
    businesses,
    products,
    orders
  } = useApp();

  const [copiedSql, setCopiedSql] = useState(false);
  const [selectedSqlTab, setSelectedSqlTab] = useState<'purge' | 'sponsor' | 'full'>('purge');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success?: boolean; message?: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const activeSqlContent =
    selectedSqlTab === 'purge'
      ? SUPABASE_PURGE_SAMPLE_DATA_SQL
      : selectedSqlTab === 'sponsor'
      ? SUPABASE_SPONSOR_UNLOCK_SQL
      : SUPABASE_SQL_SCHEMA;

  const handleCopySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeSqlContent);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  const handleCopyKey = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SUPABASE_PROJECT_INFO.anonKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SUPABASE_PROJECT_INFO.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncToSupabase();
      setSyncFeedback(res);
    } catch (err: any) {
      setSyncFeedback({
        success: false,
        message: err.message || 'Error inesperado al sincronizar con Supabase'
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Card */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-black rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 text-xs font-bold">
              <Database className="w-3.5 h-3.5" />
              <span>Base de Datos Supabase PostgreSQL</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              {SUPABASE_PROJECT_INFO.projectName}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
              Base de datos relacional PostgreSQL en la nube vinculada con persistencia multi-rol, 
              Row Level Security (RLS) y sincronización de catálogos y pedidos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => checkSupabase()}
              disabled={supabaseStatus.checking}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 rounded-2xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus.checking ? 'animate-spin' : ''}`} />
              <span>{supabaseStatus.checking ? 'Verificando...' : 'Comprobar Estado'}</span>
            </button>

            <a
              href={SUPABASE_PROJECT_INFO.sqlEditorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#D4021D] hover:bg-[#b50218] text-white font-black rounded-2xl text-xs shadow-lg shadow-[#D4021D]/25 transition-all cursor-pointer"
            >
              <span>Abrir SQL Editor</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Connection Diagnostics Banner */}
      <div className={`p-4 md:p-5 rounded-3xl border transition-all ${
        supabaseStatus.connected && supabaseStatus.hasTables
          ? 'bg-slate-50 border-slate-200 text-slate-900'
          : supabaseStatus.connected && !supabaseStatus.hasTables
          ? 'bg-amber-50/80 border-amber-200 text-amber-950'
          : 'bg-rose-50/80 border-rose-200 text-rose-950'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold ${
              supabaseStatus.connected && supabaseStatus.hasTables
                ? 'bg-slate-900'
                : supabaseStatus.connected && !supabaseStatus.hasTables
                ? 'bg-amber-500'
                : 'bg-rose-600'
            }`}>
              {supabaseStatus.connected && supabaseStatus.hasTables ? (
                <CheckCircle2 className="w-5 h-5 text-[#D4021D]" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black">
                  {supabaseStatus.connected && supabaseStatus.hasTables
                    ? 'Conexión Activa y Esquema Verificado en Supabase'
                    : supabaseStatus.connected && !supabaseStatus.hasTables
                    ? 'Conectado a Supabase: Falta ejecutar el script SQL'
                    : 'Error al contactar Supabase'}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  supabaseStatus.connected && supabaseStatus.hasTables
                    ? 'bg-slate-200 text-slate-900'
                    : supabaseStatus.connected
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-rose-200 text-rose-900'
                }`}>
                  {supabaseStatus.connected ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="text-xs opacity-90 mt-0.5">{supabaseStatus.message}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
            <button
              onClick={handleSyncData}
              disabled={isSyncing || isClearingData}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sembrar Datos en Supabase'}</span>
            </button>

            {isMockDataCleared ? (
              <button
                onClick={() => {
                  restoreSampleData();
                  setSyncFeedback({ success: true, message: 'Datos de prueba restaurados en el sistema.' });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Datos Demo</span>
              </button>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={isClearingData}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs disabled:opacity-50"
                title="Elimina todos los datos de muestra de Supabase y del sistema, bloqueando la recarga automática"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-200" />
                <span>{isClearingData ? 'Borrando...' : 'Vaciar Registros de Muestra (Supabase y Sistema)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Clear Confirmation Dialog */}
        {showClearConfirm && (
          <div className="mt-3 p-4 bg-white rounded-2xl border-2 border-rose-400 shadow-md space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-rose-900">
                  ¿Confirmas la eliminación permanente de todos los datos de muestra?
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Se borrarán los comercios, productos, órdenes y clientes de prueba tanto en el sistema como en las tablas de Supabase. Se bloqueará su recarga automática al reiniciar la app. Tu cuenta <strong>admin_master</strong> permanecerá segura y activa.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setShowClearConfirm(false);
                  const res = await clearAllSampleData();
                  setSyncFeedback(res);
                }}
                disabled={isClearingData}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {isClearingData ? 'Borrando...' : 'Sí, Borrar Todo de Muestra'}
              </button>
            </div>
          </div>
        )}

        {/* Sync Toast Feedback */}
        {syncFeedback && (
          <div className={`mt-3 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            syncFeedback.success
              ? 'bg-[#D4021D] text-white'
              : 'bg-rose-600 text-white'
          }`}>
            {syncFeedback.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{syncFeedback.message}</span>
          </div>
        )}
      </div>

      {/* Row Counts & Table Status */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { key: 'businesses', label: 'Comercios', count: supabaseStatus.tableCounts?.businesses ?? businesses.length, icon: '🏬' },
          { key: 'products', label: 'Productos', count: supabaseStatus.tableCounts?.products ?? products.length, icon: '📦' },
          { key: 'orders', label: 'Pedidos', count: supabaseStatus.tableCounts?.orders ?? orders.length, icon: '🧾' },
          { key: 'whatsapp_campaigns', label: 'Campañas WhatsApp', count: supabaseStatus.tableCounts?.whatsapp_campaigns ?? 2, icon: '📣' },
          { key: 'saved_addresses', label: 'Direcciones', count: supabaseStatus.tableCounts?.saved_addresses ?? 2, icon: '📍' },
          { key: 'chatbot_config', label: 'Chatbot IA', count: 1, icon: '🤖' }
        ].map((item) => (
          <div key={item.key} className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-base">{item.icon}</span>
              <span className="text-[10px] font-bold uppercase text-slate-500">{item.key}</span>
            </div>
            <div className="text-lg font-black text-slate-900">{item.count}</div>
            <p className="text-[10px] text-slate-500 font-medium truncate">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Supabase Credentials Box */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Server className="w-4 h-4 text-[#D4021D]" />
          <span>Credenciales del Proyecto Supabase</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* URL */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>SUPABASE PROJECT URL</span>
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-1 text-[#D4021D] hover:text-[#b50218] font-bold cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-[#D4021D]" /> : <Copy className="w-3 h-3 text-slate-500" />}
                <span>{copiedUrl ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <p className="font-mono text-slate-800 font-semibold break-all select-all">
              {SUPABASE_PROJECT_INFO.url}
            </p>
          </div>

          {/* Project ID */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-slate-500 text-[11px] font-bold block">PROJECT ID</span>
            <p className="font-mono text-slate-800 font-semibold select-all">
              {SUPABASE_PROJECT_INFO.projectId}
            </p>
          </div>

          {/* Anon Key */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 md:col-span-2">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
              <span>API KEY PÚBLICA (ANON KEY - CON RLS)</span>
              <button
                onClick={handleCopyKey}
                className="flex items-center gap-1 text-[#D4021D] hover:text-[#b50218] font-bold cursor-pointer"
              >
                {copiedKey ? <Check className="w-3 h-3 text-[#D4021D]" /> : <Copy className="w-3 h-3 text-slate-500" />}
                <span>{copiedKey ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <p className="font-mono text-[11px] text-slate-700 break-all select-all">
              {SUPABASE_PROJECT_INFO.anonKey}
            </p>
          </div>
        </div>
      </div>

      {/* SQL Script Section & Instructions */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileCode className="w-4 h-4 text-[#D4021D]" />
              <h3 className="font-bold text-sm text-slate-900">
                {selectedSqlTab === 'purge'
                  ? '🧹 Script SQL: Limpiar Registros de Muestra (Supabase Limpio para Producción)'
                  : selectedSqlTab === 'sponsor'
                  ? '⭐ Desbloqueo Rápido: Soporte de Patrocinadores y Marcas'
                  : '📋 Script SQL de Creación y Semillero Completo'}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {selectedSqlTab === 'purge'
                ? 'Borra todos los comercios, productos, pedidos, clientes y usuarios de prueba en Supabase, preservando de forma segura las tablas y la cuenta admin_master.'
                : selectedSqlTab === 'sponsor'
                ? 'Ejecuta este script para remover restricciones de categoría y habilitar las columnas is_sponsor, RIF y email en Supabase.'
                : 'Copia y corre este script en el SQL Editor de tu consola Supabase para inicializar las tablas con seguridad y datos.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#D4021D] hover:bg-[#b50218] text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>
                {copiedSql
                  ? '¡SQL Copiado!'
                  : selectedSqlTab === 'purge'
                  ? 'Copiar Script Limpieza'
                  : selectedSqlTab === 'sponsor'
                  ? 'Copiar Script Desbloqueo'
                  : 'Copiar SQL Completo'}
              </span>
            </button>

            <a
              href={SUPABASE_PROJECT_INFO.sqlEditorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
            >
              <span>Abrir SQL Editor</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Tab selection for SQL */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedSqlTab('purge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedSqlTab === 'purge'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🧹 Limpiar Registros de Muestra (Producción)
          </button>
          <button
            type="button"
            onClick={() => setSelectedSqlTab('sponsor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedSqlTab === 'sponsor'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⭐ Desbloqueo Patrocinadores
          </button>
          <button
            type="button"
            onClick={() => setSelectedSqlTab('full')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedSqlTab === 'full'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Esquema Completo
          </button>
        </div>

        {/* 3 Step Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-1">
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-purple-900">Abre Supabase SQL Editor</h4>
            <p className="text-[11px] text-purple-700">
              Ingresa al dashboard de tu proyecto en Supabase y haz clic en <strong>SQL Editor</strong> en la barra lateral.
            </p>
          </div>

          <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-1">
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-purple-900">Pega el Script SQL</h4>
            <p className="text-[11px] text-purple-700">
              Crea una <strong>New Query</strong> y pega el código usando el botón de arriba.
            </p>
          </div>

          <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-1">
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-purple-900">Ejecuta "RUN"</h4>
            <p className="text-[11px] text-purple-700">
              Presiona <strong>RUN</strong>. Los cambios se aplicarán instantáneamente y permitirán guardar patrocinadores sin errores.
            </p>
          </div>
        </div>

        {/* Code Preview Box */}
        <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-80 no-scrollbar border border-slate-800">
          <div className="sticky top-0 right-0 flex justify-end pb-2">
            <button
              onClick={handleCopySql}
              className="bg-slate-800/90 hover:bg-slate-700 text-white px-2.5 py-1 rounded-lg text-xs font-sans font-bold flex items-center gap-1 cursor-pointer border border-slate-700 shadow-md"
            >
              {copiedSql ? <Check className="w-3 h-3 text-[#D4021D]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSql ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
          <pre className="text-slate-300 leading-relaxed whitespace-pre font-mono">
            {activeSqlContent}
          </pre>
        </div>
      </div>

    </div>
  );
};

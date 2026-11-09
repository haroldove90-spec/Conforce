import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  Check,
  ExternalLink,
  ShieldCheck,
  Store,
  ShoppingBag,
  Sparkles,
  Database,
  Cpu,
  Layers,
  Smartphone,
  CheckCircle2
} from 'lucide-react';

export const PdfFeatureView: React.FC = () => {
  const [copiedLink, setCopiedLink] = useState(false);
  const pdfUrl = '/Con_Force_Caracteristicas_Por_Rol.pdf';
  const publicShareUrl = 'https://venezuela-iota.vercel.app/Con_Force_Caracteristicas_Por_Rol.pdf';

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner with Direct Download */}
      <div className="bg-gradient-to-r from-slate-950 via-zinc-900 to-red-950 border border-zinc-800 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#D4021D] text-white flex items-center justify-center shadow-lg shadow-red-950 shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-[10px] font-bold text-red-300 uppercase tracking-wider">
              Documento Ejecutivo Oficial
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Ficha Técnica y Comercial en PDF: Características por Rol
            </h2>
            <p className="text-xs text-zinc-300 max-w-2xl mt-1 leading-relaxed">
              Documento estructurado de 3 páginas en formato PDF de alta calidad listo para enviar a clientes o inversores. Organizado por perfiles de usuario: Superadministrador, Negocio/Seller y Cliente Final.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href={pdfUrl}
            download="Con_Force_Caracteristicas_Por_Rol.pdf"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D4021D] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-950 cursor-pointer"
            title="Descargar archivo PDF directamente a tu dispositivo"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF</span>
          </a>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold border border-zinc-700 transition-all cursor-pointer"
            title="Abrir PDF en una pestaña nueva del navegador"
          >
            <ExternalLink className="w-4 h-4 text-zinc-400" />
            <span>Ver Online</span>
          </a>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              copiedLink
                ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
            }`}
            title="Copiar enlace directo al PDF para compartir por WhatsApp o Correo"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-[#D4021D]" />}
            <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Link para Cliente'}</span>
          </button>
        </div>
      </div>

      {/* Role Cards Grid Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* 1. SUPERADMINISTRADOR */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 hover:border-red-300 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-red-50 text-[#D4021D] rounded-xl text-xs font-black uppercase flex items-center gap-1.5 border border-red-100">
                <ShieldCheck className="w-3.5 h-3.5" /> Rol 1: Superadmin
              </span>
              <span className="text-[10px] text-slate-400 font-bold">CONTROL TOTAL</span>
            </div>

            <h3 className="text-base font-black text-slate-900">
              Dirección General & Central de Operaciones
            </h3>
            <p className="text-xs text-slate-600">
              Diseñado para los dueños de la plataforma (Harold Anguiano, Anyel y equipo directivo).
            </p>

            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4021D] shrink-0 mt-0.5" />
                <span><strong>Dashboard Ejecutivo:</strong> Facturación bruta global, volumen de pedidos y comisiones en tiempo real.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4021D] shrink-0 mt-0.5" />
                <span><strong>Gestión Multi-Tienda:</strong> Alta y control de farmacias, restaurantes y comercios aliados con horarios y comisiones.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4021D] shrink-0 mt-0.5" />
                <span><strong>Central de Despacho:</strong> Monitoreo en vivo de repartidores y pedidos por estado operativo.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4021D] shrink-0 mt-0.5" />
                <span><strong>Control RBAC & Nómina:</strong> Administración de cuentas de usuarios, colaboradores y seguridad de accesos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4021D] shrink-0 mt-0.5" />
                <span><strong>IA Gemini Asistente:</strong> Consultoría de negocio automatizada y proyecciones de venta.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500">
            <strong>Beneficio para el cliente:</strong> Control absoluto de las finanzas y comisiones de todas las tiendas en una sola pantalla.
          </div>
        </div>

        {/* 2. NEGOCIO / SELLER */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 border border-amber-100">
                <Store className="w-3.5 h-3.5 text-amber-600" /> Rol 2: Negocio (Seller)
              </span>
              <span className="text-[10px] text-slate-400 font-bold">SUCURSAL</span>
            </div>

            <h3 className="text-base font-black text-slate-900">
              Comercios Afiliados & Mostrador
            </h3>
            <p className="text-xs text-slate-600">
              Portal privado para los encargados y gerentes de farmacias, cocinas y sucursales comerciales.
            </p>

            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Terminal de Pedidos en Vivo:</strong> Avisos sonoros y radar con cambio de estado de preparación al instante.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Gestión de Menú y Catálogo:</strong> Activación/pausa de stock, actualización de precios y ofertas relámpago.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>WhatsApp Comercial Directo:</strong> Generación de comprobantes y comunicación inmediata con el comprador.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Configuración de Sucursal:</strong> Horarios de servicio, tiempo de entrega estimado y pedido mínimo.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Reportes de Sucursal:</strong> Resumen diario de ventas y productos más rentables.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 text-[11px] text-amber-800">
            <strong>Beneficio para el cliente:</strong> Cero pérdidas por órdenes atrasadas y operación ágil sin enredos técnicos.
          </div>
        </div>

        {/* 3. CLIENTE FINAL */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 border border-blue-100">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" /> Rol 3: Cliente Final
              </span>
              <span className="text-[10px] text-slate-400 font-bold">MARKETPLACE</span>
            </div>

            <h3 className="text-base font-black text-slate-900">
              Consumidor & Comprador Móvil
            </h3>
            <p className="text-xs text-slate-600">
              Experiencia optimizada de compra en el enlace público <code>/marketplace</code>.
            </p>

            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Enlace Limpio (/marketplace):</strong> Acceso sin barreras ni menús administrativos innecesarios.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Buscador Inteligente:</strong> Exploración multitienda por nombre de producto, marca o categoría médica/gastronómica.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Carrito & Pagos Flexibles:</strong> Efectivo contra entrega, tarjeta y terminal física en el domicilio.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Rastreo en Tiempo Real:</strong> Seguimiento paso a paso del repartidor desde la tienda hasta su puerta.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Bot IA 24/7:</strong> Asistencia conversacional para responder dudas y orientar la compra a cualquier hora.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-[11px] text-blue-800">
            <strong>Beneficio para el cliente:</strong> Experiencia de compra tan rápida y confiable como las mejores apps del mercado.
          </div>
        </div>
      </div>

      {/* Technical Summary Strip */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Arquitectura Robusta y Escalable</h4>
            <p className="text-xs text-slate-400">
              React 19 • Tailwind CSS • Supabase PostgreSQL Cloud con RLS • Google Gemini AI • PWA Ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={pdfUrl}
            download="Con_Force_Caracteristicas_Por_Rol.pdf"
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#D4021D]" />
            <span>Descargar Archivo .PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
};

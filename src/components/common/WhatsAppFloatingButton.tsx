import React from 'react';
import { useApp } from '../../context/AppContext';
import { MessageCircle, Sparkles } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const { setIsWhatsAppModalOpen } = useApp();

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40">
      <button
        onClick={() => setIsWhatsAppModalOpen(true)}
        className="group relative flex items-center gap-2.5 bg-[#D4021D] hover:bg-[#b50218] text-white p-3.5 md:px-5 md:py-3.5 rounded-full shadow-2xl shadow-[#D4021D]/50 border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Abrir WhatsApp Bot IA"
      >
        {/* Pulse effect animation */}
        <span className="absolute -inset-1 rounded-full bg-[#D4021D] opacity-30 group-hover:opacity-60 blur-sm animate-pulse pointer-events-none" />

        {/* WhatsApp Icon */}
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-6 h-6 md:w-6 md:h-6 fill-white stroke-none" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
        </div>

        {/* Desktop / Expanded Label */}
        <div className="hidden md:flex flex-col text-left">
          <div className="flex items-center gap-1">
            <span className="text-xs font-extrabold tracking-wide uppercase">WhatsApp IA</span>
            <Sparkles className="w-3 h-3 text-amber-300" />
          </div>
          <span className="text-[10px] text-white/90 font-medium leading-none">Pedir y Buscar</span>
        </div>
      </button>
    </div>
  );
};

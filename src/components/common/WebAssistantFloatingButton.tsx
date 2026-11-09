import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bot, Sparkles } from 'lucide-react';

export const WebAssistantFloatingButton: React.FC = () => {
  const { setIsWebAssistantOpen, isWebAssistantOpen } = useApp();

  if (isWebAssistantOpen) return null;

  return (
    <div className="fixed bottom-36 md:bottom-26 right-4 md:right-8 z-40">
      <button
        id="btn-web-assistant-fab"
        onClick={() => setIsWebAssistantOpen(true)}
        className="group relative flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white p-3 md:px-4 md:py-2.5 rounded-full shadow-xl border border-slate-700 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Abrir Asistente Virtual Web"
      >
        <div className="relative flex items-center justify-center">
          <Bot className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </div>

        <div className="hidden md:flex flex-col text-left">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-black tracking-wide">Asistente Web</span>
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          </div>
          <span className="text-[9px] text-slate-300 font-medium leading-none">Guía interactiva</span>
        </div>
      </button>
    </div>
  );
};

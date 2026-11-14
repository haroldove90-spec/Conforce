import React from 'react';
import { useApp } from '../../context/AppContext';

interface CurrencySelectorProps {
  variant?: 'dark' | 'light';
  showRate?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  variant = 'light',
  showRate = false
}) => {
  const { currencyDisplayMode, setCurrencyDisplayMode, exchangeRateUsd } = useApp();

  const options: Array<{ id: 'bs' | 'usd' | 'dual'; label: string; title: string }> = [
    { id: 'bs', label: 'Bs.', title: 'Mostrar precios en Bolívares (Bs.)' },
    { id: 'usd', label: '$ USD', title: 'Mostrar precios en Dólares ($ USD)' },
    { id: 'dual', label: 'Bs. + $', title: 'Mostrar Bolívares y Dólares' }
  ];

  if (variant === 'dark') {
    return (
      <div
        className="inline-flex items-center p-0.5 bg-zinc-900 border border-zinc-800 rounded-xl shrink-0"
        role="group"
        aria-label="Selector de moneda"
      >
        {options.map((opt) => {
          const active = currencyDisplayMode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setCurrencyDisplayMode(opt.id)}
              title={opt.title}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-[#D4021D] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      <div
        className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-xl"
        role="group"
        aria-label="Selector de moneda"
      >
        {options.map((opt) => {
          const active = currencyDisplayMode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setCurrencyDisplayMode(opt.id)}
              title={opt.title}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-[#D4021D] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {showRate && (
        <span className="text-[11px] text-slate-500 font-medium tabular-nums">
          Tasa: 1 USD = Bs. {exchangeRateUsd.toFixed(2)}
        </span>
      )}
    </div>
  );
};

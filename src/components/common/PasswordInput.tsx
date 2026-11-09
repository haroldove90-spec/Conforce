import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Sparkles, Copy, Check } from 'lucide-react';
import { generateSecurePassword } from '../../utils/passwordGenerator';

interface PasswordInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  showGenerator?: boolean;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = 'Introduce tu contraseña',
  showGenerator = true,
  required = false,
  className = '',
  inputClassName = '',
  disabled = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const newPass = generateSecurePassword(12);
    // Create synthetic change event so parent state updates seamlessly
    const event = {
      target: { name: name || '', value: newPass }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
    setShowPassword(true); // Automatically show generated password
  };

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="relative flex items-center">
        {/* Left Lock Icon */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          <Lock className="w-4 h-4" />
        </div>

        {/* Input Field */}
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="new-password"
          className={`w-full pl-10 pr-20 py-2.5 bg-black/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4021D] transition-colors font-mono ${inputClassName}`}
        />

        {/* Right Action Icons: Eye Toggle & Copy */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Copiar contraseña"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Eye Visibility Toggle */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-[#D4021D]" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Generator Button */}
      {showGenerator && (
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer hover:underline"
            title="Generar automáticamente una contraseña fuerte y segura"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Generar Contraseña Segura</span>
          </button>

          {value && (
            <span
              className={`text-[10px] font-semibold ${
                value.length >= 8 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {value.length >= 8 ? '✓ Contraseña Fuerte' : 'Corta (< 8 car.)'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

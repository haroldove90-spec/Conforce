import React from 'react';

export const CON_FORCE_ICON_URL =
  'https://cjoszqkgqtgfvzqxcsvi.supabase.co/storage/v1/object/public/logos/conforceicono.png';
export const CON_FORCE_PWA_ICON_URL =
  'https://cjoszqkgqtgfvzqxcsvi.supabase.co/storage/v1/object/public/logos/conforcelogo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'full' | 'icon-only' | 'symbol';
  textColor?: string;
}

export const PulsoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = ''
}) => {
  return (
    <img
      src={CON_FORCE_ICON_URL}
      alt="ConForce"
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      className={`object-contain rounded-lg shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};

export const ConForceIcon = PulsoIcon;

export const PulsoLogo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  textColor = 'text-white'
}) => {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64
  };

  const textSizes = {
    sm: 'text-sm font-black',
    md: 'text-base font-black tracking-tight',
    lg: 'text-xl font-black tracking-tight',
    xl: 'text-2xl font-black tracking-wide'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Con Force Logo */}
      <div className="relative flex items-center justify-center shrink-0">
        <img
          src={CON_FORCE_ICON_URL}
          alt="ConForce"
          width={iconSizes[size]}
          height={iconSizes[size]}
          referrerPolicy="no-referrer"
          className="object-contain shrink-0 drop-shadow-xs"
          style={{ width: `${iconSizes[size]}px`, height: `${iconSizes[size]}px` }}
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`${textColor} ${textSizes[size]}`}>
            ConForce
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] font-semibold text-[#D4021D] uppercase tracking-wider">
              Marketplace
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const ConForceLogo = PulsoLogo;


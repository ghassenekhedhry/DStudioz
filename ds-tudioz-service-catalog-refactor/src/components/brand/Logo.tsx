import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'symbol' | 'wordmark';
  theme?: 'light' | 'dark' | 'monochrome';
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'full',
  theme = 'light',
  size = 'md',
}) => {
  const isDark = theme === 'dark';
  const isMono = theme === 'monochrome';

  // Palette colors
  const primaryMark = isMono ? (isDark ? '#FFFFFF' : '#18191B') : '#FF573D'; // Signal Coral
  const secondaryAccent = isMono ? (isDark ? '#74756F' : '#74756F') : '#DDF278'; // Citrus
  const textPrimary = isDark ? '#FFFFFF' : '#18191B';
  const textSecondary = isDark ? '#A0A19B' : '#74756F';

  const symbolSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const symbolSvg = (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${symbolSizes[size]} flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}
      aria-hidden="true"
    >
      {/* Outer framing container */}
      <rect width="40" height="40" rx="9" fill={isDark ? '#252629' : '#18191B'} />
      {/* D Letterform Curve */}
      <path
        d="M11 12H19C24.5228 12 29 16.4772 29 22C29 27.5228 24.5228 32 19 32H11V12Z"
        stroke={primaryMark}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* S Connected Discipline Link */}
      <path
        d="M20 18C23.3137 18 26 15.3137 26 12"
        stroke={secondaryAccent}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Precision Node Anchor */}
      <circle cx="29" cy="29" r="2.5" fill={secondaryAccent} />
    </svg>
  );

  if (variant === 'symbol') {
    return <div className={`inline-flex items-center ${className}`}>{symbolSvg}</div>;
  }

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex flex-col leading-none ${className}`}>
        <span
          className={`font-display font-bold tracking-tight uppercase ${textSizes[size]}`}
          style={{ color: textPrimary }}
        >
          DSTUDIOZ
        </span>
        <span
          className="text-[9px] font-medium tracking-widest uppercase mt-0.5"
          style={{ color: textSecondary }}
        >
          Digital Solutionz
        </span>
      </div>
    );
  }

  return (
    <div className={`group inline-flex items-center gap-3 select-none ${className}`}>
      {symbolSvg}
      <div className="flex flex-col leading-none">
        <span
          className={`font-display font-bold tracking-tight uppercase ${textSizes[size]}`}
          style={{ color: textPrimary }}
        >
          DSTUDIOZ
        </span>
        <span
          className="text-[9px] font-medium tracking-widest uppercase mt-0.5"
          style={{ color: textSecondary }}
        >
          Digital Solutionz Studio
        </span>
      </div>
    </div>
  );
};

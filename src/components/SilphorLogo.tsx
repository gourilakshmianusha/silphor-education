import React from 'react';

interface SilphorLogoProps {
  variant?: 'full' | 'horizontal' | 'monogram';
  theme?: 'dark' | 'light';
  className?: string;
  showTagline?: boolean;
}

export const SilphorLogo: React.FC<SilphorLogoProps> = ({
  variant = 'full',
  theme = 'light',
  className = '',
  showTagline = true,
}) => {
  const isDark = theme === 'dark';
  const navyColor = isDark ? '#93C5FD' : '#0B192C';
  const tealColor = isDark ? '#2DD4BF' : '#00A896';
  const circuitDark = isDark ? '#38BDF8' : '#1E3A8A';
  const circuitTeal = isDark ? '#5EEAD4' : '#028090';
  const textColor = isDark ? '#FFFFFF' : '#0B192C';
  const taglineColor = isDark ? '#94A3B8' : '#475569';

  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      <div className="flex items-center gap-3">
        {/* Monogram Emblem */}
        <svg
          viewBox="0 0 160 120"
          className="h-10 w-auto shrink-0 drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 'S' Branch Traces */}
          <path d="M48 24 L24 24 L16 34 L8 34" stroke={circuitDark} strokeWidth="3" strokeLinecap="round" />
          <circle cx="8" cy="34" r="2.5" fill={circuitDark} />
          
          <path d="M40 48 L22 48 L14 40 L6 40" stroke={circuitDark} strokeWidth="3" strokeLinecap="round" />
          <circle cx="6" cy="40" r="2.5" fill={circuitDark} />

          <path d="M48 76 L26 76 L18 84 L10 84" stroke={circuitDark} strokeWidth="3" strokeLinecap="round" />
          <circle cx="10" cy="84" r="2.5" fill={circuitDark} />

          <path d="M42 96 L20 96 L12 104 L4 104" stroke={circuitDark} strokeWidth="3" strokeLinecap="round" />
          <circle cx="4" cy="104" r="2.5" fill={circuitDark} />

          {/* Letter S Glyph */}
          <path
            d="M74 24 H56 C44 24 38 32 38 42 C38 52 46 58 60 62 C74 66 82 72 82 82 C82 92 76 98 62 98 H44"
            stroke={navyColor}
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 'P' Branch Traces */}
          <path d="M112 24 L136 24 L144 16 L152 16" stroke={circuitTeal} strokeWidth="3" strokeLinecap="round" />
          <circle cx="152" cy="16" r="2.5" fill={circuitTeal} />

          <path d="M120 44 L138 44 L146 52 L154 52" stroke={circuitTeal} strokeWidth="3" strokeLinecap="round" />
          <circle cx="154" cy="52" r="2.5" fill={circuitTeal} />

          <path d="M112 68 L134 68 L142 60 L150 60" stroke={circuitTeal} strokeWidth="3" strokeLinecap="round" />
          <circle cx="150" cy="60" r="2.5" fill={circuitTeal} />

          <path d="M96 96 L118 96 L126 104 L134 104" stroke={circuitTeal} strokeWidth="3" strokeLinecap="round" />
          <circle cx="134" cy="104" r="2.5" fill={circuitTeal} />

          {/* Letter P Glyph */}
          <path
            d="M92 98 V24 H112 C126 24 134 32 134 46 C134 60 126 68 112 68 H92"
            stroke={tealColor}
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* IC Chip Node */}
          <rect x="74" y="48" width="16" height="16" rx="2.5" fill="#0B192C" stroke={tealColor} strokeWidth="2.5" />
          <circle cx="82" cy="56" r="3" fill="#38BDF8" />
          <path d="M74 52 H70 M74 60 H70" stroke={navyColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M90 52 H94 M90 60 H94" stroke={tealColor} strokeWidth="2" strokeLinecap="round" />
        </svg>

        {variant !== 'monogram' && (
          <div className="flex flex-col justify-center">
            <span
              className="font-extrabold tracking-tight text-xl leading-none"
              style={{ color: textColor }}
            >
              SILPHOR
            </span>
            <span
              className="text-[10px] tracking-[0.22em] uppercase font-bold mt-1"
              style={{ color: tealColor }}
            >
              TECHNOLOGIES
            </span>
          </div>
        )}
      </div>

      {showTagline && variant !== 'monogram' && (
        <div
          className="text-[8.5px] font-semibold tracking-[0.25em] uppercase mt-1.5 pl-0.5"
          style={{ color: taglineColor }}
        >
          DESIGN • INNOVATE • VERIFY • DELIVER
        </div>
      )}
    </div>
  );
};

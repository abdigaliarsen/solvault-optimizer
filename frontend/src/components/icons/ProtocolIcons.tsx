import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const defaults = (size?: number): SVGProps<SVGSVGElement> => ({
  viewBox: "0 0 32 32",
  width: size ?? 20,
  height: size ?? 20,
  fill: "currentColor",
});

// ─── VaultSol ────────────────────────────────────────────────
// Shield + vault door — represents security & yield storage

export const VaultSolLogo = ({ size, ...props }: IconProps) => (
  <svg {...defaults(size)} {...props}>
    {/* Shield outline */}
    <path
      d="M16 2L4 7v9c0 7.18 5.12 13.4 12 15 6.88-1.6 12-7.82 12-15V7L16 2z"
      fillOpacity={0.15}
    />
    <path
      d="M16 3.5L5.5 7.8v8.2c0 6.38 4.52 11.96 10.5 13.5 5.98-1.54 10.5-7.12 10.5-13.5V7.8L16 3.5z"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    />
    {/* V letterform */}
    <path d="M10.5 10L16 22l5.5-12h-3l-2.5 6.5L13.5 10h-3z" />
  </svg>
);

// ─── Jito ────────────────────────────────────────────────────
// Lightning bolt — represents MEV & speed

export const JitoLogo = ({ size, ...props }: IconProps) => (
  <svg {...defaults(size)} {...props}>
    <path d="M18 3L8 18h6l-2 11 10-15h-6l2-11z" />
  </svg>
);

// ─── Marinade ────────────────────────────────────────────────
// Flame — represents liquid staking "marinade"

export const MarinadeLogo = ({ size, ...props }: IconProps) => (
  <svg {...defaults(size)} {...props}>
    <path d="M16 2C12 8 7 12 7 18a9 9 0 0018 0c0-6-5-10-9-16zm0 24a5 5 0 01-5-5c0-3.5 3-6.2 5-9.5 2 3.3 5 6 5 9.5a5 5 0 01-5 5z" />
  </svg>
);

// ─── Sanctum ─────────────────────────────────────────────────
// Infinity loop — represents infinite/liquid staking

export const SanctumLogo = ({ size, ...props }: IconProps) => (
  <svg {...defaults(size)} {...props}>
    <path
      d="M9.5 16c0-2.2 1.8-4 4-4 1.5 0 2.8.8 3.5 2 .7-1.2 2-2 3.5-2a4 4 0 010 8c-1.5 0-2.8-.8-3.5-2-.7 1.2-2 2-3.5 2a4 4 0 01-4-4z"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  </svg>
);

// ─── marginfi ────────────────────────────────────────────────
// Rising bars — represents lending/borrowing metrics

export const MarginfiLogo = ({ size, ...props }: IconProps) => (
  <svg {...defaults(size)} {...props}>
    <rect x="5" y="18" width="5" height="10" rx="1.5" />
    <rect x="13.5" y="11" width="5" height="17" rx="1.5" />
    <rect x="22" y="4" width="5" height="24" rx="1.5" />
  </svg>
);

// ─── Kamino ──────────────────────────────────────────────────
// Hexagon grid — represents concentrated liquidity vaults

export const KaminoLogo = ({ size, ...props }: IconProps) => (
  <svg {...defaults(size)} {...props}>
    <path d="M16 3l-10 6v14l10 6 10-6V9L16 3zm0 4l6 3.5v7L16 21l-6-3.5v-7L16 7z" />
    <circle cx="16" cy="16" r="2.5" />
  </svg>
);

// ─── Lookup map ──────────────────────────────────────────────

export const PROTOCOL_ICONS: Record<string, typeof JitoLogo> = {
  Jito: JitoLogo,
  Marinade: MarinadeLogo,
  Sanctum: SanctumLogo,
  marginfi: MarginfiLogo,
  Kamino: KaminoLogo,
};

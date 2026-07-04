export interface GuaranteeBadge {
  id: string;
  topLabel: string;
  centerTop: string;
  centerBottom: string;
}

export const BADGES: GuaranteeBadge[] = [
  {
    id: "wrong-measurement",
    topLabel: "FIT GUARANTEE",
    centerTop: "FIT",
    centerBottom: "GUARANTEE",
  },
  {
    id: "home-trial",
    topLabel: "HOME TRIAL",
    centerTop: "30",
    centerBottom: "NIGHTS",
  },
  {
    id: "free-return",
    topLabel: "FREE RETURNS",
    centerTop: "FREE",
    centerBottom: "RETURNS",
  },
  {
    id: "manufacturer",
    topLabel: "WARRANTY",
    centerTop: "1 YEAR",
    centerBottom: "WARRANTY",
  },
];

const SCALLOP_EDGE =
  "M 50.00 7.00 Q 56.13 3.40 61.13 8.47 Q 67.99 6.58 71.50 12.76 Q 78.61 12.71 80.41 19.59 Q 87.29 21.39 87.24 28.50 Q 93.42 32.01 91.53 38.87 Q 96.60 43.87 93.00 50.00 Q 96.60 56.13 91.53 61.13 Q 93.42 67.99 87.24 71.50 Q 87.29 78.61 80.41 80.41 Q 78.61 87.29 71.50 87.24 Q 67.99 93.42 61.13 91.53 Q 56.13 96.60 50.00 93.00 Q 43.87 96.60 38.87 91.53 Q 32.01 93.42 28.50 87.24 Q 21.39 87.29 19.59 80.41 Q 12.71 78.61 12.76 71.50 Q 6.58 67.99 8.47 61.13 Q 3.40 56.13 7.00 50.00 Q 3.40 43.87 8.47 38.87 Q 6.58 32.01 12.76 28.50 Q 12.71 21.39 19.59 19.59 Q 21.39 12.71 28.50 12.76 Q 32.01 6.58 38.87 8.47 Q 43.87 3.40 50.00 7.00 Z";

interface StampBadgeProps {
  badge: GuaranteeBadge;
  variant?: "dark" | "light";
  size?: number;
}

export function StampBadge({ badge, variant = "dark", size = 112 }: StampBadgeProps) {
  const colorClass = variant === "light" ? "text-white" : "text-[#131720]";
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <svg width={size} height={size} viewBox="0 0 100 100" className={colorClass}>
        <path d={SCALLOP_EDGE} fill="none" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <defs>
          <path id={`top-arc-${variant}-${badge.id}`} d="M 16 50 A 34 34 0 0 1 84 50" />
        </defs>
        <text fontSize="7" fontWeight="600" letterSpacing="0.6" fill="currentColor">
          <textPath href={`#top-arc-${variant}-${badge.id}`} startOffset="50%" textAnchor="middle">
            {badge.topLabel}
          </textPath>
        </text>
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          fill="currentColor"
          fontFamily="var(--font-playfair)"
        >
          {badge.centerTop}
        </text>
        <text
          x="50"
          y="66"
          textAnchor="middle"
          fontSize="8"
          fontWeight="600"
          letterSpacing="0.8"
          fill="currentColor"
        >
          {badge.centerBottom}
        </text>
      </svg>
    </div>
  );
}

interface GuaranteeBadgesProps {
  variant?: "dark" | "light";
  size?: number;
  layout?: "grid" | "grid-2" | "row" | "stack";
}

const LAYOUT_CLASSES: Record<NonNullable<GuaranteeBadgesProps["layout"]>, string> = {
  grid: "grid grid-cols-4 gap-2 py-2",
  "grid-2": "grid grid-cols-2 gap-3",
  row: "flex flex-row flex-wrap gap-4 py-2",
  stack: "flex flex-col gap-4",
};

export default function GuaranteeBadges({ variant = "dark", size, layout = "grid" }: GuaranteeBadgesProps) {
  return (
    <div className={LAYOUT_CLASSES[layout]}>
      {BADGES.map((badge) => (
        <StampBadge key={badge.id} badge={badge} variant={variant} size={size} />
      ))}
    </div>
  );
}

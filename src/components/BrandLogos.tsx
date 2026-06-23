import base44Logo from "@/assets/base44-logo-transparent.png";

export function RocketLogo({
  className = "",
  size = 20,
  white,
}: {
  className?: string;
  size?: number;
  white?: boolean;
}) {
  if (white) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className={className}
        aria-label="Rocket.new"
        fill="none"
      >
        <path
          d="M16 3C16 3 10 8.5 10 17a6 6 0 0012 0C22 8.5 16 3 16 3Z"
          fill="rgba(255,255,255,0.25)"
        />
        <path
          d="M16 3C16 3 10.5 8.8 10.5 17a5.5 5.5 0 0011 0C21.5 8.8 16 3 16 3Z"
          stroke="white"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="16" cy="17" r="2.5" fill="white" />
        <path
          d="M12.5 21C11 22.2 10.5 24.5 10.5 24.5s2.5-0.6 3.5-2"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M19.5 21C21 22.2 21.5 24.5 21.5 24.5s-2.5-0.6-3.5-2"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <ellipse cx="16" cy="25" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.35)" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-label="Rocket.new"
      fill="none"
    >
      <defs>
        <linearGradient id="rkt-body" x1="16" y1="3" x2="16" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="rkt-flame" x1="16" y1="22" x2="16" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path
        d="M16 3C16 3 10 8.5 10 17a6 6 0 0012 0C22 8.5 16 3 16 3Z"
        fill="url(#rkt-body)"
        opacity={0.18}
      />
      <path
        d="M16 3C16 3 10.5 8.8 10.5 17a5.5 5.5 0 0011 0C21.5 8.8 16 3 16 3Z"
        stroke="url(#rkt-body)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="16" cy="17" r="2.5" fill="#6366f1" />
      <circle cx="16" cy="17" r="1.2" fill="white" opacity={0.5} />
      <path
        d="M12.5 21C11 22.2 10.5 24.5 10.5 24.5s2.5-0.6 3.5-2"
        stroke="#818cf8"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M19.5 21C21 22.2 21.5 24.5 21.5 24.5s-2.5-0.6-3.5-2"
        stroke="#818cf8"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <ellipse cx="16" cy="25.5" rx="2.2" ry="1.4" fill="url(#rkt-flame)" />
      <ellipse cx="16" cy="24.5" rx="1.2" ry="0.8" fill="#fb923c" opacity={0.6} />
    </svg>
  );
}

export function Base44Logo({
  className = "",
  size,
  white,
}: {
  className?: string;
  size?: number;
  white?: boolean;
}) {
  return (
    <img
      src={base44Logo}
      alt="Base44"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={white ? { filter: "brightness(0) invert(1)" } : undefined}
      draggable={false}
    />
  );
}

export function GitHubLogo({
  className = "",
  size,
  color,
  strokeWidth: _sw,
}: {
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={color || "currentColor"}
      aria-label="GitHub"
      className={className}
      {...(size ? { width: size, height: size } : {})}
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

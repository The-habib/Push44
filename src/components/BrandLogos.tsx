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
  const color = white ? "#ffffff" : "#6366f1";
  const accent = white ? "rgba(255,255,255,0.55)" : "#818cf8";
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-label="Rocket.new"
      fill="none"
    >
      <path
        d="M12 2C12 2 7 6.5 7 13a5 5 0 0010 0C17 6.5 12 2 12 2Z"
        fill={color}
        opacity={0.15}
      />
      <path
        d="M12 2C12 2 7.5 6.8 7.5 13a4.5 4.5 0 009 0C16.5 6.8 12 2 12 2Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="2" fill={color} />
      <path
        d="M9 16.5C7.5 17.5 7 19.5 7 19.5s2-0.5 3-1.5"
        stroke={accent}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M15 16.5C16.5 17.5 17 19.5 17 19.5s-2-0.5-3-1.5"
        stroke={accent}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M10.5 8.5 C10.5 8.5 11 9.5 12 9.5C13 9.5 13.5 8.5 13.5 8.5"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity={0.6}
      />
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

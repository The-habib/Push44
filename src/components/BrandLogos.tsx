import base44Logo from "@/assets/base44-logo-transparent.webp";
import rocketLogo from "@/assets/rocket-logo.png";
import flootLogo from "@/assets/floot-logo.png";
import ziteLogo from "@/assets/zite-logo.png";
import boltLogo from "@/assets/bolt-logo.svg";

export function FlootLogo({ className = "", size = 20 }: { className?: string; size?: number }) {
  return (
    <img src={flootLogo} alt="Floot" width={size} height={size} style={{ objectFit: "contain" }} className={className} />
  );
}

export function ZiteLogo({ className = "", size = 20 }: { className?: string; size?: number }) {
  return (
    <img src={ziteLogo} alt="Zite" width={size} height={size} style={{ objectFit: "contain" }} className={className} />
  );
}

export function GitHubLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export function Base44Logo({ size = 20, className = "", white = false }: { size?: number; className?: string; white?: boolean }) {
  if (white) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="5" fill="white" fillOpacity="0.2" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="800">44</text>
      </svg>
    );
  }
  return (
    <img src={base44Logo} alt="Base44" width={size} height={size} style={{ objectFit: "contain" }} className={className} />
  );
}

export function RocketLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <img src={rocketLogo} alt="Rocket.new" width={size} height={size} style={{ objectFit: "contain" }} className={className} />
  );
}

export function BoltLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 95 83"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <path
        fill="url(#push44-bolt-hex-grad)"
        d="M66.657 0H28.343a7.948 7.948 0 0 0-6.887 3.979L2.288 37.235a7.948 7.948 0 0 0 0 7.938L21.456 78.43a7.948 7.948 0 0 0 6.887 3.979h38.314a7.948 7.948 0 0 0 6.886-3.98l19.17-33.256a7.948 7.948 0 0 0 0-7.938L73.542 3.98A7.948 7.948 0 0 0 66.657 0Z"
      />
      <path
        fill="#ffffff"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50.642 59.608c-3.468 0-6.873-1.261-8.827-3.973l-.69 3.198-12.729 6.762 1.374-6.762 9.27-42.04h11.35l-3.279 14.818c2.649-2.9 5.108-3.973 8.26-3.973 6.81 0 11.35 4.477 11.35 12.675 0 8.45-5.233 19.295-16.079 19.295Zm4.351-16.9c0 3.91-2.774 6.874-6.368 6.874-2.018 0-3.847-.757-5.045-2.08l1.766-7.757c1.324-1.324 2.837-2.08 4.603-2.08 2.711 0 5.044 2.017 5.044 5.044Z"
      />
      <defs>
        <linearGradient
          id="push44-bolt-hex-grad"
          x1="47.5"
          x2="47.5"
          y1="0"
          y2="82.409"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2B5CFF" />
          <stop offset="1" stopColor="#1A3799" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LovableLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <title>Lovable</title>
      <path
        clipRule="evenodd"
        fillRule="evenodd"
        d="M7.082 0c3.91 0 7.081 3.179 7.081 7.1v2.7h2.357c3.91 0 7.082 3.178 7.082 7.1 0 3.923-3.17 7.1-7.082 7.1H0V7.1C0 3.18 3.17 0 7.082 0z"
        fill="url(#push44-lovable-gradient)"
      />
      <defs>
        <radialGradient
          id="push44-lovable-gradient"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(-1 22.49999 -30.45394 -1.3535 14 3)"
        >
          <stop offset="0.25" stopColor="#FE7B02" />
          <stop offset="0.433" stopColor="#FE4230" />
          <stop offset="0.548" stopColor="#FE529A" />
          <stop offset="0.654" stopColor="#DD67EE" />
          <stop offset="0.95" stopColor="#4B73FF" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function FramerLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" />
    </svg>
  );
}

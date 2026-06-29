import base44Logo from "@/assets/base44-logo-transparent.webp";
import rocketLogo from "@/assets/rocket-logo.png";

export function FlootLogo({ className = "", size = 20 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="24" height="24" rx="5" fill="#6366f1" />
      <path d="M7 12h10M12 7v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ZiteLogo({ className = "", size = 20 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="24" height="24" rx="5" fill="#0ea5e9" />
      <path d="M6 8h12L8 16h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

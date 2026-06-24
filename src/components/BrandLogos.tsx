import base44Logo from "@/assets/base44-logo-transparent.png";
import rocketLogo from "@/assets/rocket-logo.png";

export function FlootLogo({
  className = "",
  size = 20,
  white,
}: {
  className?: string;
  size?: number;
  white?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill={white ? "#ffffff" : "#2563eb"}
      aria-label="Floot"
      className={className}
      width={size}
      height={size}
    >
      <path d="M29.6846 3.09875C30.6831 2.17445 31.3555 1.15164 32 0.0171526C31.533 0.0155245 17.4681 -0.00666586 17.0012 0.00199826C13.0771 0.106699 9.16588 1.35447 6.41783 3.91758L6.19946 4.12594C3.8057 6.39527 2.31429 9.12841 1.97882 12.2398L1.9517 12.5072C1.84546 13.5317 1.75664 14.5573 1.6696 15.5832L1.64709 15.849C1.5766 16.6793 1.50577 17.5096 1.43704 18.34C1.15085 21.8099 0.551724 27.9025 0 32C0.0280594 31.6095 6.62069 29.439 8.15918 20.5723L8.17895 20.341C8.29489 18.9839 8.56802 18.3915 9.34054 17.6062C10.142 16.9548 11.0921 16.6462 12.1706 16.6456L12.448 16.6495C13.2011 16.6543 13.9463 16.6863 14.6963 16.7458C16.7147 16.9076 18.8261 16.9833 20.6118 16.0006C22.1938 15.0474 23.8514 12.3926 24.2386 10.7746C24.0732 10.7746 24.0732 10.7746 23.8836 10.9079C22.7968 11.6857 21.3964 11.9367 20.0389 11.9112C19.9037 11.9085 19.7685 11.9066 19.6333 11.9052C18.7555 11.8977 17.8832 11.8639 17.008 11.8018C14.6311 11.6313 12.2081 11.5489 9.93103 12.2398L9.6844 12.3154C11.5862 6.90251 14.1458 5.6994 18.2069 5.36593C20.1417 5.20706 21.5894 5.16684 23.4679 5.17954L23.6582 5.18065C25.6404 5.20034 27.6503 4.82447 29.14 3.58082L29.2711 3.4656L29.4727 3.29593L29.6846 3.09875Z" />
    </svg>
  );
}

export function RocketLogo({
  className = "",
  size = 20,
  white,
}: {
  className?: string;
  size?: number;
  white?: boolean;
}) {
  return (
    <img
      src={rocketLogo}
      alt="Rocket.new"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={white ? { filter: "invert(1)" } : undefined}
      draggable={false}
    />
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

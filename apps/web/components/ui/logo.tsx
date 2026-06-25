interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 24, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="9" width="17" height="17" rx="4" fill="#059669" />
      <rect x="6" y="6" width="17" height="17" rx="4" fill="#10b981" />
    </svg>
  );
}

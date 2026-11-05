export function Logo({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7dffc4" />
            <stop offset=".5" stopColor="#6fd8ff" />
            <stop offset="1" stopColor="#8b7bff" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="14.5" fill="none" stroke="var(--aurora)" strokeOpacity=".5" />
        <path d="M16 4.5 L17.6 14.4 L27.5 16 L17.6 17.6 L16 27.5 L14.4 17.6 L4.5 16 L14.4 14.4 Z" fill="url(#logo-g)" />
      </svg>
      <span className="display text-[1.05rem] leading-none tracking-[-0.03em]">
        Sao <span className="text-gradient">Việt</span>
      </span>
    </span>
  );
}

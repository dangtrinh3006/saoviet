export function Logo({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeOpacity=".35" />
        <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeOpacity=".2" strokeDasharray="1 3" />
        <path
          d="M16 4.5 L17.6 14.4 L27.5 16 L17.6 17.6 L16 27.5 L14.4 17.6 L4.5 16 L14.4 14.4 Z"
          fill="var(--accent)"
        />
      </svg>
      <span className="display text-[1.05rem] leading-none tracking-[-0.03em]">
        Sao <span className="text-gradient">Việt</span>
      </span>
    </span>
  );
}

/** Compact 0–5 star rating (supports halves). Decorative + accessible label. */
export default function Stars({
  rating,
  className = "",
}: {
  rating?: number;
  className?: string;
}) {
  if (rating === undefined || rating === null) return null;
  const r = Math.max(0, Math.min(5, rating));
  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      aria-label={`Rated ${r} out of 5`}
      title={`${r} / 5`}
    >
      <span className="relative inline-block text-sm leading-none" aria-hidden>
        <span className="text-white/15">★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden text-amber-400"
          style={{ width: `${(r / 5) * 100}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className="text-xs text-foreground-subtle">{r.toFixed(1)}</span>
    </span>
  );
}

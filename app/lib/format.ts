export function ago(d: Date) {
  const s = Math.max(1, Math.round((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60); if (m < 60) return `${m}m`;
  const h = Math.round(m / 60); if (h < 24) return `${h}h`;
  const days = Math.round(h / 24); if (days < 7) return `${days}d`;
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

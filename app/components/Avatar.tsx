// Initials avatar with a color derived from the name.
export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  const initials = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className="av" style={{ width: size, height: size, fontSize: size * 0.4, background: `hsl(${h} 45% 45%)` }} aria-hidden="true">
      {initials}
    </span>
  );
}

import type { ReactNode } from "react";

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className="h-[1.15em] w-[1.15em]"
    >
      {children}
    </svg>
  );
}

/** Block I for Illinois. */
export function UiucGlyph() {
  return (
    <Glyph>
      <path d="M5 3.5h14v4.5h-4.25v8H19v4.5H5V16h4.25V8H5z" />
    </Glyph>
  );
}

/** Nested chevrons for Vinskal. */
export function VinskalGlyph() {
  return (
    <Glyph>
      <path d="M3 5l9 14 9-14" />
      <path d="M8 5l4 6.25L16 5" />
    </Glyph>
  );
}

/** Shield with a Y for Yonsei. */
export function YonseiGlyph() {
  return (
    <Glyph>
      <path d="M12 2.75l7.5 3v6.5c0 4.5-3.1 7.6-7.5 9-4.4-1.4-7.5-4.5-7.5-9v-6.5z" />
      <path d="M8.75 8.5L12 12.5l3.25-4M12 12.5v4.5" />
    </Glyph>
  );
}

/** Gear on a drafting grid for the industrial roles. */
export function IndustrialGlyph() {
  const teeth = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4;
    const x1 = 12 + 6 * Math.cos(angle);
    const y1 = 12 + 6 * Math.sin(angle);
    const x2 = 12 + 9 * Math.cos(angle);
    const y2 = 12 + 9 * Math.sin(angle);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }).join("");
  return (
    <Glyph>
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2.25" />
      <path d={teeth} />
    </Glyph>
  );
}

import { useId, type ReactNode } from "react";

// Glyphs for the bio's links, in white and sized to the text (1.15em tall).
// Line glyphs are drawn in strokes; real logos are filled, and two-tone logos
// keep their structure as two shades, the main shape solid, the second dim.

/** A square line glyph in strokes. */
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

function Mark({ viewBox, label, children }: { viewBox: string; label: string; children: ReactNode }) {
  return (
    <svg viewBox={viewBox} fill="currentColor" role="img" aria-label={label} className="h-[1.15em] w-auto">
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

/**
 * The shield from Yonsei's seal (the full seal is unreadable at text size):
 * the ring, the band below it, the chevron, and the book and torch either
 * side, cut out of a solid shield.
 */
export function YonseiGlyph() {
  const id = useId();
  return (
    <Mark viewBox="0 0 24 24" label="Yonsei University">
      <mask id={id}>
        <path fill="#fff" d="M3.6 3.9Q12 1.9 20.4 3.9V12.6C20.4 17.3 16.8 20.6 12 22.1 7.2 20.6 3.6 17.3 3.6 12.6Z" />
        <g fill="#000">
          {/* ring */}
          <path fillRule="evenodd" d="M12 5.4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 1 1 0-7Zm0 1.75a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 1 0 0-3.5Z" />
          {/* book */}
          <path d="M5.6 7.6h1.6v2.3H5.6ZM7.5 7.6h1.6v2.3H7.5Z" />
          {/* torch */}
          <path d="M17.15 6.7l.85 1.2-.85 1.1-.85-1.1ZM16.85 9.3h.6v1.8h-.6Z" />
          {/* band */}
          <path d="M3 13.3H21v.75H3Z" />
          {/* chevron */}
          <path d="M3.5 19.6 12 15.2l8.5 4.4v1.7L12 16.9 3.5 21.3Z" />
        </g>
      </mask>
      <rect width="24" height="24" mask={`url(#${id})`} />
    </Mark>
  );
}

/** MetalTek's wordmark: "Metal" heavy and solid, "Tek" dim, on its rule. */
export function MetalTekGlyph() {
  return (
    <Mark viewBox="0 0 92 24" label="MetalTek International">
      <text
        x="0"
        y="17"
        fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
        fontWeight={900}
        fontSize="19"
        letterSpacing="-1.2"
        textLength="91"
        lengthAdjust="spacingAndGlyphs"
      >
        Metal<tspan opacity={0.45}>Tek</tspan>
      </text>
      <rect x="0" y="19.6" width="91" height="2.4" />
    </Mark>
  );
}

/** HOERBIGER's mark: two raked bars standing on an open ring. */
export function HoerbigerGlyph() {
  return (
    <Mark viewBox="0 0 24 24" label="HOERBIGER">
      {/* tall bar with its foot at the top, and the short bar beside it */}
      <path d="M10.6 3.2h3.4l-2.6 14.3H9.2l2.15-11.9H9.7Z" />
      <path d="M15.5 8.4h2.2l-1.65 9.1h-2.2Z" />
      {/* the ring, open at the top where the bars meet it */}
      <path
        fillRule="evenodd"
        d="M8.2 14.6C4.9 15.2 2.6 16.4 2.6 17.8c0 2 4.2 3.5 9.4 3.5s9.4-1.5 9.4-3.5c0-1.3-1.9-2.5-4.8-3.1l-.3 1.5c2 .5 3.2 1 3.2 1.6 0 .9-3.3 1.9-7.5 1.9s-7.5-1-7.5-1.9c0-.6 1.1-1.1 3-1.5Z"
      />
    </Mark>
  );
}

/** Deublin's mark: an arrow through a turning ring (a rotating union). */
export function DeublinGlyph() {
  return (
    <Mark viewBox="0 0 34 24" label="Deublin">
      {/* the ring: front half solid, back half dim */}
      <path opacity={0.45} d="M15 2.2c2.9 0 5.2 4.4 5.2 9.8s-2.3 9.8-5.2 9.8v-2.4c1.4 0 2.8-3.4 2.8-7.4S16.4 4.6 15 4.6Z" />
      <path d="M15 2.2c-2.9 0-5.2 4.4-5.2 9.8 0 3.6 1 6.7 2.5 8.4l-1.6 1.1 4.9.9-.5-5-1.5 1c-.9-1.4-1.4-3.6-1.4-6.4 0-4 1.4-7.4 2.8-7.4Z" />
      {/* the shaft through it */}
      <path d="M1 11.2h26.5V8.6L33 12l-5.5 3.4v-2.6H1Z" />
    </Mark>
  );
}

/** The three industrial companies side by side, for the "industrial environments" link. */
export function IndustrialGlyph() {
  return (
    <span className="inline-flex items-center gap-[0.45em]">
      <MetalTekGlyph />
      <HoerbigerGlyph />
      <DeublinGlyph />
    </span>
  );
}

/** Steam's logo (the valve-and-piston mark). */
export function SteamGlyph() {
  return (
    <Mark viewBox="0 0 24 24" label="Steam">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
    </Mark>
  );
}

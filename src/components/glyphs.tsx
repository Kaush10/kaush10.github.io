import { useId, type ReactNode } from "react";

// Each place in the bio has its real mark, drawn in white. Two-tone marks keep
// their structure as two shades: the main shape solid, the secondary one dim.
// All are sized to the text: 1.15em tall, as wide as the mark needs.

function Mark({ viewBox, label, children }: { viewBox: string; label: string; children: ReactNode }) {
  return (
    <svg viewBox={viewBox} fill="currentColor" role="img" aria-label={label} className="h-[1.15em] w-auto">
      {children}
    </svg>
  );
}

/** Illinois's Block I: the orange I solid, its navy outline dim. */
export function UiucGlyph() {
  return (
    <Mark viewBox="0 0 65.8 96" label="University of Illinois">
      <path
        opacity={0.4}
        d="m65.805 26.539v-25.592h-65.805v25.592h14.624v43.87h-14.624v25.591h65.805v-25.592h-14.622v-43.87h14.622z"
      />
      <path d="m51.183 22.882h10.967v-18.279h-58.495v18.279h10.969a3.657 3.657 0 0 1 3.655 3.656v43.87a3.658 3.658 0 0 1-3.655 3.657h-10.969v18.279h58.496v-18.28h-10.968a3.657 3.657 0 0 1-3.657-3.656v-43.87a3.656 3.656 0 0 1 3.657-3.656z" />
    </Mark>
  );
}

/** Vinskal's mark: the V dim, the gem in its notch solid. */
export function VinskalGlyph() {
  return (
    <Mark viewBox="-1.5 -1.5 123 98.8" label="Vinskal">
      <path opacity={0.45} fillRule="evenodd" d="M0 0h120L71.4 95.3H48.7ZM22.7 0 60 73.2 97.3 0Z" />
      <path d="M44.8-1h30.5L60 21.3l13.5 14.6L60 69.5 46.5 35.9 60 21.3Z" />
    </Mark>
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

/** A factory for the industrial roles: saw-tooth roof, a stack, a row of windows. */
export function IndustrialGlyph() {
  return (
    <Mark viewBox="0 0 24 24" label="Industrial environments">
      <path
        fillRule="evenodd"
        d="M2.5 21.5V11l5.25 3.25V11L13 14.25V11l5.25 3.25V3.5h3.25v18ZM5.5 16.75h2v2.25h-2ZM10 16.75h2v2.25h-2ZM14.5 16.75h2v2.25h-2Z"
      />
    </Mark>
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

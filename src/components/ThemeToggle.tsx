"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

// The theme lives on <html data-theme>, set before first paint by the script
// in layout.tsx. Light mode inverts the whole page (see globals.css). With no
// saved choice the page follows the device's setting, live.

const LIGHT_QUERY = "(prefers-color-scheme: light)";

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  // Browser chrome (e.g. Safari's toolbar tint) follows the page.
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) =>
      meta.setAttribute("content", theme === "light" ? "#ffffff" : "#000000"),
    );
}

/** A small, dim switch fixed in the top-right corner. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    readTheme,
    () => "dark" as Theme,
  );

  // Follow the device's setting as it changes, unless a choice was saved.
  useEffect(() => {
    const query = window.matchMedia(LIGHT_QUERY);
    const onSystemChange = () => {
      if (!localStorage.getItem("theme"))
        applyTheme(query.matches ? "light" : "dark");
    };
    query.addEventListener("change", onSystemChange);
    return () => query.removeEventListener("change", onSystemChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    const system: Theme = window.matchMedia(LIGHT_QUERY).matches
      ? "light"
      : "dark";
    // Choosing the device's own theme goes back to following it.
    if (next === system) localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      }
      title={theme === "light" ? "Dark mode" : "Light mode"}
      className="theme-toggle fixed top-[calc(env(safe-area-inset-top)+0.5rem)] right-2 z-[60] grid size-9 place-items-center rounded-full text-white/20 transition-colors duration-300 hover:text-white/60 focus-visible:text-white/60 focus-visible:outline-1 focus-visible:outline-white/40 md:top-3 md:right-3"
    >
      {/* A half-lit disc; it turns over when the theme flips. */}
      <svg
        viewBox="0 0 16 16"
        aria-hidden
        className="theme-toggle-disc size-3.5"
      >
        <circle
          cx="8"
          cy="8"
          r="6.25"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5Z" fill="currentColor" />
      </svg>
    </button>
  );
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

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

/**
 * The switch: a small pendant lamp hanging from the top edge of the screen,
 * like the page's other lamps. Lit in dark mode, an ink dot in light mode
 * (the page inverts). Clicking pulls its cord: it dips and springs back and
 * the bulb flickers.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    readTheme,
    () => "dark" as Theme,
  );
  // Counts pulls; it keys the lamp so each pull replays the animation, and
  // nothing plays on load.
  const [pulls, setPulls] = useState(0);

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
    setPulls((n) => n + 1);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      }
      title={theme === "light" ? "Dark mode" : "Light mode"}
      className="theme-lamp fixed top-0 right-3 z-[60] h-[calc(env(safe-area-inset-top)+3rem)] w-9 focus-visible:outline-none md:right-5"
    >
      <span
        key={pulls}
        aria-hidden
        className={`theme-lamp-hang ${pulls ? "is-pulled" : ""}`}
      >
        <span className="theme-lamp-cord" />
        <span className="theme-lamp-bulb" />
      </span>
    </button>
  );
}

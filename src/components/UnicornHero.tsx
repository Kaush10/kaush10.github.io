"use client";

import { useEffect, useRef, useState } from "react";

const SDK_URL =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.3.0/dist/unicornStudio.umd.js";

type Layer = { hide: () => void };

type Scene = {
  destroy: () => void;
  getLayer: (idOrName: string) => Layer | undefined;
};

type UnicornStudioSDK = {
  addScene: (options: {
    element: HTMLElement;
    /** Id of a <script type="application/json"> holding the scene's data. */
    filePath: string;
    scale?: number;
    dpi?: number;
  }) => Promise<Scene>;
};

type SceneLayer = {
  layerType?: string;
  width?: number;
  height?: number;
  heightMode?: number;
  compiledFragmentShaders?: string[];
  breakpoints?: { name: string; props: Record<string, unknown> }[];
  states?: { scroll?: { prop: string }[] };
};

/**
 * Phone adjustments to the scene, made to its data before it loads so they
 * hold through every re-layout (Unicorn applies breakpoints itself on resize):
 * - the headline, small in the scene's Mobile breakpoint, is set large on two
 *   lines (font size is relative to the canvas width);
 * - the frame, a rectangle with its desktop proportions locked, would shrink
 *   to a short box on a tall phone screen. It spans the screen's height
 *   instead, so it meets the page's frame below.
 */
const MOBILE = { max: 575 };
const MOBILE_HEADLINE = { fontSize: 0.15, width: 0.62 };

function adjustForPhones(data: { layers?: SceneLayer[] }) {
  const phone = window.matchMedia(`(max-width: ${MOBILE.max}px)`).matches;
  for (const layer of data.layers ?? []) {
    if (layer.layerType === "text") {
      const mobile = layer.breakpoints?.find((b) => b.name === "Mobile");
      if (mobile) Object.assign(mobile.props, MOBILE_HEADLINE);
      // A leftover scroll row animates the box's width, which would re-wrap the larger text.
      if (layer.states?.scroll)
        layer.states.scroll = layer.states.scroll.filter(
          (row) => row.prop !== "width",
        );
    }
    // The frame's shader has its desktop proportions written in
    // ("absHeight = absWidth / 1.7010"). On phones that line goes, so its
    // height follows the screen; heightMode 0 is "relative" to match.
    if (layer.layerType === "shape" && (layer.width ?? 0) > 0.5 && phone) {
      layer.heightMode = 0;
      layer.compiledFragmentShaders = layer.compiledFragmentShaders?.map(
        (shader) => shader.replace(/absHeight = absWidth \/ [\d.]+;/, ""),
      );
    }
  }
  return data;
}

/** Loads the scene, applies the phone adjustments, and puts it on the page for the SDK. */
async function prepareScene(src: string) {
  const response = await fetch(src);
  const data = adjustForPhones(await response.json());
  const scriptId = "unicorn-scene";
  let script = document.getElementById(scriptId);
  if (!script) {
    script = document.createElement("script");
    script.id = scriptId;
    script.setAttribute("type", "application/json");
    document.body.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
  return scriptId;
}

declare global {
  interface Window {
    UnicornStudio?: UnicornStudioSDK;
  }
}

let sdkPromise: Promise<UnicornStudioSDK> | null = null;

function loadSdk() {
  sdkPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () =>
      window.UnicornStudio
        ? resolve(window.UnicornStudio)
        : reject(new Error("Unicorn Studio SDK loaded without a global"));
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Failed to load Unicorn Studio SDK"));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

/**
 * Full-bleed Unicorn Studio scene. The scene tracks the pointer itself, so
 * anything layered on top should be pointer-events-none. A CSS glow stands in
 * until the first frame is ready, and stays if WebGL or the CDN fails.
 */
export function UnicornHero({
  src,
  hiddenLayers = [],
}: {
  /** URL of the scene's published JSON (saved into public/ by `npm run scene:pull`). */
  src: string;
  /** Scene layers to hide, by public name (see scene.getLayers()), e.g. text the page renders as HTML. */
  hiddenLayers?: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const hiddenKey = hiddenLayers.join("\n");

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    let cancelled = false;
    let scene: Scene | undefined;

    // Render at the screen's own pixel density (capped at 2×), so the scene
    // and the name it draws stay as sharp as the HTML around them. Anything
    // lower is stretched by the browser and reads as soft.
    const dpi = Math.min(window.devicePixelRatio || 1, 2);

    Promise.all([loadSdk(), prepareScene(src)])
      .then(([sdk, filePath]) =>
        sdk.addScene({ element, filePath, scale: 1, dpi }),
      )
      .then((created) => {
        if (cancelled) {
          created.destroy();
          return;
        }
        scene = created;
        for (const name of hiddenKey ? hiddenKey.split("\n") : []) {
          created.getLayer(name)?.hide();
        }
        setReady(true);
      })
      .catch((error: unknown) => console.error(error));

    return () => {
      cancelled = true;
      scene?.destroy();
      setReady(false);
    };
  }, [src, hiddenKey]);

  return (
    <div aria-hidden className="absolute inset-0">
      <div
        className={`hero-fallback absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-0" : ""}`}
      />
      <div
        ref={containerRef}
        className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

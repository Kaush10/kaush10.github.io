"use client";

import { useEffect, useRef, useState } from "react";

const SDK_URL =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.3.0/dist/unicornStudio.umd.js";

type Layer = {
  hide: () => void;
  layerType?: string;
  fontSize?: number;
  breakpoints?: { name: string; props: Record<string, unknown> }[];
};

type Scene = {
  destroy: () => void;
  getLayer: (idOrName: string) => Layer | undefined;
  layers?: Layer[];
};

// The scene's headline is set small for phones (its "Mobile" breakpoint). It
// reads better about twice that size, on two lines. Font size is relative to
// the canvas width. Set on the layer and on its Mobile breakpoint, so it holds
// when the scene re-applies breakpoints on resize.
const MOBILE_HEADLINE_SIZE = 0.1;

function enlargeMobileHeadline(scene: Scene) {
  for (const layer of scene.layers ?? []) {
    if (layer.layerType !== "text") continue;
    const mobile = layer.breakpoints?.find((b) => b.name === "Mobile");
    if (!mobile) continue;
    mobile.props.fontSize = MOBILE_HEADLINE_SIZE;
    if (window.matchMedia("(max-width: 575px)").matches) layer.fontSize = MOBILE_HEADLINE_SIZE;
  }
}

type UnicornStudioSDK = {
  addScene: (options: {
    element: HTMLElement;
    projectId: string;
    scale?: number;
    dpi?: number;
    production?: boolean;
  }) => Promise<Scene>;
};

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
  projectId,
  hiddenLayers = [],
}: {
  projectId: string;
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

    loadSdk()
      .then((sdk) =>
        sdk.addScene({
          element,
          projectId,
          scale: 1,
          dpi,
          // Load from Unicorn's storage, not its CDN: the CDN can serve a stale
          // scene for a long time after a republish. A `?update=` tag on the
          // project id keeps each version cacheable in the browser.
          production: false,
        }),
      )
      .then((created) => {
        if (cancelled) {
          created.destroy();
          return;
        }
        scene = created;
        try {
          enlargeMobileHeadline(created);
        } catch {
          // The SDK's internals changed; keep the scene's own size.
        }
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
  }, [projectId, hiddenKey]);

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

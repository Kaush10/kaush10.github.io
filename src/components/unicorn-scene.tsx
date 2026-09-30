"use client";

import { useEffect, useRef } from "react";

const SDK_URL =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.3.0/dist/unicornStudio.umd.js";

type Scene = { destroy: () => void };

type UnicornStudioSDK = {
  addScene: (options: {
    element: HTMLElement;
    projectId: string;
    scale?: number;
    dpi?: number;
    production?: boolean;
    altText?: string;
    ariaLabel?: string;
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
    script.onload = () => resolve(window.UnicornStudio!);
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Failed to load Unicorn Studio SDK"));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export function UnicornScene({
  projectId,
  label,
  className,
}: {
  projectId: string;
  label: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    let cancelled = false;
    let scene: Scene | undefined;

    // Phones get a lighter render so the canvas doesn't eat the frame budget.
    const small = window.matchMedia("(max-width: 767px)").matches;

    loadSdk()
      .then((sdk) =>
        sdk.addScene({
          element,
          projectId,
          scale: small ? 0.5 : 1,
          dpi: small ? 1 : 1.5,
          production: true,
          altText: label,
          ariaLabel: label,
        }),
      )
      .then((created) => {
        if (cancelled) created.destroy();
        else scene = created;
      })
      .catch((error) => console.error(error));

    return () => {
      cancelled = true;
      scene?.destroy();
    };
  }, [projectId, label]);

  return <div ref={containerRef} className={className} />;
}

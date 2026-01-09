import '@expo/metro-runtime';
import { toPng } from 'html-to-image';
import { serializeError } from 'serialize-error';
import React, { useEffect } from 'react';
import './__create/consoleToParent';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import './__create/reset.css';
import CreateApp from './App';
async function inlineGoogleFonts(): Promise<void> {
  const links = Array.from(document.querySelectorAll<HTMLLinkElement>(
    'link[rel="stylesheet"][href*="fonts.googleapis.com"]'
  ));
  for (const link of links) {
    try {
      const href = link.href;
      const res = await fetch(href);
      let cssText = await res.text();
      cssText = cssText.replace(/url\(([^)]+)\)/g, (match, url) => {
        const clean = url.replace(/["']/g, "");
        if (clean.startsWith("http")) {
          return `url(${clean})`;
        }
        return `url(${new URL(clean, href).toString()})`;
      });
      const style = document.createElement("style");
      style.textContent = cssText;
      document.head.appendChild(style);
    } catch (err) {
    }
  }
  if ("fonts" in document) {
    await document.fonts.ready;
  }
}
const waitForScreenshotReady = async () => {
  const images = Array.from(document.images);
  await Promise.all([
    inlineGoogleFonts(),
    ...images.map(
      (img) =>
        new Promise((resolve) => {
          img.crossOrigin = "anonymous";
          if (img.complete) {
            resolve(true);
            return;
          }
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true);
        })
    )
  ]);
  await new Promise((resolve) => setTimeout(resolve, 250));
};
export const useHandleScreenshotRequest = () => {
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === "sandbox:web:screenshot:request") {
        try {
          await waitForScreenshotReady();
          const width = window.innerWidth;
          const height = window.innerHeight;
          const app = document.querySelector<HTMLElement>('#root')
          if (!app) {
            throw new Error("Could not find app element");
          }
          const dataUrl = await toPng(app, {
            cacheBust: true,
            skipFonts: false,
            width,
            height,
            style: {
              width: `${width}px`,
              height: `${height}px`,
              margin: "0",
            },
          });
          window.parent.postMessage(
            { type: "sandbox:web:screenshot:response", dataUrl },
            "*"
          );
        } catch (error) {
          window.parent.postMessage(
            {
              type: "sandbox:web:screenshot:error",
              error: error instanceof Error ? error.message : String(error),
            },
            "*"
          );
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);
};
const CreateAppWithFonts = () => {
  useHandleScreenshotRequest();
  return <CreateApp />;
}
LoadSkiaWeb({
  locateFile: () => '/canvaskit.wasm',
}).then(async () => {
  renderRootComponent(CreateAppWithFonts)
});

# Embiggen

**Upscale any image — in your browser.** Free, private AI super-resolution. No upload, no watermark, no signup, no resolution caps.

Live: https://embiggen.vercel.app

## What it does

- **2× / 4× / target-size** upscaling powered by **Real-ESRGAN** (`realesr-general-x4v3`) running entirely on your device via [onnxruntime-web](https://onnxruntime.ai/) (multi-threaded WASM) in a Web Worker.
- **Before/after slider** to compare the original against the result.
- **PNG / JPG / WebP** export at full resolution.
- Part of a family of free, private in-browser tools (see the footer).

## How it works

The image is split into overlapping **256×256 tiles**; each tile is upscaled ×4 by the model and stitched back together, so even very large images fit in GPU memory (the overlap is cropped away to avoid seams). The assembled ×4 result is then resampled to the requested scale or target size. A memory guard caps output at 8192px on the long side.

Everything runs client-side — your images never leave the browser. The model (~5 MB) downloads once from HuggingFace and is cached.

> **Enhance faces** (GFPGAN-style face restoration) is coming in a future release.

## Tech

Vite · React 19 · TypeScript · Tailwind · shadcn/ui · onnxruntime-web · Web Workers · Vitest

## Develop

```bash
npm install
npm run dev      # predev copies the onnxruntime engine into public/ort/
npm test         # unit tests (tiling, scale, export, device, file validation)
npm run build
```

## Deploy

Deployed on Vercel. `vercel.json` sets the **COOP/COEP** headers required for WASM threads, and the `prebuild` script vendors the onnxruntime-web engine into `public/ort/` (served same-origin — no third-party CDN). No server, no backend.

## Privacy

100% client-side. No upload, no tracking, no account. Images are processed in your browser and never sent anywhere.

## License

MIT

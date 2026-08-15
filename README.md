# Controols

**Everything. Under control.**

Controols is a browser-first portal with **400 online tools** across 16 categories and 5 languages. The site is built as a static export so the tools can be hosted on Firebase while most processing happens directly on the visitor's device.

## Stack

- Next.js static export
- React + TypeScript
- Firebase Hosting
- GitHub Actions
- Browser APIs + WebAssembly
- No application server required for the tool engines

## Languages

- English (`en`)
- Portuguese (`pt`)
- Spanish (`es`)
- Simplified Chinese (`zh`)
- Hindi (`hi`)

Each tool has a localized route, title and SEO metadata with canonical/hreflang links.

## 400-tool catalog

| Category | Tools | Engine |
| --- | ---: | --- |
| Image | 40 | Canvas + EXIF |
| PDF | 25 | pdf-lib + PDF.js + QPDF WASM |
| Video | 25 | FFmpeg.wasm |
| Audio | 20 | FFmpeg.wasm |
| Text | 35 | Browser JavaScript |
| Developer | 40 | Browser JavaScript |
| Data | 25 | PapaParse + XML/YAML parsers |
| QR & Barcode | 20 | QRCode + JsBarcode + ZXing |
| Design & Color | 30 | Browser JavaScript |
| Calculators | 30 | Browser JavaScript |
| Unit Converters | 35 | Browser JavaScript |
| Date & Time | 15 | Browser JavaScript |
| Security | 20 | Web Crypto API |
| Files | 10 | JSZip + Pako + Web Crypto |
| Documents | 15 | Marked + Turndown |
| Geography | 15 | Browser JavaScript |

The catalog is validated at build time and must contain exactly **400 tools**.

## Privacy model

Whenever technically possible, files and input data are processed locally in the browser. Image, PDF, archive, QR/barcode, video and audio engines do not require uploading the user's files to an application server.

Large video/audio/PDF operations can consume substantial RAM because WebAssembly runs on the user's device. Browser and codec support may differ between formats.

## SEO

The static export generates localized homes, categories and tool pages plus:

- canonical URLs
- hreflang for all 5 languages
- Open Graph metadata
- `sitemap.xml`
- `robots.txt`

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

The exported site is generated in `out/`.

## Firebase deploy

The GitHub Action builds every push to `main`. Deployment is enabled when these repository secrets are configured:

- `FIREBASE_SERVICE_ACCOUNT`
- `FIREBASE_PROJECT_ID`

No Firebase project id or service-account credential is committed to the repository.

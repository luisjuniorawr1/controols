# Controols

**Everything. Under control.**

Controols is a browser-first portal with **400 online tools** across 16 categories. The architecture is intentionally static-first so most processing can happen on the visitor's device instead of on paid servers.

## Stack

- Next.js static export
- React + TypeScript
- Firebase Hosting
- GitHub Actions
- Browser APIs / WebAssembly for tool engines

## Languages

English, Portuguese, Spanish, Simplified Chinese and Hindi.

## Catalog

The catalog contains exactly 400 routes. The first lightweight engine batch covers text, developer, design/color, calculators, unit conversion, date/time, security and geography tools. File-heavy categories are already routed and will receive their browser/WASM engines incrementally.

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

The included GitHub Action expects these repository secrets:

- `FIREBASE_SERVICE_ACCOUNT`
- `FIREBASE_PROJECT_ID`

No Firebase project id is committed to the repository.

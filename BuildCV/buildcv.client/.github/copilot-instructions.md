# Copilot / AI Agent Instructions for BuildCV Client

Purpose: Help an AI coding agent become productive quickly in this Angular 18 single-page app.

Big picture
- Frontend: an Angular 18 SPA (project name `buildcv.client`) that builds to `dist/buildcv.client`.
- State & API: `CvService` (src/app/cv.service.ts) is the single source-of-truth. It uses a `BehaviorSubject` (`cvData$`) and persists to `localStorage` under `cvData`. Server API endpoints are referenced in `CvService` (/api/cv/templates, /api/cv/preview, /api/cv/export/pdf, /api/cv/validate).
- Templates: preview templates live under `src/app/preview/templates`. Each template component exposes a `generateTemplate()` method and is injected into `PreviewComponent` (unusual pattern: components are provided in `AppModule.providers` and used like services).

Key files to inspect (quick entry points)
- `src/app/cv.service.ts` — central app state, HTTP integration, localStorage keys
- `src/app/preview/preview.component.ts` — how templates are composed and previewed; uses injected template components and `DomSanitizer`
- `src/app/preview/templates/*` — template components (Lima/Rotterdam/Riga/ATS) implement `generateTemplate()` and `CustomizationSettings`
- `src/app/app.module.ts` — declarations and the notable provider-based template injection
- `package.json` & `angular.json` — scripts, port (`50929`), assets (copies `pdf.worker.min.js`), and build/test configuration
- `src/proxy.conf.js` — used for API proxy during dev (check for `/api` rules)
- `aspnetcore-https.js` — prestart script that sets up SSL certs for `npm start` on dev

How to run & test (practical commands)
- Install: `npm ci` (or `npm install`)
- Dev server (Windows): `npm start` (on Windows `run-script-os` uses `start:windows` which calls `ng serve` with SSL and cert/key paths). Alternatively run: `npm run start:windows`.
- Dev server (Unix): `npm run start:default`.
- Port & proxy: the dev server uses port `50929` (see `angular.json`) and `src/proxy.conf.js` for backend API routing.
- Tests: `npm test` runs Karma as configured in `angular.json` / `karma.conf.js`.
- Build: `npm run build` (outputs to `dist/buildcv.client`). Use `--configuration development` for dev builds.

Project-specific patterns & conventions
- Single source state: components should read/update state via `CvService` (subscribe to `cvData$` or call `getCVData()`/`updateCVData()`); avoid duplicating state in components.
- Template components-as-services: template components are instantiated/injected (see `AppModule.providers`) and used via `generateTemplate()` rather than purely as UI pieces. When modifying templates, preserve the `generateTemplate()` contract.
- localStorage keys: `cvData` and `cvCustomization` are used; clearing/reset flows use `CvService.resetCV()` and removal of those keys.
- Async preview generation: `PreviewComponent.generatePreview()` sets component fields then calls `generateTemplate()` and sanitizes HTML via `DomSanitizer`. Keep client-side HTML generation synchronous and lightweight; server preview endpoints exist for heavier rendering.

Integration points
- Backend API (paths in `CvService`): `/api/cv/templates`, `/api/cv/preview`, `/api/cv/export/pdf`, `/api/cv/validate` — ensure proxy and backend route alignment.
- PDF worker: `pdf.worker.min.js` is copied into assets via `angular.json` from `pdfjs-dist`.
- HTTPS for dev: `aspnetcore-https.js` (prestart) + `start:windows`/`start:default` ensure cert/key are provided for `ng serve --ssl`.

Editing guidance and PR checklist for agents
- When changing state flows, update `CvService` and a unit test or `cv.service.spec.ts` under `src/app` if relevant.
- When changing template output, update the corresponding template component under `src/app/preview/templates` and verify `PreviewComponent` still sanitizes and renders correctly.
- For API changes, update `src/proxy.conf.js` accordingly and check both local dev proxy and backend routes.
- Keep bundle size in mind: `angular.json` enforces small component style budgets; avoid inlining large assets.

Examples (references)
- State update example: `CvService.updatePersonalInfo(...)` writes `localStorage.setItem('cvData', ...)`
- Template usage: `PreviewComponent` sets `limaTemplate.cvData = this.cvData` then calls `this.limaTemplate.generateTemplate()` and `sanitizer.bypassSecurityTrustHtml(html)`.

If anything above is unclear or you'd like the agent to adopt stricter rules (naming, tests, commit hooks), tell me which areas to expand.

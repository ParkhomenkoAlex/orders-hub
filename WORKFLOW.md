# Orders Hub — Development Workflow

> Working roadmap for the dZENcode React / Next.js Middle+ test assignment.
> Status legend: [x] implemented and supported by source or recorded manual verification; [~] implemented in part or needs browser/integration verification; [ ] not implemented. Do not mark a requirement complete solely because it is listed here.

## Approved scope policy

The written requirements in `REQUIREMENTS.md` are cumulative and mandatory across all levels. The reviewer confirmed that each required technology may be demonstrated through a focused, meaningful working example rather than being deeply coupled to Orders and Products. Architectural demonstrations may use small independently runnable boundaries; production-scale infrastructure is optional unless the written requirement demands it. Public deployment is primarily for tester access. Deliberately omitted or partial details must be documented and explained in the final video walkthrough.

## Project snapshot

- Canonical original assignment: REQUIREMENTS.md.
- App: **orders-hub**
- Local directory: ~/orders-hub
- Framework: Next.js 16.4.2 (App Router), React 19, TypeScript
- Package manager: npm; Node.js 22.23.2
- Styling: Bootstrap 5.3.8, Sass, BEM-oriented global styles, and SCSS Modules for layout components
- Formatting: Prettier configured with four-space indentation and 100-character print width
- Current UI architecture: root layout provides document metadata and global SCSS; the (dashboard) route group provides StoreProvider, TopMenu, Sidebar, PageTransition, and the shared main-content shell
- State: Redux Toolkit retains global search state; RTK Query loads and mutates persisted Orders and Products through the server-side Drizzle/MySQL REST API
- Localization: cookie-initialized React Context provides English and Russian UI catalogs without locale-prefixed routes; the Products Type filter is the documented native Web Storage example.
- Routes: /orders, /products, /groups, /users, /settings; Groups and Users intentionally render an under-construction page, while Settings is the protected JWT demonstration route.
- Repository workflow: main is stable, develop is integration, and feature/* branches are implementation branches. PR #6 merged `feature/dev-deployment` into develop at `db4b96c`; local develop was fast-forwarded to that commit with a clean working tree.
- Deployment: an initial Vercel production deployment was previously reported as public; its current availability was not rechecked in this audit.

## Verification record

### Recorded 2026-10-19

- [x] Scaffold created with create-next-app and renamed to orders-hub.
- [x] GitHub remote and initial Vercel production deployment were reported as configured.
- [x] npm audit --omit=dev reported zero production dependency vulnerabilities.

### Recorded 2026-10-20

- [x] Manual Phase B checks reported: creating orders/products; recalculating product counts and USD/UAH totals; preserving local state while navigating between Orders and Products.
- [x] Manual Phase B checks reported: cascading order deletion with related products; Type filtering, global search, and their combination.
- [x] Manual Phase B checks reported: Escape dismissal, focus restoration, and basic keyboard interaction in dialogs.
- [x] Production build was reported successful, including TypeScript checks.
- [~] Responsive review was only surface-level; mobile and tablet layouts require a dedicated browser pass.
- [~] Route and details-panel animations are implemented but need visual polish against the references.

### Recorded 2026-10-21

- [x] TypeScript check, ESLint, and Prettier checks were reported successful after the current lint fixes. They were not rerun during this audit.
- [x] App Router layout refactoring completed: the shared dashboard shell moved from AppShell into src/app/(dashboard)/layout.tsx; /orders and /products retained their URLs.
- [x] ProductsCatalog was renamed to ProductsWorkspace.
- [x] Sidebar navigation was expanded to five routes; only Orders and Products contain assignment functionality.
- [x] Layout styles for Sidebar, TopMenu, and CurrentDateTime moved to dedicated SCSS Modules; feature/workspace styles remain global in globals.scss.
- [x] Date/time logic is isolated in CurrentDateTime with hydration-safe fallbacks, a deferred initial update, and a one-second interval.
- [x] Header logo and Sidebar avatar use local PNG assets through next/image; unused create-next-app SVG assets were removed.

### Recorded 2026-10-22

- [x] Local MySQL 8.4.13 Compose service and application connection were manually verified.
- [x] Initial Drizzle migration was manually applied and recorded in `__drizzle_migrations`; `orders` and `products` exist with the planned cascade foreign key, four indexes, and three CHECK constraints.
- [x] TypeScript, ESLint, and Prettier checks were reported successful after the initial database migration.
- [x] Vitest 3.2.4 unit-test foundation was manually verified: 15 tests across two files cover grouping, totals, filtering, reducer mutations, cascade deletion, and immutability.
- [x] TypeScript, ESLint, and Prettier checks were reported successful after adding the Phase C.1 test foundation.

### Recorded 2026-10-27

- [x] Redux Toolkit migration was manually verified: the serializable inventorySlice owns orders, products, and global search; StoreProvider replaces OrdersDataProvider; and local dialog, selection, animation, focus, and route-specific filter state remains in its components.
- [x] 19 Vitest unit tests passed, covering existing domain helpers, inventory reducer behavior, and focused selectors.
- [x] TypeScript, ESLint, and Prettier checks passed after the Redux Toolkit migration.
- [x] Manual Orders and Products checks passed: order/product creation, cascading order deletion, global search, and product filters.
- [x] REST API verification passed: GET/POST/DELETE Orders and GET/POST Products returned the expected status codes and persisted data; MySQL ON DELETE CASCADE removed a related product after its order deletion; repeated order deletion returned `404 ORDER_NOT_FOUND`; and an invalid order title returned `422 VALIDATION_ERROR`.
- [x] 30 Vitest tests across five files passed; TypeScript, ESLint, and Prettier checks passed; and the MySQL 8.4 Docker container was healthy during API verification.

### Recorded 2026-10-28

- [x] RTK Query integration was manually verified: Orders and Products load from the REST API/MySQL; create and delete mutations persist data and invalidate the relevant caches, including both datasets after an order cascade deletion.
- [x] Global search, product type/specification filters, empty/error/retry states, and UI-local dialogs, selection, focus, and animation behavior were retained. Custom product specifications persist and populate the dynamic Specification filter; blank specifications normalize to `Standard`.
- [x] Initial Orders and Products requests render accessible skeleton layouts while cached data remains visible during background refetches.
- [x] Final RTK Query verification passed: TypeScript, ESLint, Prettier, production build, and `git diff --check`; 24 Vitest tests across five files passed.
- [x] C.4a Stage 1 verification passed: lazy, cached `getDb()` initialization keeps API-route imports build-safe without `DATABASE_URL`; `git diff --check`, Prettier, TypeScript, ESLint, and both production-build scenarios passed, and 25 Vitest tests across six files passed. Local Orders and Products behavior remained functional against Docker MySQL. Existing Bootstrap Sass deprecation warnings are non-blocking.
- [x] C.4a Preview deployment verification passed: Aiven Free MySQL 8.4 hosts `orders_hub` with the migrated `orders`, `products`, and `__drizzle_migrations` tables; CA-verified TLS and Vercel Preview environment variables were confirmed. The Preview deployment and all ten manual application checks passed, including persisted CRUD, reloads, search/filters, editing, and deletion. Local Prettier, TypeScript, ESLint, Vitest, and production-build checks passed; the working tree was clean.
- [x] C.4a delivery verification passed: PR #6 (`feature/dev-deployment` → develop) merged at `db4b96c`; local develop fast-forwarded cleanly. The develop Vercel Preview was checked after the merge: existing orders remained visible and newly created orders succeeded.
- [x] C.3 schema deliverable verification passed: `database/schema.sql`, exported from local MySQL 8.4 with `mysqldump --no-data`, opens in MySQL Workbench 26.10 and executed successfully against a fresh temporary database. It created the verified `orders` and `products` tables with their foreign key, four indexes, and three CHECK constraints; the temporary database was then dropped.
- [x] C.5 local verification passed: the independently runnable Socket.IO service correctly counted tabs across normal navigation, refreshes, incognito sessions, server stops, and automatic reconnects. Focused real-client integration tests passed. The production build now uses Next.js Webpack because Turbopack stalled locally; the prior external Google Fonts build dependency was removed, and the Webpack production build completed successfully. Existing Bootstrap Sass deprecation warnings remain non-blocking.

### Recorded 2026-10-30

- [x] C.5 public verification passed: the Vercel Preview frontend connected to the independently hosted Render Socket.IO service. Opening and closing tabs updated the active-session count; Orders/Products navigation did not create duplicate sessions. The service and preview recovered from reconnect scenarios, and Orders/Products API requests worked after Aiven MySQL service restoration.
- [~] C.5 operational caveat: Render Free can suspend an inactive single-instance service. During wake-up the client reports reconnecting/unavailable rather than a stale count; a globally accurate counter across multiple instances would require shared presence infrastructure.
- [x] Phase D SSR verification passed: `/orders` uses Next.js `connection()` for request-time rendering, loads Orders and related Products through server-only Drizzle helpers, and renders the existing order content in the initial HTML. `OrdersWorkspace` receives that initial data while RTK Query continues to manage client-side queries, mutations, invalidation, and refetching. TypeScript, ESLint, formatting, unit tests, and the production build passed; the build classified `/orders` as dynamic. Actual order titles were confirmed in local production HTML and Vercel Preview View Source, with no observed hydration or visual regressions.

### Recorded 2026-11-02

- [x] Phase D i18n verification passed: typed English (`en`) and Russian (`ru`) catalogs, a React Context provider, and a cookie-backed locale preference initialize the root document and client with the same locale. Layout, Orders, and Products update immediately on language changes; dates, currencies, validation, plural forms, and accessible labels are localized. `Inventory` and `Orders Hub` remain brand names.
- [x] Phase D Web Storage verification passed: the Products Type filter persists only canonical ProductType values through native `localStorage`, restores after refresh and navigation, clears storage for `all`, and safely rejects invalid values or unavailable storage. The Specification filter remains session-local.
- [x] Phase D i18n and Web Storage validation passed: 64 unit tests, TypeScript, ESLint, Prettier, and the production build completed successfully; manual browser checks confirmed language switching, cookie persistence, localized Layout/Orders/Products behavior, and Type-filter restoration without regressions.
- [x] Phase D JWT verification passed: a server-only HS256 `jose` token with issuer, audience, issued-at, and eight-hour expiry is issued only after timing-safe verification of one configured demonstration account. Same-origin form login and logout use an HTTP-only, `SameSite=Lax` cookie; `/settings` verifies the JWT server-side and redirects anonymous, invalid, or expired sessions to `/login`. Orders and Products intentionally remain public. TypeScript, ESLint, Prettier, production build, and 80 unit tests passed; local and Vercel Preview browser verification confirmed login, logout, and protected-route redirects after the three required server-only Preview variables were configured. A read-only security audit found no committed secrets or evidence requiring credential rotation.
- [~] JWT limitation: logout clears the browser cookie but cannot revoke a copied stateless JWT before its eight-hour expiration. This focused demonstration has no user database, registration, roles, refresh tokens, or inventory API authorization.

### Security note

npm audit previously reported five high-severity findings through the development-tooling chain eslint-config-next -> @next/eslint-plugin-next -> fast-glob -> micromatch -> braces. npm audit --omit=dev reported zero findings. Do **not** run npm audit fix --force without reviewing its proposed breaking downgrade to the Next.js ESLint configuration. Reassess when compatible dependency fixes become available.

## Original assignment crosswalk — baseline requirements

- [x] React and component-based UI: Next.js/React components are used throughout src/components.
- [x] Redux / global-state library: Redux Toolkit and React Redux provide shared global search state and RTK Query API caching for persisted Orders and Products.
- [x] Routing: Next.js App Router provides separate Orders and Products routes, with a shared dashboard layout.
- [x] Animation: CSS route-entry and order-details enter/exit animations exist and honor reduced-motion settings.
- [x] ES6: current TypeScript uses modules, arrow functions, templates, spread syntax, and modern collection APIs.
- [x] Bootstrap and BEM-oriented SCSS: Bootstrap is imported globally; Bootstrap grid/form/table utilities and BEM-style selectors are used.
- [x] REST API: Next.js App Router route handlers provide validated Orders and Products listing, creation, and deletion through Drizzle/MySQL; RTK Query connects the UI to those endpoints.
- [x] Forms and validation: Add Order and Add Product dialogs validate required fields, prices, and warranty dates before sending RTK Query mutations; custom product specifications are supported and blank values normalize to `Standard`.
- [x] Git workflow: PR #6 verified the feature-to-develop merge path; local develop was confirmed at `db4b96c` with a clean working tree.
- [~] Docker: the local MySQL 8 Compose service was manually verified healthy. It runs on 127.0.0.1:3307 with the dedicated application user, InnoDB, and persistent named volume; the application container is still missing.
- [x] WebSocket active-tab counter: the standalone Render Socket.IO service and Vercel Preview TopMenu client are manually verified; see the recorded Free-tier single-instance caveat.
- [~] Screenshot-based HTML/CSS: desktop UI structure and local assets are implemented; visual parity and all responsive breakpoints still need browser review.

### Baseline deliverables still missing

- [x] Socket.IO active-session counter: Render/Vercel Preview verification passed; Free-tier inactivity and single-instance limitations remain documented.
- [ ] Docker environment.
- [x] MySQL Workbench-compatible SQL schema artifact: `database/schema.sql` and `database/README.md` document the exported Orders/Products structure and Workbench import procedure; no native `.mwb` model or EER diagram is provided.
- [~] README documents local Docker, Aiven TLS, manual migration, and Vercel Preview setup; final handoff documentation and production deployment details remain pending.
- [~] Public deployment was reported earlier but needs a final private/incognito verification before handoff.

## Phase A — Foundation, GitHub, Vercel

- [x] Project scaffold, TypeScript, ESLint, Sass, Bootstrap, src directory, and @/* alias are present.
- [x] GitHub remote and initial Vercel deployment were reported as configured.
- [x] Branch strategy (main, develop, feature/*) is documented and verified through the merged PR #6 feature-to-develop workflow.
- [~] Reconfirm the public deployment URL and its production build before final delivery.

**Done when:** the GitHub repository, branch workflow, and public deployment are rechecked from the actual remote and a documented deployment URL is available in the finished README.

## Phase B — Core Orders & Products interface

- [x] Bootstrap and Sass are installed; shared tokens and BEM-oriented styles are defined.
- [x] Shared dashboard shell: Sidebar, TopMenu, local avatar/logo assets, global search, current date/time, and responsive mobile navigation.
- [x] App Router organization: (dashboard) owns the Redux provider and shared shell while root layout remains server-oriented and contains global metadata/styles.
- [x] Navigation: functional /orders and /products links with active state; Groups and Users are explicit under-construction routes, and Settings is the protected JWT demonstration route.
- [x] Orders list: title, dynamic product count, two date formats, and USD/UAH totals derived from related products.
- [x] Order selection opens an adjacent details panel; selecting again/close action initiates the details close animation.
- [x] Order details: associated products, status mark, serial number, status text, local Add Product action, and product deletion action.
- [x] Add Order and Add Product native-dialog forms perform client-side validation and update the shared local state.
- [x] Reusable native delete-confirmation dialog supports order deletion and product deletion; order deletion cascades to related products.
- [x] Products workspace: semantic table, product type and specification filters, global search, warranty dates, USD/UAH prices, and parent-order information.
- [x] Shared local client state keeps Orders and Products synchronized through route navigation; reducer enforces product creation only for an existing order.
- [x] Empty states distinguish empty mock data from filtered/search no-result cases.
- [x] Formatting helpers validate ISO calendar dates, preserve local date semantics, and format currencies consistently.
- [x] Route entry and details enter/exit animations are implemented with prefers-reduced-motion handling.
- [x] Dialog source includes native showModal, Escape/backdrop dismissal, initial focus, fallback focus restoration, labels, and descriptive associations.
- [~] Manual dialog keyboard checks were recorded, but a full keyboard/screen-reader audit of all controls, table navigation, focus order, and dynamic announcements is still needed.
- [~] Mobile/tablet layouts, wide Products table scrolling, long labels, and visual parity with the supplied desktop references need dedicated browser QA.
- [~] Route/details transition timing and motion need visual refinement after that browser QA.
- [x] Loading, network-error, retry, and empty states are implemented for the REST-backed Orders and Products queries; initial loads use reduced-motion-aware skeleton layouts.

**Data correctness:** Products use orderId as the foreign key. Counts and totals are derived from grouped related products; they are not stored as independent order fields. Do not reproduce the sample app.js behavior that associates every product with every order.

## Phase C — Data, state, API, and real-time presence

### C.1 State and domain audit

- [x] Typed domain models, mock data, currency totals, grouping, filtering, and cascaded local deletion exist.
- [x] Add a minimal Vitest unit-test foundation for the existing pure domain helpers and reducer contract.
- [x] Cover grouping, totals, product/order filtering, reducer additions/deletions, cascade deletion, orphan-product rejection, and immutable state updates with 15 unit tests across two files.
- [x] Define the Redux state shape, selector contracts, and migration boundaries before replacing OrdersDataProvider; loading/error states remain deferred until an API exists.
- [~] Decide which additional pure domain functions remain framework-independent before/alongside the state migration; the current helpers and reducer contract now have baseline unit coverage.

### C.2 Redux Toolkit migration

- [x] Add Redux Toolkit and React-Redux after the state audit approval.
- [x] Replace OrdersDataProvider with StoreProvider and a focused serializable inventorySlice for orders, products, and global search, while retaining UI-local state and existing visible behavior.
- [x] Add memoized selectors for grouped products and globally visible orders; retain existing framework-independent domain totals and filtering helpers.
- [x] Manually verify local CRUD, cascading deletion, global search, product filters, dialogs, and focus behavior; 19 unit tests plus TypeScript, ESLint, and Prettier checks passed.

### C.3 Backend and database design

- [x] Database access foundation: Drizzle ORM with mysql2 is configured for and connected to the local MySQL service.
- [x] Add and manually verify minimal local MySQL 8 Compose foundation: dedicated database/application user, persistent named volume, localhost-only non-default port, and healthcheck. mysql:8.4 is running as healthy; orders_hub_app connected to orders_hub, and InnoDB was confirmed as the default storage engine.
- [x] Define initial Drizzle orders/products schema: UUID-compatible string IDs, DATE values, DECIMAL(14,2) prices, timestamps, product indexes, warranty/price checks, and ON DELETE CASCADE.
- [x] Initial MySQL-compatible Drizzle SQL migration was applied successfully and recorded in `__drizzle_migrations`; the `orders` and `products` tables, cascade foreign key, four indexes, and three CHECK constraints were manually verified.
- [x] Export and review `database/schema.sql` in MySQL Workbench 26.10; the no-data MySQL 8.4 DDL artifact was executed against a fresh temporary database and verified to create the Orders/Products relationship, indexes, and CHECK constraints. `database/README.md` documents the artifact, its Drizzle relationship, and regeneration procedure; no native `.mwb` model or EER diagram is provided.

### C.4 REST and RTK Query integration

- [x] Implement and verify REST endpoints for Orders and Products listing, creation, deletion, `orderId` product filtering, and validation errors; order deletion relies on the database foreign-key cascade.
- [x] Add an RTK Query API layer to load persisted Orders and Products and perform create/delete mutations; cache invalidation refreshes both datasets after an order deletion cascade.
- [x] Replace runtime mock data and mutations with RTK Query requests while retaining global search, local product filters, dialogs, details, confirmations, focus, and animations; add loading/error/retry/empty states, initial skeleton layouts, and focused API/query tests.

### C.4a Preview deployment and remote database

Local Docker MySQL and remote Preview MySQL are separate environments. The deployed application must use real, persistent database storage rather than mock data. Do not add temporary database fallbacks or disable API routes to make deployment succeed, and do not run database migrations automatically during Vercel builds. Production deployment, WebSocket active-tab counting, and Docker application packaging remain separate pending tasks. Mark an item complete only after manual verification.

- [x] Implement lazy, cached MySQL initialization using `getDb()`.
- [x] Verify TypeScript, ESLint, formatting, tests, local API behavior, and a Next.js production build without `DATABASE_URL`.
- [x] Select and provision a persistent, remotely accessible MySQL 8-compatible development database.
- [x] Configure secure Vercel Preview environment variables, including a server-only `DATABASE_URL`.
- [x] Apply the existing Drizzle migrations to the remote development database.
- [x] Deploy and verify the real application: Orders, Products, CRUD operations, persistence after reload, cascade deletion, search, filters, error states, and custom specifications.
- [x] Update README with reproducible local and preview setup instructions.
- [x] Run final validation, record verified results, commit changes, and prepare a PR into `develop`; PR #6 was merged and the develop Preview was verified after the merge.

### C.5 Real-time active sessions

- [x] Build and locally verify a small, independently runnable single-instance Socket.IO service that counts connected browser tabs and broadcasts the count on connection changes.
- [x] Replace the Sessions: unavailable placeholder with a client-only TopMenu connection, explicit connecting/reconnecting/unavailable states, cleanup, and a configured local origin allowlist.
- [x] Add focused Socket.IO integration tests for initial count, multi-tab broadcasts, disconnect/reconnect, origin rejection, and clean shutdown.
- [x] Deploy the real-time service to Render Free and connect it to the public/Preview application through `NEXT_PUBLIC_REALTIME_URL` and exact configured allowed origins. A dedicated single-instance service is simpler here than relying on per-instance Vercel Function memory; Vercel WebSocket support does not remove the need for shared state when scaling.
- [x] Document the Socket.IO event contract and independently runnable service boundary. It can demonstrate the required microservice approach after separate deployment verification.

## Phase D — Junior+ requirements

- [x] TypeScript: strict project configuration and typed domain/UI code are present.
- [x] SSR via Next.js: `/orders` uses `connection()` for request-time rendering, loads initial Orders and Products through server-only helpers, and renders the existing workspace content into the initial HTML. The initial data is not hydrated into the RTK Query cache; after hydration, existing RTK Query queries, mutations, invalidation, and refetching remain authoritative.
- [x] Unit-test foundation: recorded verification covers domain, state, validation, API-route, RTK Query, database-connection, SSR, i18n, Web Storage, and focused component contracts; 64 unit tests passed.
- [x] i18n demonstration: English and Russian catalogs use typed React Context, a cookie-backed SSR-safe initial locale, and immediate switching across Layout, Orders, and Products. `Inventory` and `Orders Hub` remain untranslated brand names.
- [x] Minimal real JWT authentication demonstration: server-only `jose` HS256 signing and verification require configured credentials and a 32-byte-or-longer secret; login/logout use a secure HTTP-only cookie, and `/settings` is protected by server-side signature, issuer, audience, and expiration checks. Orders and Products remain intentionally public. Local and Vercel Preview browser verification passed after configuring the required server-only authentication variables.
- [x] Web Storage demonstration: native `localStorage` persists the canonical Products Type filter value, restores it after refresh/navigation, removes it for `all`, and safely falls back for invalid or unavailable storage. The Specification filter is intentionally not persisted.
- [x] Lazy Loading demonstration: the existing Orders detail panel uses client-only `next/dynamic` loading with an accessible, layout-preserving skeleton fallback. The production build emits a separate async `OrderDetails` chunk and the initial `/orders` HTML does not reference it; TypeScript, ESLint, formatting, 83 unit tests, and the production build passed. Chrome verification with cache disabled confirmed the deferred request after first selection, and Slow 3G confirmed the skeleton fallback; closing/switching details and product actions remained functional.
- [x] Chart demonstration: Products renders a responsive, interactive product-count-by-type bar chart from the live RTK Query Products cache. A pure typed aggregation helper supports later reuse; chart bars apply the existing canonical Type filter, zero-count categories render without green fill, and chart-specific styles are scoped in `ProductTypeChart.module.scss`. English/Russian localization, responsive layouts, loading, empty, and error states are covered. TypeScript, ESLint, formatting, 88 unit tests, and the production build passed; browser verification confirmed real data/counts, proportional positive bars, zero-fill behavior, and filter toggle/reset interaction.
- [x] Interactive map demonstration: protected Settings provides a client-only, lazily loaded Leaflet + OpenStreetMap Service Locations map with static Kyiv, Cherkasy, and Lviv examples, interactive markers/popups, and selectable location cards. EN/RU localization, responsive layout, and SCSS Modules with camelCase BEM are implemented. Browser verification passed; TypeScript, ESLint, 94 unit tests, Prettier, diff, and production-build verification passed.

## Phase E — Middle requirements

- [x] Graph demonstration: a client-only, lazily loaded Orders-to-Products SVG adjacency graph uses existing RTK Query data, shows real relationship edges, selectable nodes, and accessible relationship traversal/list details with EN/RU localization. Typed transformation/component tests passed alongside TypeScript, ESLint, 99 unit tests, Prettier, diff, and production-build verification; browser verification passed.
- [x] Functional read-only GraphQL endpoint at `/api/graphql` alongside REST: `orders`, `order(id)`, `products`, and `product(id)` use the existing server-only inventory helpers, with nested Order Products resolved from one request-scoped batched Products read. Standard POST JSON requests, variables, nested selections, safe errors, tests, and README curl examples are implemented. Local MySQL verification confirmed persisted Orders with nested Products, variable-based Order lookup, Products queries, and standard invalid-field validation errors; TypeScript, ESLint, 103 unit tests, Prettier, diff, and production-build verification passed.
- [x] Web Worker demonstration: Products uses a native browser worker to calculate live total Orders/Products and canonical Product Type/Status aggregates from compact RTK Query data off the main thread. The localized inventory summary handles loading and worker errors, ignores stale responses, and terminates its worker on unmount. Typed aggregation, protocol, and component-state tests passed; TypeScript, ESLint, 108 unit tests, Prettier, diff, and production-build verification passed. Browser verification confirmed correct statistics, updates after product additions/deletions, a real worker in Chrome DevTools Threads, EN/RU localization, and no worker-related console errors.
- [x] PWA: native production-only Service Worker registration, a Next.js Web App Manifest with square 192×192/512×512 PNG any/maskable icons, and a localized `/offline` fallback are implemented. The worker caches only same-origin static assets and the offline shell; it bypasses navigations except for network-fallback handling, `/api/*`, Socket.IO, mutations, and cross-origin resources. Manifest, registration, routing-rule, and offline-shell tests passed; TypeScript, ESLint, 115 unit tests, Prettier, diff, and production-build verification passed. Browser verification confirmed the manifest and PNG icons load without errors, the Service Worker is active, offline navigation shows the localized fallback, and PWA installation plus standalone launch work.
- [ ] Event-driven architecture demonstration with named events and at least two meaningful consumers; durable distributed delivery is optional.
- [~] Frontend optimization: code uses Next.js, next/image, locale-aware Intl formatting, and memoized derived data. Document the demonstrated optimizations and lazy-loading result; formal benchmark targets are optional.
- [x] Task-runner foundation: development, build, lint, formatting, unit-test, and database scripts exist. Add feature-specific scripts only with their corresponding deliverables.
- [ ] Add one real integration test and one browser-level functional workflow; exhaustive test suites are optional.

## Phase F — Middle+ demonstrations

- [ ] Document an architecture proposal for **1,000,000 messages and 100,000 users per 24 hours**, including assumptions, independently scalable boundaries, observability, and failure handling. Capacity math, brokers, and production deployment are optional depth.
- [x] Minimal real microservice boundary: the separately deployed C.5 Socket.IO service has an independently runnable process, typed `sessions:update` contract, health endpoint, and Vercel Preview integration.
- [ ] Minimal real microfrontend: independently built/deployed feature integrated through a clear interface, not merely another React component.
- [ ] Actual WebAssembly module invoked from the frontend, including what it computes and why.
- [ ] Distinguish implemented code from architecture proposals and partial demos.

## Phase G — Delivery artifacts

- [~] Git repository and remote were previously reported; confirm branch history and the final repository URL before handoff.
- [~] Docker Compose includes a manually verified local MySQL 8 service with persistent storage; Dockerfile(s) and a containerized application are still missing.
- [x] MySQL-compatible Drizzle migration and the exported `database/schema.sql` artifact are manually verified for orders, products, relationships, indexes, and checks; the SQL opens in MySQL Workbench 26.10. No native `.mwb` model or EER diagram is provided.
- [~] Replace the default README with project architecture, prerequisites, setup, commands, verified deployment URL, features, and trade-offs; local and Preview setup is documented, while final production handoff details remain pending.
- [ ] Perform the assignment self-check: start the project from a clean clone by following the finished README.
- [ ] Record a final reviewer walkthrough video showing working features and candidly explaining deliberately omitted or partial details.
- [ ] Review production deployment from a private/incognito window.
- [ ] Confirm no secrets, credentials, or personal data are committed.

## Final verification commands

Run after the relevant deliverables exist:

    npm run format:check
    npm run lint
    npx tsc --noEmit
    npm run build
    npm audit --omit=dev
    git status

Add unit, integration, E2E, API, Socket.IO, and Docker commands only when their respective tooling and deliverables are implemented.

## Decision log

| Date       | Decision                                                            | Reason                                                                                                       |
| ---------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 2026-10-19 | Rename app to orders-hub                                            | Clear, concise project name                                                                                  |
| 2026-10-19 | Use Next.js App Router + TypeScript                                 | Modern React framework with server/client component boundaries                                               |
| 2026-10-19 | Skip Tailwind; use Bootstrap + BEM-oriented SCSS                    | Assignment requirement                                                                                       |
| 2026-10-19 | Avoid npm audit fix --force                                         | Suggested fix would downgrade incompatible lint tooling                                                      |
| 2026-10-19 | Publish minimal app before building features                        | Obtain a testable public URL early                                                                           |
| 2026-10-19 | Use typed local mock data for Phase B                               | Preserve a functional UI before introducing an API                                                           |
| 2026-10-19 | Use Context and reducer for Phase B state                           | Keep routes synchronized and allow later replacement by Redux/API                                            |
| 2026-10-21 | Move shared dashboard shell into (dashboard) App Router route group | Preserve URLs/state while clarifying root versus dashboard responsibilities                                  |
| 2026-10-21 | Keep layout styles in SCSS Modules; retain feature styles globally  | Localize layout styles without rewriting working BEM feature styles                                          |
| 2026-10-21 | Use local PNG assets for header logo and Sidebar avatar             | Match supplied references and remove unused starter assets                                                   |
| 2026-10-21 | Defer Redux/API/Socket.IO until local UI state has been audited     | Avoid replacing stable UI behavior before contracts and migration plan exist                                 |
| 2026-10-22 | Verify local MySQL 8 Compose foundation                             | mysql:8.4 is healthy on 127.0.0.1:3307 with InnoDB, application-user access, and persistent storage          |
| 2026-10-22 | Use Drizzle ORM with mysql2 for the initial local schema            | Keep schema and generated MySQL migrations typed without replacing Phase B mock runtime                      |
| 2026-10-22 | Apply and verify the initial Drizzle migration                      | Confirm the schema, cascade relationship, indexes, and checks before adding API or frontend data integration |
| 2026-10-27 | Replace Context state with Redux Toolkit inventorySlice             | Meet the global-state requirement while retaining verified local Orders and Products behavior                |

## Next actionable task

**Phase D — implement the interactive map demonstration with a documented inventory/service-location use case.**

The database schema deliverable, C.5 active-session counter, SSR, i18n, Web Storage, JWT, Lazy Loading, and Charts implementation deliverables are complete. The remaining Junior+ demonstrations follow.

## Progress update template

After every phase, update:

- **Completed:** concrete files/features and commands verified.
- **Remaining:** unchecked or partially checked requirements.
- **Blocked:** issue, reproduction steps, and owner.
- **Next task:** one immediate, reviewable action.
- **Deployment:** current live URL and last successful production verification.

# Orders Hub — Development Workflow

> Working roadmap for the dZENcode React / Next.js Middle+ test assignment.
> Status legend: [x] implemented and supported by source or recorded manual verification; [~] implemented in part or needs browser/integration verification; [ ] not implemented. Do not mark a requirement complete solely because it is listed here.

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
- Routes: /orders, /products, /groups, /users, /settings; Groups, Users, and Settings intentionally render an under-construction page
- Repository workflow: main is stable, develop is integration, and feature/* branches are implementation branches. The current checkout was not verified during this source-only audit.
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
- [~] Git workflow: repository/remote/branch workflow was previously reported, but branch history and current checkout were not rechecked in this audit.
- [~] Docker: the local MySQL 8 Compose service was manually verified healthy. It runs on 127.0.0.1:3307 with the dedicated application user, InnoDB, and persistent named volume; the application container is still missing.
- [ ] WebSocket active-tab counter: TopMenu deliberately shows Sessions: unavailable; no Socket.IO or WebSocket server/client exists.
- [~] Screenshot-based HTML/CSS: desktop UI structure and local assets are implemented; visual parity and all responsive breakpoints still need browser review.

### Baseline deliverables still missing

- [ ] Socket.IO active-session counter.
- [ ] Docker environment.
- [ ] MySQL Workbench-compatible database schema.
- [~] README is still the create-next-app template and does not document Orders Hub installation, architecture, features, or deployment.
- [~] Public deployment was reported earlier but needs a final private/incognito verification before handoff.

## Phase A — Foundation, GitHub, Vercel

- [x] Project scaffold, TypeScript, ESLint, Sass, Bootstrap, src directory, and @/* alias are present.
- [x] GitHub remote and initial Vercel deployment were reported as configured.
- [~] Branch strategy (main, develop, feature/*) is documented; verify the active branch and remote history before the next commit or release.
- [~] Reconfirm the public deployment URL and its production build before final delivery.

**Done when:** the GitHub repository, branch workflow, and public deployment are rechecked from the actual remote and a documented deployment URL is available in the finished README.

## Phase B — Core Orders & Products interface

- [x] Bootstrap and Sass are installed; shared tokens and BEM-oriented styles are defined.
- [x] Shared dashboard shell: Sidebar, TopMenu, local avatar/logo assets, global search, current date/time, and responsive mobile navigation.
- [x] App Router organization: (dashboard) owns the Redux provider and shared shell while root layout remains server-oriented and contains global metadata/styles.
- [x] Navigation: functional /orders and /products links with active state; Groups, Users, and Settings are explicit under-construction routes.
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
- [ ] Import/review the schema in MySQL Workbench and provide the final MySQL Workbench-compatible schema-model deliverable.

### C.4 REST and RTK Query integration

- [x] Implement and verify REST endpoints for Orders and Products listing, creation, deletion, `orderId` product filtering, and validation errors; order deletion relies on the database foreign-key cascade.
- [x] Add an RTK Query API layer to load persisted Orders and Products and perform create/delete mutations; cache invalidation refreshes both datasets after an order deletion cascade.
- [x] Replace runtime mock data and mutations with RTK Query requests while retaining global search, local product filters, dialogs, details, confirmations, focus, and animations; add loading/error/retry/empty states, initial skeleton layouts, and focused API/query tests.

### C.5 Real-time active sessions

- [ ] Build a separate Socket.IO/WebSocket service that counts connected browser tabs/sessions and broadcasts updates.
- [ ] Replace the honest Sessions: unavailable placeholder with live data, reconnection handling, allowed origins, and environment configuration.
- [ ] Deploy the real-time service separately; Vercel serverless functions are not a persistent Socket.IO host.

## Phase D — Junior+ requirements

- [x] TypeScript: strict project configuration and typed domain/UI code are present.
- [~] SSR via Next.js: App Router/server layouts are in use, but no explicit SSR data-fetching or documented SSR demonstration exists yet.
- [ ] Unit tests for domain calculations/components.
- [ ] Internationalization with at least two languages and translated UI labels.
- [ ] Minimal real JWT authentication demo; never expose secrets in the browser.
- [ ] Web Storage example with documented persistence behavior.
- [ ] Lazy-loaded noncritical feature.
- [ ] Chart based on order/product data.
- [ ] Interactive map with meaningful data use case.

## Phase E — Middle requirements

- [ ] Graph data structure and graph-algorithm demonstration, with explanation.
- [ ] Functional GraphQL endpoint/query alongside REST.
- [ ] Web Worker used for a CPU-heavy task, with a main-thread comparison.
- [ ] PWA manifest, icons, service-worker/offline behavior, and installability test.
- [ ] Event-driven architecture demonstration with named domain events and consumers.
- [~] Frontend optimization: code uses Next.js, next/image, cached Intl formatters, and memoized derived data, but no performance measurements or documented optimization results exist.
- [~] Task-runner scripts: dev, build, start, lint, format, and format:check exist; test and integration scripts do not.
- [ ] Integration tests and browser-level functional tests.

## Phase F — Middle+ demonstrations

- [ ] Architecture proposal for **1,000,000 messages and 100,000 users per 24 hours**: assumptions, traffic peaks, capacity math, queue/broker, scaling, observability, and failure modes.
- [ ] Minimal real microservice boundary with an independently runnable service and documented contract.
- [ ] Minimal real microfrontend: independently built/deployed feature integrated through a clear interface, not merely another React component.
- [ ] Actual WebAssembly module invoked from the frontend, including what it computes and why.
- [ ] Distinguish implemented code from architecture proposals and partial demos.

## Phase G — Delivery artifacts

- [~] Git repository and remote were previously reported; confirm branch history and the final repository URL before handoff.
- [~] Docker Compose includes a manually verified local MySQL 8 service with persistent storage; Dockerfile(s) and a containerized application are still missing.
- [~] Initial MySQL-compatible Drizzle migration is applied and manually verified for orders, products, relationships, indexes, and checks; MySQL Workbench import/review and a final model deliverable remain pending.
- [ ] Replace the default README with project architecture, prerequisites, setup, commands, verified deployment URL, features, and trade-offs.
- [ ] Perform the assignment self-check: start the project from a clean clone by following the finished README.
- [ ] Record a demo video showing working features and candidly explaining incomplete requirements.
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

**Phase C.3 — import and review the existing orders/products schema in MySQL Workbench, then provide the final schema-model deliverable.**

The application now uses a verified RTK Query connection to the persisted Orders and Products API; this schema-model review completes the remaining database-design deliverable.

## Progress update template

After every phase, update:

- **Completed:** concrete files/features and commands verified.
- **Remaining:** unchecked or partially checked requirements.
- **Blocked:** issue, reproduction steps, and owner.
- **Next task:** one immediate, reviewable action.
- **Deployment:** current live URL and last successful production verification.

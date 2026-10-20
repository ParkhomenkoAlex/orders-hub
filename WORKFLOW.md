# Orders Hub — Development Workflow

> Temporary working checklist for the dZENcode React / Next.js Middle+ test assignment.
> Update this file after every completed phase. Remove it from the public repository before final handoff if it contains temporary notes.

## Project snapshot

- App: **orders-hub**
- Local directory: `~/orders-hub`
- Framework: Next.js 16.4.2 (App Router), React, TypeScript
- Package manager: npm; Node.js 22.23.2
- Styling: Bootstrap + SCSS using BEM conventions (implemented; Tailwind not selected)
- Repository: GitHub remote configured; branches `main`, `develop`, and `feature/app-layout` established
- Deployment: initial Vercel production deployment is publicly accessible

### Verified 2026-10-19

- [x] Scaffold generated with `create-next-app`
- [x] Project renamed from `dzencode-orders-products` to `orders-hub`
- [x] Local dev server starts; `/` returns HTTP 200
- [x] `npm audit --omit=dev` reports **0 vulnerabilities**
- [x] `npm run build` succeeds, including TypeScript checks
- [x] WORKFLOW.md added to local repository
- [x] Initial Git commit made after rename
- [x] GitHub remote configured and pushed
- [x] Vercel deployment accessible publicly

### Verified 2026-10-20

- [x] `npx tsc --noEmit`, `npm run lint`, and the production build complete successfully.
- [x] Manual Phase B checks: creating orders/products, recalculating product counts and USD/UAH totals, and preserving local state while navigating between Orders and Products.
- [x] Manual Phase B checks: cascading order deletion with related products; Type filtering, global search, and their combination.
- [x] Manual Phase B checks: Escape dismissal, focus restoration, and basic keyboard interaction in dialogs.
- [~] Responsive review completed only at a surface level; mobile and tablet layouts still require refinement.
- [~] Route and details-panel animations are implemented and require visual polish.

### Security note

`npm audit` currently reports five high-severity findings along the development-tooling chain `eslint-config-next -> @next/eslint-plugin-next -> fast-glob -> micromatch -> braces`. `npm audit --omit=dev` reports zero findings. Do **not** run `npm audit fix --force` without reviewing its proposed breaking downgrade to ESLint config for Next.js 14. Reassess when compatible dependency fixes become available.

## Phase A — Foundation, GitHub, Vercel

1. Add this file to the repository root (`~/orders-hub/WORKFLOW.md`).
2. Inspect `git status` and run `npm run build` again if code changes.
3. Stage and commit:
    ```bash
    git add package.json package-lock.json WORKFLOW.md
    git commit -m "chore: initialize Orders Hub project"
    ```
    Note: create-next-app already created an initial Git commit; this is the next commit.
4. Create an empty GitHub repository named `orders-hub` (do not initialize README/license if pushing an existing repository).
5. Connect and push, substituting your real GitHub URL:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/orders-hub.git
    git push -u origin main
    ```
6. In Vercel: **Add New > Project > Import `orders-hub` > Deploy**. Use the Next.js preset and repository root. No environment variables are needed for the starter page.
7. Verify the deployed URL loads and save it in README.

**Done when:** `main` exists on GitHub and a public Vercel URL loads the application.

## Phase B — Core Orders & Products interface

- [x] Install Bootstrap and Sass; define shared tokens and BEM naming.
- [x] Shared layout: navigation, top bar, and current date/time.
- [ ] Complete responsive QA and refine the mobile/tablet layouts; desktop layout is implemented, but smaller viewports need follow-up.
- [x] Orders page: order title, number of products, dates in two formats, USD/UAH totals.
- [x] Order selection shows related product details in adjacent panel; panel can be closed.
- [x] Delete-order action opens a confirmation modal.
- [x] Products page: product rows, type filter, warranty dates, both currency prices, parent order name.
- [x] Subtle route and details-panel animations are implemented.
- [ ] Polish route/details-panel animation timing and visual transitions after browser review.
- [x] Empty states are implemented; basic dialog keyboard interaction, Escape dismissal, and focus restoration were manually checked.
- [ ] Complete keyboard and assistive-technology accessibility review across layouts and controls; loading/error states are deferred until API integration.
- [x] Shared local client state keeps Orders and Products synchronized; deletion cascades to related products.
- [x] Accessible delete dialog with focus handling, keyboard trap, Escape, and focus restoration.
- [x] Search and product type filtering use the current shared client state.

**Data correctness:** filter products by their `order` foreign key; do not copy the sample app.js behavior that associates every product with every order. Sample data may need syntax fixes.

## Phase C — Data, state, API and real-time presence

- [x] Define TypeScript models for orders, products, prices and warranties.
- [ ] Redux Toolkit store and RTK Query or equivalent REST client.
- [ ] REST endpoints for orders/products and basic mutations; validate inputs.
- [ ] Decide backend/database approach and document it.
- [ ] Real Socket.IO server counts connected browser tabs/sessions and broadcasts updates.
- [ ] Show the live tab/session count in TopMenu.
- [ ] Deploy the Socket.IO server separately (Vercel serverless functions do not host persistent Socket.IO connections reliably).
- [ ] Configure allowed origins, reconnection behavior and environment variables.

## Phase D — Junior+ requirements

- [ ] SSR via Next.js where it genuinely applies.
- [ ] Internationalization: at least two languages, including translated UI labels.
- [ ] Minimal real JWT authentication demo; do not expose secrets in the browser.
- [ ] Web Storage example with documented persistence behavior.
- [ ] Lazy-loaded noncritical feature.
- [ ] Recharts chart based on order/product data.
- [ ] Interactive map with a meaningful data use case.
- [ ] Unit tests for domain calculations/components.

## Phase E — Middle requirements

- [ ] Graph data structure and graph algorithm demonstration, with explanation.
- [ ] Functional GraphQL endpoint/query, alongside REST.
- [ ] Web Worker used for a CPU-heavy task, with a main-thread comparison.
- [ ] PWA manifest, icons, service-worker/offline behavior; test installability.
- [ ] Event-driven architecture demo: named domain events and consumers.
- [ ] Document frontend performance optimizations with measurements.
- [ ] npm scripts for lint/test/build and other repetitive tasks.
- [ ] Integration tests and browser-level functional tests.

## Phase F — Middle+ demonstrations

- [ ] Architecture proposal for **1,000,000 messages and 100,000 users per 24 hours**: assumptions, traffic peaks, capacity math, queue/broker, scaling, observability, failure modes.
- [ ] Minimal real microservice boundary, with an independently runnable service and a documented contract.
- [ ] Minimal real microfrontend: independently built/deployed feature integrated via a clear interface (not merely another React component).
- [ ] Actual WebAssembly module invoked from the frontend; show what it computes and why.
- [ ] Distinguish implemented code from architectural proposals and partial demos.

## Phase G — Delivery artifacts

- [ ] Dockerfile(s) and Docker Compose for local startup; verify with actual commands.
- [ ] MySQL Workbench-compatible schema SQL / model deliverable (orders, products, relationships, keys).
- [ ] README: architecture, prerequisites, environment setup, commands, deployment links, trade-offs.
- [ ] Record demo video showing working features and candidly explaining unimplemented requirements.
- [ ] Review deployment from a private/incognito window.
- [ ] Confirm no secrets, credentials or personal data are committed.

## Final verification commands

```bash
npm run build
npm audit --omit=dev
git status
```

Add lint, unit, integration and E2E commands after their scripts are implemented. Run Docker checks only after Docker configuration exists.

## Decision log

| Date       | Decision                                     | Reason                                                                     |
| ---------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| 2026-10-19 | Rename app to `orders-hub`                   | Clear, concise project name                                                |
| 2026-10-19 | Use Next.js 16 App Router + TypeScript       | Modern React framework with SSR support                                    |
| 2026-10-19 | Skip Tailwind, use Bootstrap + BEM           | Assignment requirement                                                     |
| 2026-10-19 | Avoid `npm audit fix --force`                | Suggested fix would downgrade incompatible lint tooling                    |
| 2026-10-19 | Publish minimal app before building features | Obtain testable public URL early                                           |
| 2026-10-19 | Use typed local mock data for Phase B        | Preserve a functional UI without prematurely adding an API or global store |
| 2026-10-19 | Use Context and reducer for Phase B state    | Keeps current routes consistent and can be replaced by Redux/API later     |

## Progress update template

After every phase, update:

- **Completed:** concrete files/features/commands verified.
- **Remaining:** unchecked items.
- **Blocked:** issue, reproduction steps and owner.
- **Next command:** one immediate action.
- **Deployment:** current live URL and last successful build.

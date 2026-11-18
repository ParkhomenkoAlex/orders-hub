# Orders Hub reviewer guide

This guide is the handoff entry point for evaluating the dZENcode Middle+
technical assignment. It distinguishes recorded verification from configuration
that a reviewer can reproduce. It does not include credentials, database
connection strings, or private service configuration.

## 1. Evaluation overview

- **Repository:** <https://github.com/ParkhomenkoAlex/orders-hub>
- **Final submission branch:** [`develop`](https://github.com/ParkhomenkoAlex/orders-hub/tree/develop)
- **Public application:** <https://orders-hub-git-develop-alex-team16.vercel.app>
- **Primary workflow:** <https://orders-hub-git-develop-alex-team16.vercel.app/orders>
- **Realtime endpoint:** <https://orders-hub-realtime.onrender.com>

Orders Hub is an Orders/Products inventory dashboard. It demonstrates the
cumulative technologies in [`REQUIREMENTS.md`](../REQUIREMENTS.md) through
focused working examples. It is not presented as a production-scale inventory
or identity platform. The Next.js app is deployed on Vercel Preview, uses Aiven
MySQL for Preview persistence, and connects to a separately deployed Render
Socket.IO service for active-tab presence.

The Render URL is an HTTP/WebSocket service endpoint, not a normal website.
`GET /` may return `404`; use the browser tab-count workflow below or `GET
/health` to assess the service. The realtime protocol accepts **WebSocket only**
and broadcasts `sessions:update` events containing `{ count: number }`.

## 2. Environment matrix

| Capability                  | Local development                              | Local Docker                         | Public Preview                       | Notes                                                      |
| --------------------------- | ---------------------------------------------- | ------------------------------------ | ------------------------------------ | ---------------------------------------------------------- |
| Orders and Products         | Available with local MySQL                     | Available with Compose MySQL         | Verified November 18, 2026           | Preview uses Aiven MySQL.                                  |
| REST API                    | Available at `/api/*`                          | Available at `/api/*`                | Available through Preview            | Inventory endpoints are intentionally public.              |
| GraphQL                     | Available at `POST /api/graphql`               | Available                            | Expected through Preview             | Read-only schema.                                          |
| JWT Settings demo           | Configure local `AUTH_*` variables             | Configure runtime `AUTH_*` variables | Configured and historically verified | Only `/settings` is protected.                             |
| Socket.IO sessions          | Run `npm run realtime:dev`                     | Run service separately on host       | Verified with Render                 | Counts browser-tab connections, not people.                |
| Charts, graph, Worker, WASM | Available after data loads                     | Available                            | Expected through Preview             | Products needs data for meaningful analytics.              |
| Service Locations map       | Configure JWT and open `/settings`             | Same                                 | Configure Preview JWT account        | Uses OpenStreetMap tiles.                                  |
| PWA                         | Production build only                          | Available in app container           | Available over HTTPS                 | Registration is intentionally disabled in dev mode.        |
| EN/RU localization          | Available                                      | Available                            | Available                            | TopMenu selector persists locale in a cookie.              |
| Microfrontend               | Local bundle fallback available                | Included in image                    | Included in host asset set           | Public independently hosted remote bundle is not verified. |
| Event-driven demonstration  | Observable in server logs after Order creation | Observable in app logs               | Server-side only                     | In-process, synchronous, at-most-once.                     |

“Expected” means the implementation is environment-neutral but this guide does
not claim a new browser run for that exact environment. The recorded public
verification covers Preview access, Aiven persistence, Render origin/handshake,
cross-tab presence, and the listed clean-clone/Docker checks in section 11.

## 3. Prerequisites

- Node.js **22**. Clean-clone QA used Node.js 22.23.2.
- npm (the committed `package-lock.json` is used with `npm ci`).
- Docker Desktop with Docker Compose for local MySQL, Docker application
  testing, or the isolated integration/browser-test database.
- A local `.env` based on [`.env.example`](../.env.example). Replace the local
  MySQL password placeholders; do not commit the resulting file.

No Aiven credentials are required for local development. The local database and
the remote Preview database are separate. The static map tiles come from
OpenStreetMap, and the public active-session count depends on Render.

## 4. Local setup from a clean clone

```bash
git clone https://github.com/ParkhomenkoAlex/orders-hub.git
cd orders-hub
git checkout develop
npm ci
cp .env.example .env
```

Edit `.env` and replace `MYSQL_PASSWORD` and `MYSQL_ROOT_PASSWORD`. Keep the
application password embedded in `DATABASE_URL` aligned with `MYSQL_PASSWORD`.
The example targets the local Compose database at `127.0.0.1:3307`.

Start MySQL and migrate a newly initialized local database:

```bash
docker compose up -d mysql
npm run db:migrate
```

Start the web application and active-tab service in separate terminals:

```bash
npm run dev
```

```bash
npm run realtime:dev
```

Open <http://localhost:3000/orders>. The default local realtime URL is
`http://localhost:3001`, and the default allowed browser origin is
`http://localhost:3000`.

### Local Settings/JWT demonstration

`/settings` redirects to `/login` until the three server-only values below are
configured in `.env`:

```text
AUTH_DEMO_USERNAME
AUTH_DEMO_PASSWORD
AUTH_JWT_SECRET
```

The signing secret must have at least 32 bytes of UTF-8 data. Use your own
local demonstration credentials; they are not supplied by the repository. A
successful form login creates an HTTP-only cookie and redirects to `/settings`.
Orders, Products, REST, and GraphQL intentionally remain public.

### Common local issues

- **Database connection refused:** wait for `docker compose ps` to show the
  MySQL service as healthy; confirm `.env` still targets `127.0.0.1:3307`.
- **Migration fails:** use `npm run db:migrate` only for the local
  `DATABASE_URL`. Do not substitute an Aiven URI.
- **Sessions unavailable:** start `npm run realtime:dev`, keep the browser at
  `http://localhost:3000`, and ensure `REALTIME_ALLOWED_ORIGINS` contains that
  exact origin without a trailing slash.
- **Authentication unavailable:** restart the Next.js development server after
  changing `.env`; check that all three `AUTH_*` values are present without
  printing them.
- **PWA does not register in development:** this is intentional; use a
  production build, Docker, or the HTTPS Preview.

## 5. Docker setup

[`compose.yaml`](../compose.yaml) starts only the persistent MySQL 8.4 service.
[`compose.app.yaml`](../compose.app.yaml) is an optional overlay that adds the
Next.js application container. The tracked defaults are app port `3000` and
host-only MySQL port `3307`.

1. Create `.env` as in the local setup. Keep `DOCKER_DATABASE_URL` aligned with
   the local application password, but use the Compose hostname `mysql:3306`.
   `127.0.0.1:3307` is correct only for a host-running app.
2. Start the database and wait for its health check:

    ```bash
    docker compose up -d mysql
    ```

3. For a newly created local database, run the migration once from the host:

    ```bash
    npm run db:migrate
    ```

4. Build and run the app overlay:

    ```bash
    docker compose -f compose.yaml -f compose.app.yaml up --build app
    ```

5. Open <http://localhost:3000/orders>. Check status with:

    ```bash
    docker compose -f compose.yaml -f compose.app.yaml ps
    ```

6. Stop services without deleting the `mysql_data` volume:

    ```bash
    docker compose -f compose.yaml -f compose.app.yaml down
    ```

Do not add `-v` unless intentionally deleting local database data. If port 3000
or 3307 is already occupied, stop the conflicting process or adjust the tracked
Compose port mapping and matching local environment values deliberately. The
app image does not contain MySQL, migrations, test tooling, or the standalone
Socket.IO process.

## 6. Public deployment walkthrough

Open the public Preview in a normal or incognito browser:

<https://orders-hub-git-develop-alex-team16.vercel.app/orders>

On November 18, 2026, Vercel Authentication was disabled for this deployment.
An order created through the public Preview remained after refresh, confirming
remote Aiven MySQL persistence. Aiven is a private application dependency; its
connection details are intentionally not exposed here. As free-tier
infrastructure, it can have startup or availability delays; this is an
operational possibility, not an observed failure in the recorded verification.

The public realtime service is
<https://orders-hub-realtime.onrender.com>. Recorded verification on the same
date confirmed a `101 Switching Protocols` WebSocket upgrade and the correct
`Access-Control-Allow-Origin` response for the Preview origin. An unapproved
origin was rejected. Do not use Engine.IO polling as a health test: the service
is configured for WebSocket transport only.

## 7. Feature-by-feature QA checklist

### Orders

- **Route:** `/orders`.
- **Steps:** create an Order with the plus button; select its card to open the
  detail panel; add a Product from that panel; refresh; then use the delete
  control and confirm the modal.
- **Expected:** the initial list is server-rendered at request time; RTK Query
  manages later API reads/mutations. The created Order and Product persist;
  deleting an Order removes its related Products through MySQL cascade delete.
  Global search in the TopMenu matches Orders and associated Product data.
- **Scope note:** the UI does not implement an Order edit/update workflow,
  pagination, or a dedicated sort control.

### Products and Type-filter storage

- **Route:** `/products`.
- **Steps:** inspect Product rows and related Order titles; choose a Type;
  refresh or navigate away and back; choose All Types; delete a Product through
  its confirmation dialog.
- **Expected:** Type uses canonical domain values, persists in browser native
  `localStorage`, and clears when All Types is selected. The Specification
  filter is intentionally not persisted. Product rows show localized labels,
  dates, and currencies.

### REST API

The browser uses RTK Query; Next.js route handlers implement the REST API.
Inventory endpoints are public by intentional demo scope.

| Method   | Endpoint                   | Safe reviewer check                             |
| -------- | -------------------------- | ----------------------------------------------- |
| `GET`    | `/api/orders`              | `curl -i http://localhost:3000/api/orders`      |
| `POST`   | `/api/orders`              | Use the Add Order UI; accepts validated JSON.   |
| `DELETE` | `/api/orders/:orderId`     | Use the delete modal or a test-created ID only. |
| `GET`    | `/api/products`            | `curl -i http://localhost:3000/api/products`    |
| `POST`   | `/api/products`            | Use the Add Product UI for a selected Order.    |
| `DELETE` | `/api/products/:productId` | Use the delete modal or a test-created ID only. |

Route handlers return a `data` wrapper for successful responses. Invalid JSON,
validation failures, missing parent Orders, and missing deletion targets return
documented HTTP errors without exposing database configuration.

### GraphQL

- **Endpoint:** `POST /api/graphql`; no explorer is included.
- **Authentication:** none; GraphQL is read-only and follows the same deliberate
  public demo scope as REST.
- **Supported fields:** `orders`, `order(id: ID!)`, `products`, `product(id:
ID!)`, including `Order.products`.

```bash
curl http://localhost:3000/api/graphql \
  -X POST \
  -H 'Content-Type: application/json' \
  --data '{"query":"query { orders { id title createdAt products { id title type status } } }"}'
```

```bash
curl http://localhost:3000/api/graphql \
  -X POST \
  -H 'Content-Type: application/json' \
  --data '{"query":"query OrderById($id: ID!) { order(id: $id) { id title products { id title } } }","variables":{"id":"<order-id>"}}'
```

There are no GraphQL mutations.

### JWT demonstration and Service Locations map

- **Routes:** `/login` and `/settings`.
- **Prerequisite:** configure local or Preview `AUTH_DEMO_USERNAME`,
  `AUTH_DEMO_PASSWORD`, and `AUTH_JWT_SECRET` without publishing values.
- **Steps:** visit `/settings` while anonymous; log in with the configured demo
  account; verify protected Settings content; submit Logout.
- **Expected:** anonymous, malformed, or expired sessions redirect to `/login`.
  The signed token is held only in an HTTP-only cookie. Settings contains the
  Service Locations map; select Kyiv, Cherkasy, or Lviv from the accessible
  list, use marker popups, and switch EN/RU. The list remains usable while the
  Leaflet map is loading or fails.

### Socket.IO active sessions

- **Public route:** open the Preview Orders page in three browser tabs.
- **Steps:** keep all three connected, then close one and refresh another.
- **Expected:** TopMenu shows the number of active **application-tab
  connections**; recorded Preview verification showed `3` for three tabs.
  Navigation between Orders and Products does not create an extra session. On
  service loss, the UI clears the count and shows reconnecting/unavailable
  rather than a stale number.
- **Recorded additional Preview observation:** an Order created in one tab was
  visible in another without manual refresh. The code-level Socket.IO contract
  remains limited to active-session updates; do not interpret this observation
  as a separate documented `order.created` socket event.

### Chart, graph, Web Worker, and WebAssembly

- **Route:** `/products` for all three Product analytics demonstrations.
- **Chart:** Product Type Chart shows counts by canonical Product Type. Click a
  bar to filter the table; click the selected bar again to reset. Zero counts
  have no green fill.
- **Web Worker:** Inventory Analytics calculates total Orders/Products and
  Product Type/Status aggregates off the main thread. Add/delete Products and
  confirm the summary changes; Chrome DevTools Threads can show the worker.
- **WebAssembly:** Inventory Value sums live Product USD amounts with the real
  `/wasm/inventory-value.wasm` module and identifies a JavaScript fallback if
  the module cannot load. It makes no speed claim.
- **Graph:** `/orders` includes a lazily loaded Orders-to-Products SVG graph.
  Select nodes or relationship-list buttons to inspect relationships.

### PWA

Use the HTTPS Preview, Docker container, or `npm run build` followed by
`npm run start`; registration is disabled in development. In browser DevTools
Application, check the manifest and activated Service Worker. Offline navigation
uses the localized `/offline` fallback. API, GraphQL, authenticated content,
mutations, and Socket.IO traffic are intentionally not cached for offline use.

### Microfrontend

The Orders page contains the read-only Order Status Summary, a Shadow DOM web
component loaded as an ES module. It receives aggregate live data and localized
labels from the host; it has no React runtime, credentials, or database access.
The host uses the local fallback asset by default. For independent development:

```bash
npm run build:microfrontend
```

See [the microfrontend guide](microfrontend-order-status-summary.md) for the
contract and optional separately hosted bundle procedure. Local independent
hosting was verified; public remote hosting has not been verified.

### Internationalization and EDA

- Use the TopMenu `EN`/`RU` selector. Labels update immediately, the locale is
  persisted in a cookie, and `<html lang>` follows the selected locale.
- Creating an Order emits the typed server-side `order.created` event **after**
  persistence. It has independent structured audit-log and in-process telemetry
  consumers. In local server output, look for a structured record whose message
  is `Domain event processed`. Consumer failures do not change a successful
  REST response. Delivery is intentionally synchronous, in-memory, and
  at-most-once; it is not a durable broker.

## 8. Automated checks

Run from the repository root:

```bash
npm run format:check
npm run lint
npx next typegen
npx tsc --noEmit
npm run test:unit
npm run build
npm audit --omit=dev
```

The recorded clean-clone QA run on November 18, 2026 passed `npm ci`, lint,
TypeScript after Next.js type generation, **134 unit tests in 53 files**, and
the production build. The build emitted nonblocking Bootstrap Sass deprecation
warnings. `npm audit --omit=dev` reported zero production dependency
vulnerabilities; a development-inclusive audit is a different result.

### Isolated integration and browser tests

These tests create and remove data only in a dedicated local test database.
Never point `TEST_DATABASE_URL` at Aiven, Preview, production, or the normal
development database.

```bash
cp test.env.example .env.test
# Replace the test password placeholders in .env.test.
docker compose --env-file .env.test -f compose.test.yaml up -d mysql-test
npm run db:migrate:test
npm run test:integration
npx playwright install chromium
npm run test:browser
```

The integration test covers database-backed API validation, persistence, and
Order-delete cascade. The Playwright Chromium test creates an Order and Product
through the UI, reloads to prove persistence, deletes the Order, and checks the
product cleanup. The browser runner uses `127.0.0.1:3100` and an isolated Next
output directory.

## 9. Database schema inspection

[`database/schema.sql`](../database/schema.sql) is the MySQL Workbench-compatible
DDL export required by the assignment. Drizzle schema and versioned migrations
remain the source of truth. [The database artifact guide](../database/README.md)
explains how to open the SQL in MySQL Workbench 26.10 and, separately, how to
execute it only against a new empty temporary database. There is no native
`.mwb` model or EER diagram.

## 10. Troubleshooting and service limits

- **Preview database unavailable:** Aiven is external free-tier infrastructure;
  wait for service recovery and retry a safe page load. Do not attempt remote
  migrations from the browser or expose connection values.
- **Render starts slowly:** Free Render services can suspend when inactive.
  During startup, the client should show reconnecting/unavailable; it must not
  display a stale session count.
- **Render root returns 404:** expected for this Socket.IO service. Use `/health`
  or a browser WebSocket connection from an allowed origin.
- **Socket origin rejected:** match the exact scheme, host, and port in
  `REALTIME_ALLOWED_ORIGINS`; no wildcard origin is used in public deployment.
- **PWA appears stale:** use DevTools Application to unregister/update the
  worker during local testing. The service worker intentionally caches only
  same-origin static resources and the offline shell.
- **Docker port collision:** see section 5; do not delete volumes merely to
  resolve a port conflict.

## 11. Recorded QA evidence

### Clean clone — November 18, 2026

- `npm ci`, lint, TypeScript after Next.js type generation, 134 unit tests in
  53 files, and production build passed.
- Bootstrap Sass deprecation warnings were nonblocking.
- `npm audit --omit=dev` reported zero production vulnerabilities.

### Docker QA

- An isolated Docker Compose project started Next.js and MySQL, applied
  migrations, returned HTTP 200 for Orders, created an Order, and verified
  persistence in its QA MySQL database.
- The temporary QA override used ports 3001/3308 and is not a tracked
  repository file. Normal reviewer commands are those in section 5.

### Public Preview and realtime — November 18, 2026

- Preview was accessible in incognito with Vercel Authentication disabled.
- A created Order persisted after browser refresh through remote Aiven MySQL.
- Render accepted an allowed-origin WebSocket upgrade with HTTP 101 and CORS,
  rejected an unapproved origin, and showed a three-tab active-session count.

These are selected verification records, not a claim that every possible
feature scenario or infrastructure failure mode has been exhaustively tested.

## 12. Final reviewer checklist

- [ ] Open the public Preview `/orders` route without a Vercel login.
- [ ] Create an Order, add a Product, refresh, then confirm that deleting the Order
      removes its Products.
- [ ] Check Products filters, chart interaction, Worker analytics, and WASM
      source/fallback indicator.
- [ ] Switch EN/RU and refresh to verify locale persistence.
- [ ] Open three Preview tabs to assess active-tab presence.
- [ ] Configure local JWT demo credentials and assess `/login` → `/settings` →
      logout.
- [ ] Review map selection, graph node selection, PWA manifest/service worker,
      and microfrontend fallback.
- [ ] Run the automated checks and, if needed, isolated integration/browser
      test workflow.
- [ ] Review [the scalability proposal](scalability-architecture.md) as a
      proposal, not deployed infrastructure.

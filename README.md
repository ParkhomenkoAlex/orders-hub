# Orders Hub

Orders Hub is a Next.js application for managing Orders and their Products. It uses RTK Query to call Next.js REST route handlers, which persist data through Drizzle ORM and MySQL.

## Stack

- Next.js App Router, React, and TypeScript
- Redux Toolkit, React Redux, and RTK Query
- Bootstrap, Sass, and BEM-oriented styling
- Drizzle ORM, mysql2, and MySQL 8.4
- Vitest

## Prerequisites

- Node.js 22+
- npm
- Docker Desktop with Docker Compose, for local MySQL

## Local setup

Install dependencies and create the ignored local environment file:

```bash
npm install
cp .env.example .env
```

Set non-placeholder values for `MYSQL_PASSWORD` and `MYSQL_ROOT_PASSWORD` in `.env`. The supplied `DATABASE_URL` targets the local Compose service on `127.0.0.1:3307` and the `orders_hub` database.

Start MySQL, wait for its healthcheck, and apply the committed local migration:

```bash
docker compose up -d mysql
npm run db:migrate
```

Start the application and the local Socket.IO active-tab service in separate terminals:

```bash
# Terminal 1
npm run dev
```

```bash
# Terminal 2
npm run realtime:dev
```

Open [http://localhost:3000/orders](http://localhost:3000/orders). The Orders and Products pages use the local MySQL database; initial data is empty until created through the UI or API. The active-tab counter connects to `NEXT_PUBLIC_REALTIME_URL`, which defaults to the local Socket.IO service on port 3001.

Open a second browser tab to confirm that both TopMenus show `Sessions: 2`; closing one returns the remaining tab to `Sessions: 1`. If the Socket.IO service is unavailable, the counter honestly displays `connecting`, `reconnecting`, or `unavailable` rather than a stale count.

### Local database lifecycle

`compose.yaml` binds MySQL only to `127.0.0.1:3307` and stores data in the `mysql_data` named volume. Local Docker data is independent of the Aiven Preview database. Do not use the Aiven connection string in `.env` when working locally.

## Environment variables

`.env` is ignored by Git. Keep passwords, database URIs, and CA certificates out of the repository and browser-exposed `NEXT_PUBLIC_*` variables.

| Variable                | Used by                        | Purpose                                                                                                      |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`          | Local app / Vercel Preview app | Local MySQL URI, or an Aiven URI targeting `/orders_hub` with `ssl-mode=REQUIRED`.                           |
| `DATABASE_SSL_CA`       | Vercel Preview app             | Aiven project CA PEM for verified TLS. Use escaped `\n` characters when storing it as one environment value. |
| `AIVEN_DATABASE_URL`    | `db:migrate:aiven` only        | Aiven URI targeting `/orders_hub` with `ssl-mode=REQUIRED`.                                                  |
| `AIVEN_DATABASE_SSL_CA` | `db:migrate:aiven` only        | Aiven project CA PEM for verified TLS migrations.                                                            |

Local Docker does not use `DATABASE_SSL_CA`, `AIVEN_DATABASE_URL`, or `AIVEN_DATABASE_SSL_CA`.

### Local real-time environment

| Variable                   | Used by           | Purpose                                                                |
| -------------------------- | ----------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_REALTIME_URL` | Browser TopMenu   | Socket.IO URL, normally `http://localhost:3001` locally.               |
| `REALTIME_PORT`            | Local service     | Local listening-port fallback; defaults to `3001`.                     |
| `PORT`                     | Render service    | Render-provided listening port; takes precedence over `REALTIME_PORT`. |
| `REALTIME_ALLOWED_ORIGINS` | Socket.IO service | Comma-separated exact browser origins; defaults to localhost:3000.     |

The active-tab service is deliberately separate from Next.js so that it has one long-lived, in-memory connection set. It counts anonymous browser tabs, not users or devices. It is single-instance only: if it is scaled later, shared presence infrastructure is required for a globally accurate count. Render Free may suspend an inactive service; during wake-up the client displays its reconnecting/unavailable state rather than a stale count.

The server broadcasts `sessions:update` events with a `{ count: number }` payload whenever a tab connects or disconnects. The browser does not send application events; Socket.IO heartbeats detect unexpected disconnects.

## Render real-time service deployment

Deploy the Socket.IO service as a separate **Render Web Service** from this repository. This is intentionally independent of the Vercel Next.js frontend and does not need MySQL, Aiven variables, or application TLS certificates: Render terminates HTTPS and proxies secure WebSocket connections to the HTTP service.

Create the service in the Render dashboard with these settings:

| Setting           | Value                                                          |
| ----------------- | -------------------------------------------------------------- |
| Runtime           | Node                                                           |
| Branch            | The branch being verified (currently `feature/realtime-local`) |
| Build command     | `npm ci`                                                       |
| Start command     | `npm run realtime:start`                                       |
| Health check path | `/health`                                                      |
| Instance type     | Free                                                           |

Set the following Render environment variables:

```text
NODE_ENV=production
REALTIME_ALLOWED_ORIGINS=https://<vercel-preview-host>
```

Render supplies `PORT`; the service binds to `0.0.0.0` and uses that value before the local `REALTIME_PORT` fallback. `REALTIME_ALLOWED_ORIGINS` must contain exact origins without trailing slashes. To test the deployed service from local Next.js as well, add `http://localhost:3000` as a second comma-separated origin. Never use `*` in a public deployment.

After Render assigns a public HTTPS URL, configure this Vercel **Preview** environment variable and redeploy the Preview frontend:

```text
NEXT_PUBLIC_REALTIME_URL=https://<render-service-host>
```

The browser negotiates secure WebSockets through the Render HTTPS endpoint, avoiding mixed-content requests. C.5 Preview verification confirmed `/health`, cross-tab count updates, navigation without duplicate sessions, reconnect behavior, and the Vercel Preview connection.

## Aiven Preview database

The development Preview environment uses the persistent Aiven Free MySQL 8.4 service and the `orders_hub` database. It is separate from the local Docker database.

1. In Aiven, create or select the `orders_hub` database.
2. Copy the MySQL Service URI and change only its database path from `/defaultdb` to `/orders_hub`.
3. Preserve Aiven's `ssl-mode=REQUIRED` query parameter.
4. Download the Aiven project CA certificate.

The application translates Aiven's URL flag into mysql2 TLS options. It requires the CA certificate and uses `rejectUnauthorized: true`; unsupported TLS modes and missing CA configuration fail instead of falling back to an unencrypted connection.

### Apply Aiven migrations manually

Migrations are intentionally not run during Vercel builds or application startup. Use the explicit Aiven-only command from a trusted machine after confirming the target database:

```bash
read -r -s AIVEN_DATABASE_URL
export AIVEN_DATABASE_URL
export AIVEN_DATABASE_SSL_CA="$(cat /secure/path/to/aiven-ca.pem)"
npm run db:migrate:aiven
unset AIVEN_DATABASE_URL AIVEN_DATABASE_SSL_CA
```

Enter the complete Aiven URI when prompted, with `/orders_hub?ssl-mode=REQUIRED`. `db:migrate:aiven` does not read `DATABASE_URL`, requires TLS and the `orders_hub` target, and fails if its Aiven-specific variables are missing.

Use `npm run db:migrate` only for the local Docker database.

## Vercel Preview deployment

Vercel Preview deployments are verified for this project. Configure these server-only variables in Vercel's **Preview** environment scope:

```text
DATABASE_URL=mysql://<user>:<password>@<host>:<port>/orders_hub?ssl-mode=REQUIRED
DATABASE_SSL_CA=-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----
```

Do not configure `AIVEN_DATABASE_URL` or `AIVEN_DATABASE_SSL_CA` in Vercel: those variables exist only for manual migrations. Do not add a migration command to Vercel's build or deploy settings.

Each pushed Git branch or pull request receives its own Vercel Preview URL. Open the deployment URL shown by Vercel for that branch; it serves the same Next.js application and connects to the configured persistent Preview database. Production deployment remains a separate pending task.

## Scripts

| Command                                   | Purpose                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`                             | Run the local Next.js development server.                              |
| `npm run build`                           | Create a production build.                                             |
| `npm run start`                           | Run a completed production build.                                      |
| `npm run lint`                            | Run ESLint.                                                            |
| `npm run format` / `npm run format:check` | Format files / verify formatting.                                      |
| `npm run test:unit`                       | Run Vitest.                                                            |
| `npm run realtime:dev`                    | Run the standalone Socket.IO service with watch mode.                  |
| `npm run realtime:start`                  | Run the standalone Socket.IO service once.                             |
| `npm run db:generate`                     | Generate a Drizzle migration from schema changes.                      |
| `npm run db:migrate`                      | Apply committed migrations to local `DATABASE_URL`.                    |
| `npm run db:migrate:aiven`                | Apply committed migrations to explicit Aiven-only migration variables. |

## Verification

Run the relevant checks before handoff:

```bash
npm run format:check
npm run lint
npx tsc --noEmit
npm run test:unit
npm run build
```

For Preview verification, confirm Orders and Products load from Aiven, create and delete Orders/Products, reload to confirm persistence, verify order-deletion cascades, and exercise global search, Product filters, error states, and custom specifications.

## Pending deliverables

Docker application packaging and production deployment remain pending. The Render-hosted Socket.IO active-tab service is verified with Vercel Preview; its Render Free inactivity behavior remains an operational caveat. The completed MySQL Workbench-compatible schema artifact is [`database/schema.sql`](database/schema.sql); the repository does not include a native `.mwb` model or EER diagram.

# Order Status Summary microfrontend

Orders Hub demonstrates a small, independently buildable microfrontend without
moving its Orders or Products CRUD outside the host application. The Order
Status Summary is a read-only custom element rendered in the Orders workspace.

## Architecture and contract

The host dynamically imports a client-only integration component, then loads a
standalone ES module with a `<script type="module">` element. The standalone
bundle registers this custom element:

```text
orders-hub-order-status-summary
```

It uses Shadow DOM, so its CSS and vanilla DOM implementation do not share the
host's React runtime or leak styles into the dashboard. The host passes a
versioned, serializable `summary` property after the custom element loads:

```ts
{
    version: 1,
    locale: "en" | "ru",
    metrics: {
        totalOrders: number,
        totalProducts: number,
        availableProducts: number,
    },
    labels: {
        totalOrders: string,
        totalProducts: string,
        availableProducts: string,
    },
}
```

The host calculates the three metrics from its live RTK Query Orders/Products
data using the existing typed inventory aggregation helper. The microfrontend
does not fetch APIs, access MySQL, receive credentials, or own business CRUD.
It emits `orders-hub-order-status-summary:ready` with `{ version: 1 }` after a
valid render, and `orders-hub-order-status-summary:error` with a safe reason
when the supplied contract is invalid.

## Local development and independent build

The microfrontend owns its source and TypeScript build configuration in
`microfrontends/order-status-summary`. Build it independently:

```bash
npm run build:microfrontend
```

This produces a standalone ES-module entry point and its colocated contract
module at:

```text
public/microfrontends/order-status-summary/
```

The host's default local URL is:

```text
/microfrontends/order-status-summary/index.js
```

Run `npm run dev` after building it to test the host and local fallback. The
host loads the bundle only in the browser; the existing request-time Orders
rendering is unchanged.

## Independent deployment

Copy the entire generated directory to any HTTPS static host/CDN that returns
JavaScript modules with `Access-Control-Allow-Origin` configured for the Orders
Hub origin. Preserve the entry point's adjacent `contract.js` file. Set this
public build-time host variable before deploying the Next.js host:

```text
NEXT_PUBLIC_ORDER_STATUS_SUMMARY_MFE_URL=https://<static-host>/index.js
```

The host then loads that remote module at runtime. Updating and redeploying the
remote bundle at the same compatible URL does not require a host rebuild. A
change to the remote URL itself requires updating the public host variable and
redeploying the host because Next.js embeds `NEXT_PUBLIC_*` values in browser
code.

Use only a controlled HTTPS origin for the remote module. The module receives
only aggregate counts and localized labels, but it executes in the page's
origin context. Content Security Policy and subresource-integrity policy are
deployment concerns if third-party hosting is introduced.

## Failure handling and limitations

The host shows a localized loading state while the script loads and a localized
unavailable state with Retry if it cannot be fetched or does not register the
expected custom element. Existing Orders functionality stays usable in either
case.

The locally generated fallback lets one repository demonstrate the boundary,
but it is not proof of an independently hosted deployment. Remote deployment,
browser verification, CDN headers, and remote rollout/versioning remain manual
verification steps.

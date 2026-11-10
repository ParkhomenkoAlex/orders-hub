# WebAssembly inventory-value demonstration

The Products page includes a read-only **Inventory value** summary. It totals
the current RTK Query Products data in USD without changing Orders Hub's
database, REST API, or product workflows.

## Computation and boundary

`src/lib/wasm-inventory-value.ts` converts each product's `price.usd` to an
integer number of cents before crossing the JavaScript/WebAssembly boundary.
It writes those signed 32-bit values to the module's linear memory and calls
the exported `sum_cents(pointer, length)` function. The module uses a loop,
memory loads, and 64-bit integer addition to return the total cents. JavaScript
then formats that exact fixed-point result for the active English or Russian
locale.

This is deliberately separate from Inventory Analytics: the existing native
Web Worker groups order and product counts off the main thread, while this
module calculates a monetary total from product prices in WebAssembly.

## Source and build

The readable WebAssembly text source is
[`wasm/inventory-value.wat`](../wasm/inventory-value.wat). The committed
[`public/wasm/inventory-value.wasm`](../public/wasm/inventory-value.wasm) is
the browser-loaded binary asset.

Rebuild the asset after changing the module:

```bash
npm run build:wasm
```

The project deliberately uses a small dependency-free Node encoder in
[`scripts/build-wasm.mjs`](../scripts/build-wasm.mjs), because the normal local
toolchain may not include `wasm-ld` or a Rust `wasm32` target. The encoder is
limited to, and explicitly documents, the instructions in this one small WAT
module; it is not presented as a general WAT compiler. Commit the rebuilt
binary with its WAT and encoder changes.

## Loading and fallback

The client fetches `/wasm/inventory-value.wasm` only when the Products value
summary needs a non-empty calculation, instantiates it with the browser's
native `WebAssembly` API, and caches the resulting calculator for that browser
session. If loading or execution fails, the same fixed-point sum runs in a
small JavaScript fallback. The UI states which path produced the displayed
value, so a fallback is never represented as a WebAssembly result.

The module has one fixed 64 KiB memory page, which accommodates 16,384 input
prices. It is an intentionally small technology demonstration and makes no
claim of being faster than JavaScript for this inventory size.

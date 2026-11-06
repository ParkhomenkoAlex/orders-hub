import { describe, expect, it } from "vitest";
import {
    isExcludedPath,
    shouldCacheStaticRequest,
    shouldHandleNavigation,
} from "../../public/sw.js";

const origin = "https://orders-hub.example";

describe("service worker routing rules", () => {
    it("uses the offline fallback only for same-origin document navigations", () => {
        expect(
            shouldHandleNavigation(
                { method: "GET", mode: "navigate", url: `${origin}/orders` },
                origin,
            ),
        ).toBe(true);
        expect(
            shouldHandleNavigation(
                { method: "GET", mode: "navigate", url: `${origin}/api/orders` },
                origin,
            ),
        ).toBe(false);
        expect(
            shouldHandleNavigation(
                { method: "GET", mode: "navigate", url: "https://tiles.example/map" },
                origin,
            ),
        ).toBe(false);
    });

    it("caches only same-origin static assets and excludes APIs and Socket.IO", () => {
        expect(
            shouldCacheStaticRequest(
                { method: "GET", destination: "script", url: `${origin}/_next/app.js` },
                origin,
            ),
        ).toBe(true);
        expect(
            shouldCacheStaticRequest(
                { method: "GET", destination: "", url: `${origin}/api/graphql` },
                origin,
            ),
        ).toBe(false);
        expect(
            shouldCacheStaticRequest(
                { method: "GET", destination: "script", url: `${origin}/socket.io/socket.js` },
                origin,
            ),
        ).toBe(false);
        expect(isExcludedPath("/api/products")).toBe(true);
        expect(isExcludedPath("/socket.io/")).toBe(true);
    });
});

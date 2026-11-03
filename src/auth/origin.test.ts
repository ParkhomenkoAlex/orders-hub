import { describe, expect, it } from "vitest";
import { hasSameOrigin } from "./origin";

describe("hasSameOrigin", () => {
    it("accepts a browser-visible loopback host when Next.js canonicalizes the request URL", () => {
        const request = new Request("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: {
                origin: "http://127.0.0.1:3000",
                host: "127.0.0.1:3000",
            },
        });

        expect(hasSameOrigin(request)).toBe(true);
    });

    it("rejects missing, cross-origin, and malformed origin headers", () => {
        expect(
            hasSameOrigin(
                new Request("http://localhost:3000/api/auth/login", {
                    headers: { host: "localhost:3000" },
                }),
            ),
        ).toBe(false);
        expect(
            hasSameOrigin(
                new Request("http://localhost:3000/api/auth/login", {
                    headers: { origin: "https://attacker.test", host: "localhost:3000" },
                }),
            ),
        ).toBe(false);
        expect(
            hasSameOrigin(
                new Request("http://localhost:3000/api/auth/login", {
                    headers: { origin: "not-a-url", host: "localhost:3000" },
                }),
            ),
        ).toBe(false);
    });
});

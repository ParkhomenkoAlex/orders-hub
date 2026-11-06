import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import manifest from "./manifest";

describe("web app manifest", () => {
    it("provides install metadata and a maskable application icon", () => {
        expect(manifest()).toMatchObject({
            name: "Orders Hub",
            short_name: "Orders Hub",
            start_url: "/",
            display: "standalone",
            background_color: "#f1f5f6",
            theme_color: "#88c33e",
            icons: [
                {
                    src: "/icons/orders-hub-192.png",
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "any",
                },
                {
                    src: "/icons/orders-hub-512.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "any",
                },
                {
                    src: "/icons/orders-hub-512.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "maskable",
                },
            ],
        });
    });

    it("ships square PNG icon files at the declared sizes", () => {
        const icon192 = readFileSync(
            new URL("../../public/icons/orders-hub-192.png", import.meta.url),
        );
        const icon512 = readFileSync(
            new URL("../../public/icons/orders-hub-512.png", import.meta.url),
        );

        expect(icon192.subarray(0, 8)).toEqual(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        );
        expect([icon192.readUInt32BE(16), icon192.readUInt32BE(20)]).toEqual([192, 192]);
        expect([icon512.readUInt32BE(16), icon512.readUInt32BE(20)]).toEqual([512, 512]);
    });
});

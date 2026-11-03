import { describe, expect, it } from "vitest";
import { getProductTypeBarHeight, getProductTypeCounts } from "./product-analytics";
import type { Product } from "@/types/domain";

const makeProduct = (type: Product["type"]): Product => ({
    id: `product-${type}`,
    orderId: "order-1",
    title: type,
    serialNumber: "SN-001",
    type,
    status: "Available",
    condition: "New",
    specification: "Standard",
    groupName: "Design",
    warranty: { start: "2025-01-01", end: "2026-01-01" },
    price: { usd: 100, uah: 4000 },
});

describe("getProductTypeCounts", () => {
    it("returns every canonical type in display order, including zero counts", () => {
        expect(getProductTypeCounts([makeProduct("Monitors"), makeProduct("Monitors")])).toEqual([
            { type: "Monitors", count: 2 },
            { type: "Laptops", count: 0 },
            { type: "Motherboards", count: 0 },
            { type: "Accessories", count: 0 },
        ]);
    });

    it("aggregates products by canonical type", () => {
        expect(
            getProductTypeCounts([
                makeProduct("Laptops"),
                makeProduct("Accessories"),
                makeProduct("Laptops"),
            ]),
        ).toEqual([
            { type: "Monitors", count: 0 },
            { type: "Laptops", count: 2 },
            { type: "Motherboards", count: 0 },
            { type: "Accessories", count: 1 },
        ]);
    });
});

describe("getProductTypeBarHeight", () => {
    it("hides zero-count bars and scales positive counts linearly", () => {
        expect(getProductTypeBarHeight(0, 4)).toBe(0);
        expect(getProductTypeBarHeight(1, 4)).toBe(25);
        expect(getProductTypeBarHeight(2, 4)).toBe(50);
        expect(getProductTypeBarHeight(4, 4)).toBe(100);
    });
});

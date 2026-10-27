import { describe, expect, it } from "vitest";
import { validateCreateOrder, validateCreateProduct } from "@/lib/api-validation";

const validProduct = {
    orderId: "a0d4aa81-3e76-4ca9-96ef-f5a0c3983af8",
    title: "Dell UltraSharp monitor",
    serialNumber: "SN-001",
    type: "Monitors",
    status: "Available",
    warranty: { start: "2026-01-01", end: "2027-01-01" },
    price: { usd: 100.25, uah: 4000 },
};

describe("API request validation", () => {
    it("normalizes a valid order and supplies its current calendar date", () => {
        const result = validateCreateOrder({ title: "  Office equipment  " });

        expect(result).toMatchObject({ success: true, data: { title: "Office equipment" } });
    });

    it("rejects an invalid order payload", () => {
        expect(validateCreateOrder({ title: "", createdAt: "2026-02-31" })).toEqual({
            success: false,
            details: {
                title: "Required.",
                createdAt: "Must be a valid ISO calendar date.",
            },
        });
    });

    it("applies the existing product defaults to a valid product", () => {
        expect(validateCreateProduct(validProduct)).toEqual({
            success: true,
            data: {
                ...validProduct,
                condition: "New",
                specification: "Standard",
                groupName: "New arrivals",
            },
        });
    });

    it("rejects warranty ranges and values outside DECIMAL(14,2)", () => {
        const result = validateCreateProduct({
            ...validProduct,
            warranty: { start: "2027-01-01", end: "2026-01-01" },
            price: { usd: 1.001, uah: 1_000_000_000_000 },
        });

        expect(result).toEqual({
            success: false,
            details: {
                "warranty.end": "Must not be earlier than the warranty start date.",
                "price.usd": "Must be a non-negative DECIMAL(14,2) value.",
                "price.uah": "Must be a non-negative DECIMAL(14,2) value.",
            },
        });
    });
});

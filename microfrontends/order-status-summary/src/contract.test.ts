import { describe, expect, it } from "vitest";
import { isOrderStatusSummaryContract, ORDER_STATUS_SUMMARY_VERSION } from "./contract";

describe("Order Status Summary microfrontend contract", () => {
    const contract = {
        version: ORDER_STATUS_SUMMARY_VERSION,
        locale: "en",
        metrics: { totalOrders: 2, totalProducts: 3, availableProducts: 1 },
        labels: {
            totalOrders: "Total orders",
            totalProducts: "Total products",
            availableProducts: "Available products",
        },
    };

    it("accepts the versioned, serializable host contract", () => {
        expect(isOrderStatusSummaryContract(contract)).toBe(true);
    });

    it("rejects unsupported locales and invalid counts", () => {
        expect(isOrderStatusSummaryContract({ ...contract, locale: "uk" })).toBe(false);
        expect(
            isOrderStatusSummaryContract({
                ...contract,
                metrics: { ...contract.metrics, totalProducts: -1 },
            }),
        ).toBe(false);
    });
});

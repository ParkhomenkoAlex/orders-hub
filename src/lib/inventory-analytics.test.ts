import { describe, expect, it } from "vitest";
import {
    calculateInventoryAnalytics,
    createInventoryAnalyticsWorkerRequest,
    handleInventoryAnalyticsWorkerRequest,
    isCurrentInventoryAnalyticsResponse,
} from "./inventory-analytics";

describe("calculateInventoryAnalytics", () => {
    it("calculates distinct inventory totals and canonical type and status counts", () => {
        expect(
            calculateInventoryAnalytics({
                orders: [{ id: "order-1" }, { id: "order-1" }, { id: "order-2" }],
                products: [
                    { id: "product-1", type: "Monitors", status: "Available" },
                    { id: "product-2", type: "Laptops", status: "Reserved" },
                    { id: "product-2", type: "Laptops", status: "Reserved" },
                ],
            }),
        ).toEqual({
            totalOrders: 2,
            totalProducts: 2,
            productsByType: {
                Monitors: 1,
                Laptops: 1,
                Motherboards: 0,
                Accessories: 0,
            },
            productsByStatus: {
                Available: 1,
                "In service": 0,
                Reserved: 1,
            },
        });
    });

    it("handles empty and incomplete serializable records safely", () => {
        expect(
            calculateInventoryAnalytics({
                orders: [{ id: "" }],
                products: [
                    { id: "", type: "Monitors", status: "Available" },
                    {
                        id: "product-1",
                        type: "Unknown" as "Monitors",
                        status: "Unknown" as "Available",
                    },
                ],
            }),
        ).toEqual({
            totalOrders: 0,
            totalProducts: 1,
            productsByType: {
                Monitors: 0,
                Laptops: 0,
                Motherboards: 0,
                Accessories: 0,
            },
            productsByStatus: {
                Available: 0,
                "In service": 0,
                Reserved: 0,
            },
        });
    });
});

describe("inventory analytics worker protocol", () => {
    it("returns a typed result and ignores stale responses", () => {
        const request = createInventoryAnalyticsWorkerRequest(3, {
            orders: [{ id: "order-1" }],
            products: [{ id: "product-1", type: "Monitors", status: "Available" }],
        });
        const response = handleInventoryAnalyticsWorkerRequest(request);

        expect(response).toMatchObject({
            type: "result",
            requestId: 3,
            analytics: { totalOrders: 1, totalProducts: 1 },
        });
        expect(isCurrentInventoryAnalyticsResponse(response, 3)).toBe(true);
        expect(isCurrentInventoryAnalyticsResponse(response, 4)).toBe(false);
    });
});

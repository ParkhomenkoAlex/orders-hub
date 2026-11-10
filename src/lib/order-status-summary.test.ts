import { describe, expect, it } from "vitest";
import { createOrderStatusSummaryMetrics } from "./order-status-summary";
import type { Order, Product } from "@/types/domain";

const order: Order = { id: "order-1", title: "Office", createdAt: "2026-01-01" };
const product: Product = {
    id: "product-1",
    orderId: order.id,
    title: "Monitor",
    serialNumber: "SN-1",
    type: "Monitors",
    status: "Available",
    condition: "New",
    specification: "4K",
    groupName: "Office",
    warranty: { start: "2026-01-01", end: "2027-01-01" },
    price: { usd: 100, uah: 4000 },
};

describe("createOrderStatusSummaryMetrics", () => {
    it("uses the existing inventory aggregation for real order and product counts", () => {
        expect(
            createOrderStatusSummaryMetrics({
                orders: [order, order],
                products: [product, product, { ...product, id: "product-2", status: "Reserved" }],
            }),
        ).toEqual({ totalOrders: 1, totalProducts: 2, availableProducts: 1 });
    });

    it("handles an empty inventory", () => {
        expect(createOrderStatusSummaryMetrics({ orders: [], products: [] })).toEqual({
            totalOrders: 0,
            totalProducts: 0,
            availableProducts: 0,
        });
    });
});

import { describe, expect, it } from "vitest";
import {
    filterOrders,
    filterProducts,
    getOrderTotal,
    groupProductsByOrderId,
} from "@/lib/order-domain";
import type { Order, Product } from "@/types/domain";

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
    id: "order-1",
    title: "Office equipment",
    createdAt: "2017-10-06",
    ...overrides,
});

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
    id: "product-1",
    orderId: "order-1",
    title: "Dell UltraSharp monitor",
    serialNumber: "SN-001",
    type: "Monitors",
    status: "Available",
    condition: "New",
    specification: "27-inch",
    groupName: "Design",
    warranty: { start: "2017-04-06", end: "2025-08-06" },
    price: { usd: 100, uah: 4000 },
    ...overrides,
});

describe("groupProductsByOrderId", () => {
    it("returns an empty map for an empty product list", () => {
        expect(groupProductsByOrderId([])).toEqual(new Map());
    });

    it("groups products for multiple orders and retains products with an unknown parent", () => {
        const first = makeProduct({ id: "product-1", orderId: "order-1" });
        const second = makeProduct({ id: "product-2", orderId: "order-1" });
        const orphan = makeProduct({ id: "product-3", orderId: "missing-order" });

        const grouped = groupProductsByOrderId([first, second, orphan]);

        expect(grouped.get("order-1")).toEqual([first, second]);
        expect(grouped.get("missing-order")).toEqual([orphan]);
    });
});

describe("getOrderTotal", () => {
    it("returns zero totals for an order without products", () => {
        expect(getOrderTotal([])).toEqual({ usd: 0, uah: 0 });
    });

    it("adds prices in minor units to avoid decimal accumulation errors", () => {
        const products = [
            makeProduct({ price: { usd: 0.1, uah: 1.11 } }),
            makeProduct({ id: "product-2", price: { usd: 0.2, uah: 2.22 } }),
        ];

        expect(getOrderTotal(products)).toEqual({ usd: 0.3, uah: 3.33 });
    });
});

describe("filterProducts", () => {
    const monitor = makeProduct({
        id: "monitor",
        title: "Dell UltraSharp monitor",
        serialNumber: "MON-100",
        type: "Monitors",
    });
    const laptop = makeProduct({
        id: "laptop",
        title: "ThinkPad workstation",
        serialNumber: "LAP-200",
        type: "Laptops",
    });
    const motherboard = makeProduct({
        id: "motherboard",
        title: "X58 board",
        serialNumber: "MB-300",
        type: "Motherboards",
    });
    const products = [monitor, laptop, motherboard];

    it("filters by product type", () => {
        expect(filterProducts(products, "Laptops", "")).toEqual([laptop]);
    });

    it("matches trimmed, case-insensitive product titles", () => {
        expect(filterProducts(products, "all", "  ultrasHARP ")).toEqual([monitor]);
    });

    it("matches serial numbers", () => {
        expect(filterProducts(products, "all", "lap-200")).toEqual([laptop]);
    });

    it("matches product type text", () => {
        expect(filterProducts(products, "all", "MOTHERBOARDS")).toEqual([motherboard]);
    });
});

describe("filterOrders", () => {
    const officeOrder = makeOrder({ id: "order-1", title: "Office equipment" });
    const designOrder = makeOrder({ id: "order-2", title: "Design team delivery" });
    const orders = [officeOrder, designOrder];
    const productsByOrderId = groupProductsByOrderId([
        makeProduct({
            id: "product-1",
            orderId: officeOrder.id,
            title: "Dell display",
            serialNumber: "DISPLAY-001",
            type: "Monitors",
        }),
        makeProduct({
            id: "product-2",
            orderId: designOrder.id,
            title: "ThinkPad",
            serialNumber: "LAPTOP-002",
            type: "Laptops",
        }),
    ]);

    it("matches an order title", () => {
        expect(filterOrders(orders, productsByOrderId, " office ")).toEqual([officeOrder]);
    });

    it("matches related product title, serial number, and type", () => {
        expect(filterOrders(orders, productsByOrderId, "thinkpad")).toEqual([designOrder]);
        expect(filterOrders(orders, productsByOrderId, "display-001")).toEqual([officeOrder]);
        expect(filterOrders(orders, productsByOrderId, "laptops")).toEqual([designOrder]);
    });
});

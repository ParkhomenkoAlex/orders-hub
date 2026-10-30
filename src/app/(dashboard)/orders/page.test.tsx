import { describe, expect, it, vi } from "vitest";
import type { Order, Product } from "@/types/domain";

const server = vi.hoisted(() => ({
    connection: vi.fn(),
    listOrders: vi.fn(),
    listProducts: vi.fn(),
}));

vi.mock("next/server", () => ({ connection: server.connection }));
vi.mock("@/server/inventory", () => ({
    listOrders: server.listOrders,
    listProducts: server.listProducts,
}));
vi.mock("@/components/orders/OrdersWorkspace", () => ({
    OrdersWorkspace: () => null,
}));

import OrdersPage from "./page";

const order: Order = {
    id: "order-1",
    title: "Office equipment",
    createdAt: "2026-10-30",
};

const product: Product = {
    id: "product-1",
    orderId: order.id,
    title: "Monitor",
    serialNumber: "SN-1",
    type: "Monitors",
    status: "Available",
    condition: "New",
    specification: "4K IPS",
    groupName: "New arrivals",
    warranty: { start: "2026-10-30", end: "2027-10-30" },
    price: { usd: 100, uah: 4_000 },
};

describe("OrdersPage", () => {
    it("waits for a request and passes server inventory data to the workspace", async () => {
        const calls: string[] = [];
        server.connection.mockImplementation(async () => {
            calls.push("connection");
        });
        server.listOrders.mockImplementation(async () => {
            calls.push("orders");
            return [order];
        });
        server.listProducts.mockImplementation(async () => {
            calls.push("products");
            return [product];
        });

        const page = await OrdersPage();

        expect(calls[0]).toBe("connection");
        expect(page.props).toMatchObject({ initialOrders: [order], initialProducts: [product] });
    });

    it("falls back to the existing client loading and error behavior when SSR data fails", async () => {
        server.connection.mockResolvedValue(undefined);
        server.listOrders.mockRejectedValue(new Error("database unavailable"));
        server.listProducts.mockResolvedValue([product]);

        const page = await OrdersPage();

        expect(page.props).toEqual({});
    });
});

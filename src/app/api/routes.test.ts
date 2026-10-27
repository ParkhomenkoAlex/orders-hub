import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Order, Product } from "@/types/domain";

const inventory = vi.hoisted(() => ({
    createOrder: vi.fn(),
    createProduct: vi.fn(),
    deleteOrder: vi.fn(),
    deleteProduct: vi.fn(),
    listOrders: vi.fn(),
    listProducts: vi.fn(),
}));

vi.mock("@/server/inventory", () => inventory);

import { DELETE as deleteOrder } from "./orders/[orderId]/route";
import { GET as getOrders, POST as createOrder } from "./orders/route";
import { DELETE as deleteProduct } from "./products/[productId]/route";
import { GET as getProducts, POST as createProduct } from "./products/route";

const order: Order = {
    id: "a0d4aa81-3e76-4ca9-96ef-f5a0c3983af8",
    title: "Office equipment",
    createdAt: "2026-01-01",
};

const product: Product = {
    id: "dbf8778e-1d13-4ad4-b277-0f8e5a4b06d1",
    orderId: order.id,
    title: "Dell UltraSharp monitor",
    serialNumber: "SN-001",
    type: "Monitors",
    status: "Available",
    condition: "New",
    specification: "Standard",
    groupName: "New arrivals",
    warranty: { start: "2026-01-01", end: "2027-01-01" },
    price: { usd: 100, uah: 4000 },
};

const productPayload = {
    orderId: order.id,
    title: product.title,
    serialNumber: product.serialNumber,
    type: product.type,
    status: product.status,
    warranty: product.warranty,
    price: product.price,
};

describe("Orders and Products API routes", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("returns an orders collection in the JSON data envelope", async () => {
        inventory.listOrders.mockResolvedValue([order]);

        const response = await getOrders();

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ data: [order] });
    });

    it("returns 422 with a validation error envelope for an invalid order", async () => {
        const response = await createOrder(
            new Request("http://localhost/api/orders", {
                method: "POST",
                body: JSON.stringify({ title: "" }),
            }),
        );

        expect(response.status).toBe(422);
        await expect(response.json()).resolves.toMatchObject({
            error: { code: "VALIDATION_ERROR", details: { title: "Required." } },
        });
    });

    it("returns 400 with an error envelope for malformed JSON", async () => {
        const response = await createOrder(
            new Request("http://localhost/api/orders", {
                method: "POST",
                body: "{",
            }),
        );

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            error: { code: "INVALID_JSON", message: "Request body must be valid JSON." },
        });
    });

    it("returns 201 and the created product response shape", async () => {
        inventory.createProduct.mockResolvedValue(product);

        const response = await createProduct(
            new Request("http://localhost/api/products", {
                method: "POST",
                body: JSON.stringify(productPayload),
            }),
        );

        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toEqual({ data: product });
    });

    it("returns 404 when a parent order is not found during product creation", async () => {
        inventory.createProduct.mockResolvedValue(null);

        const response = await createProduct(
            new Request("http://localhost/api/products", {
                method: "POST",
                body: JSON.stringify(productPayload),
            }),
        );

        expect(response.status).toBe(404);
        await expect(response.json()).resolves.toMatchObject({
            error: { code: "ORDER_NOT_FOUND" },
        });
    });

    it("returns 404 when an order or product deletion target does not exist", async () => {
        inventory.deleteOrder.mockResolvedValue(false);
        inventory.deleteProduct.mockResolvedValue(false);

        const orderResponse = await deleteOrder(new Request("http://localhost"), {
            params: Promise.resolve({ orderId: "missing-order" }),
        });
        const productResponse = await deleteProduct(new Request("http://localhost"), {
            params: Promise.resolve({ productId: "missing-product" }),
        });

        expect(orderResponse.status).toBe(404);
        expect(productResponse.status).toBe(404);
        await expect(orderResponse.json()).resolves.toMatchObject({
            error: { code: "ORDER_NOT_FOUND" },
        });
        await expect(productResponse.json()).resolves.toMatchObject({
            error: { code: "PRODUCT_NOT_FOUND" },
        });
    });

    it("returns a consistent 500 error when persistence fails", async () => {
        inventory.listProducts.mockRejectedValue(new Error("database unavailable"));

        const response = await getProducts(new Request("http://localhost/api/products"));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: { code: "INTERNAL_ERROR", message: "Unable to load products." },
        });
    });
});

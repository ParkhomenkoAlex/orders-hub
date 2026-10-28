import { configureStore } from "@reduxjs/toolkit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { inventoryApi } from "@/state/inventoryApi";
import type { Order, Product } from "@/types/domain";

const order: Order = {
    id: "e6476c8f-e6bf-446c-b847-43d6e0cc8a40",
    title: "Office equipment",
    createdAt: "2026-10-27",
};

const product: Product = {
    id: "ba43f8fe-b4ce-4267-9b47-20f9c7fcb9df",
    orderId: order.id,
    title: "Test USB-C Dock",
    serialNumber: "TEST-DOCK-001",
    type: "Accessories",
    status: "Available",
    condition: "New",
    specification: "Standard",
    groupName: "New arrivals",
    warranty: { start: "2026-10-27", end: "2027-10-27" },
    price: { usd: 99.99, uah: 4200 },
};

const createStore = () =>
    configureStore({
        reducer: { [inventoryApi.reducerPath]: inventoryApi.reducer },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(inventoryApi.middleware),
    });

describe("inventoryApi", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("unwraps the orders data envelope", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ data: [order] }), {
                headers: { "content-type": "application/json" },
            }),
        );
        vi.stubGlobal("fetch", fetchMock);

        const result = await createStore()
            .dispatch(inventoryApi.endpoints.getOrders.initiate())
            .unwrap();

        expect(result).toEqual([order]);
        expect((fetchMock.mock.calls[0][0] as Request).url).toBe("http://localhost/api/orders");
    });

    it("sends the product payload and unwraps the created product", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ data: product }), {
                headers: { "content-type": "application/json" },
            }),
        );
        vi.stubGlobal("fetch", fetchMock);

        const result = await createStore()
            .dispatch(
                inventoryApi.endpoints.createProduct.initiate({
                    orderId: product.orderId,
                    title: product.title,
                    serialNumber: product.serialNumber,
                    type: product.type,
                    status: product.status,
                    warranty: product.warranty,
                    price: product.price,
                }),
            )
            .unwrap();

        const request = fetchMock.mock.calls[0][0] as Request;
        expect(request.method).toBe("POST");
        await expect(request.json()).resolves.toMatchObject({ title: product.title });
        expect(result).toEqual(product);
    });
});

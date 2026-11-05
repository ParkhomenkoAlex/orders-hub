import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Order, Product } from "@/types/domain";

const inventory = vi.hoisted(() => ({
    listOrders: vi.fn(),
    listProducts: vi.fn(),
}));

vi.mock("@/server/inventory", () => inventory);

import { POST } from "./route";

const order: Order = {
    id: "order-1",
    title: "Office equipment",
    createdAt: "2026-01-01",
};

const product: Product = {
    id: "product-1",
    orderId: order.id,
    title: "Dell UltraSharp monitor",
    serialNumber: "SN-001",
    type: "Monitors",
    status: "Available",
    condition: "New",
    specification: "4K",
    groupName: "New arrivals",
    warranty: { start: "2026-01-01", end: "2027-01-01" },
    price: { usd: 100, uah: 4000 },
};

const graphqlRequest = (body: unknown, contentType = "application/json") =>
    new Request("http://localhost/api/graphql", {
        method: "POST",
        headers: { "content-type": contentType },
        body: typeof body === "string" ? body : JSON.stringify(body),
    });

describe("GraphQL API route", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        inventory.listOrders.mockResolvedValue([order]);
        inventory.listProducts.mockResolvedValue([product]);
    });

    it("returns real nested order-product data with one orders and products read", async () => {
        const response = await POST(
            graphqlRequest({
                query: `
                    query Inventory {
                        orders {
                            id
                            title
                            products {
                                id
                                title
                                price { usd uah }
                            }
                        }
                    }
                `,
                operationName: "Inventory",
            }),
        );

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            data: {
                orders: [
                    {
                        id: order.id,
                        title: order.title,
                        products: [{ id: product.id, title: product.title, price: product.price }],
                    },
                ],
            },
        });
        expect(inventory.listOrders).toHaveBeenCalledTimes(1);
        expect(inventory.listProducts).toHaveBeenCalledTimes(1);
    });

    it("supports variables and returns null for records that do not exist", async () => {
        const response = await POST(
            graphqlRequest({
                query: `query FindOrder($id: ID!, $missing: ID!) {
                    order(id: $id) { id title products { id } }
                    product(id: $missing) { id }
                }`,
                variables: { id: order.id, missing: "missing-product" },
                operationName: "FindOrder",
            }),
        );

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            data: {
                order: { id: order.id, title: order.title, products: [{ id: product.id }] },
                product: null,
            },
        });
    });

    it("returns standard GraphQL errors for invalid fields and safe errors for repository failures", async () => {
        const invalidField = await POST(graphqlRequest({ query: "{ orders { unknownField } }" }));

        expect(invalidField.status).toBe(200);
        await expect(invalidField.json()).resolves.toMatchObject({
            errors: [{ message: 'Cannot query field "unknownField" on type "Order".' }],
        });

        inventory.listOrders.mockRejectedValue(new Error("database password must not be exposed"));
        const failedRepository = await POST(graphqlRequest({ query: "{ orders { id } }" }));

        expect(failedRepository.status).toBe(200);
        await expect(failedRepository.json()).resolves.toEqual({
            data: null,
            errors: [{ message: "Unable to execute the GraphQL request.", path: ["orders"] }],
        });
    });

    it("rejects malformed request bodies and unsupported GraphQL request shapes", async () => {
        const malformedJson = await POST(graphqlRequest("{"));
        const unsupportedContentType = await POST(
            graphqlRequest({ query: "{ orders { id } }" }, "text/plain"),
        );
        const invalidVariables = await POST(
            graphqlRequest({ query: "{ orders { id } }", variables: [] }),
        );

        expect(malformedJson.status).toBe(400);
        expect(unsupportedContentType.status).toBe(415);
        expect(invalidVariables.status).toBe(400);
        await expect(malformedJson.json()).resolves.toEqual({
            errors: [{ message: "Request body must be valid JSON." }],
        });
    });
});

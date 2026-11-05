import { describe, expect, it } from "vitest";
import {
    buildOrdersProductsGraph,
    getGraphNode,
    getRelatedGraphNodes,
} from "./orders-products-graph";
import type { Order, Product } from "@/types/domain";

const orders: Order[] = [
    { id: "order-a", title: "First order", createdAt: "2025-01-01" },
    { id: "order-b", title: "Second order", createdAt: "2025-01-02" },
];

const product: Product = {
    id: "product-a",
    orderId: "order-a",
    title: "Monitor",
    serialNumber: "SN-001",
    type: "Monitors",
    status: "Available",
    condition: "New",
    specification: "4K",
    groupName: "Design",
    warranty: { start: "2025-01-01", end: "2026-01-01" },
    price: { usd: 100, uah: 4000 },
};

describe("buildOrdersProductsGraph", () => {
    it("creates stable, unique nodes and edges from real order-product relationships", () => {
        const graph = buildOrdersProductsGraph(orders, [product, { ...product }]);

        expect(graph.nodes).toEqual([
            { id: "order:order-a", entityId: "order-a", kind: "order", label: "First order" },
            { id: "order:order-b", entityId: "order-b", kind: "order", label: "Second order" },
            { id: "product:product-a", entityId: "product-a", kind: "product", label: "Monitor" },
        ]);
        expect(graph.edges).toEqual([
            {
                id: "order:order-a->product:product-a",
                source: "order:order-a",
                target: "product:product-a",
            },
        ]);
    });

    it("keeps one product node when inconsistent source data links its id to multiple orders", () => {
        const graph = buildOrdersProductsGraph(orders, [
            product,
            { ...product, orderId: "order-b" },
        ]);

        expect(graph.nodes.filter((node) => node.id === "product:product-a")).toHaveLength(1);
        expect(graph.edges).toHaveLength(2);
        expect(getRelatedGraphNodes(graph, "product:product-a").map((node) => node.id)).toEqual([
            "order:order-a",
            "order:order-b",
        ]);
    });

    it("omits products whose parent order is missing and handles empty input", () => {
        const graph = buildOrdersProductsGraph([], [product]);

        expect(graph).toEqual({ nodes: [], edges: [] });
        expect(getGraphNode(graph, "product:product-a")).toBeNull();
        expect(getRelatedGraphNodes(graph, "product:product-a")).toEqual([]);
    });
});

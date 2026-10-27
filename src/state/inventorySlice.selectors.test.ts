import { describe, expect, it } from "vitest";
import {
    selectProductsByOrderId,
    selectSearchQuery,
    selectVisibleOrders,
    type InventoryState,
} from "@/state/inventorySlice";
import type { RootState } from "@/state/store";
import type { Order, Product } from "@/types/domain";

const makeOrder = (id: string, title: string): Order => ({
    id,
    title,
    createdAt: "2017-10-06",
});

const makeProduct = (id: string, orderId: string, title: string): Product => ({
    id,
    orderId,
    title,
    serialNumber: `${id}-serial`,
    type: "Monitors",
    status: "Available",
    condition: "New",
    specification: "27-inch",
    groupName: "Design",
    warranty: { start: "2017-04-06", end: "2025-08-06" },
    price: { usd: 100, uah: 4000 },
});

const createState = (searchQuery = ""): RootState => {
    const officeOrder = makeOrder("order-1", "Office equipment");
    const designOrder = makeOrder("order-2", "Design team delivery");
    const inventory: InventoryState = {
        orders: [officeOrder, designOrder],
        products: [
            makeProduct("product-1", officeOrder.id, "Dell display"),
            makeProduct("product-2", designOrder.id, "ThinkPad"),
        ],
        searchQuery,
    };

    return { inventory };
};

describe("inventory selectors", () => {
    it("groups products by their parent order", () => {
        const state = createState();

        expect(selectProductsByOrderId(state).get("order-1")).toEqual([
            state.inventory.products[0],
        ]);
        expect(selectProductsByOrderId(state).get("order-2")).toEqual([
            state.inventory.products[1],
        ]);
    });

    it("preserves global search for order titles and related product fields", () => {
        expect(selectVisibleOrders(createState("office"))).toHaveLength(1);
        const productMatchState = createState("thinkpad");

        expect(selectVisibleOrders(productMatchState)).toEqual([
            productMatchState.inventory.orders[1],
        ]);
        expect(selectVisibleOrders(createState("product-1-serial"))).toHaveLength(1);
    });

    it("selects the global search query", () => {
        expect(selectSearchQuery(createState("monitor"))).toBe("monitor");
    });
});

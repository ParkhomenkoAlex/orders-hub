import { describe, expect, it } from "vitest";
import { ordersDataReducer, type OrdersDataState } from "@/state/OrdersDataProvider";
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

const createState = (): OrdersDataState => {
    const firstOrder = makeOrder({ id: "order-1" });
    const secondOrder = makeOrder({ id: "order-2", title: "Design team delivery" });

    return {
        orders: [firstOrder, secondOrder],
        products: [
            makeProduct({ id: "product-1", orderId: firstOrder.id }),
            makeProduct({ id: "product-2", orderId: secondOrder.id }),
        ],
    };
};

describe("ordersDataReducer", () => {
    it("cascades product deletion when an order is deleted without mutating the prior state", () => {
        const state = createState();
        const stateBefore = structuredClone(state);

        const nextState = ordersDataReducer(state, {
            type: "orderDeleted",
            orderId: "order-1",
        });

        expect(nextState).toEqual({
            orders: [state.orders[1]],
            products: [state.products[1]],
        });
        expect(nextState).not.toBe(state);
        expect(nextState.orders).not.toBe(state.orders);
        expect(nextState.products).not.toBe(state.products);
        expect(state).toEqual(stateBefore);
    });

    it("removes only the requested product and leaves its order intact", () => {
        const state = createState();

        const nextState = ordersDataReducer(state, {
            type: "productDeleted",
            productId: "product-1",
        });

        expect(nextState.orders).toBe(state.orders);
        expect(nextState.products).toEqual([state.products[1]]);
    });

    it("adds a product when its parent order exists", () => {
        const state = createState();
        const product = makeProduct({ id: "product-3", orderId: "order-1" });

        const nextState = ordersDataReducer(state, { type: "productAdded", product });

        expect(nextState.orders).toBe(state.orders);
        expect(nextState.products).toEqual([...state.products, product]);
    });

    it("ignores a product whose parent order does not exist", () => {
        const state = createState();
        const product = makeProduct({ id: "orphan-product", orderId: "missing-order" });

        expect(ordersDataReducer(state, { type: "productAdded", product })).toBe(state);
    });

    it("appends an order without changing existing entities", () => {
        const state = createState();
        const order = makeOrder({ id: "order-3", title: "New order" });

        const nextState = ordersDataReducer(state, { type: "orderAdded", order });

        expect(nextState).toEqual({
            orders: [...state.orders, order],
            products: state.products,
        });
        expect(nextState.orders).not.toBe(state.orders);
        expect(nextState.products).toBe(state.products);
    });
});

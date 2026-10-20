"use client";

import { createContext, useContext, useMemo, useReducer, useState, type ReactNode } from "react";
import { initialOrders, initialProducts } from "@/data/orders";
import { groupProductsByOrderId } from "@/lib/order-domain";
import type { Order, Product, ProductDraft } from "@/types/domain";

interface OrdersDataState {
    orders: Order[];
    products: Product[];
}
type OrdersDataAction =
    | { type: "orderDeleted"; orderId: string }
    | { type: "productDeleted"; productId: string }
    | { type: "orderAdded"; order: Order }
    | { type: "productAdded"; product: Product };

const initialState: OrdersDataState = { orders: initialOrders, products: initialProducts };

const ordersDataReducer = (state: OrdersDataState, action: OrdersDataAction): OrdersDataState => {
    switch (action.type) {
        case "orderDeleted":
            return {
                orders: state.orders.filter((order) => order.id !== action.orderId),
                products: state.products.filter((product) => product.orderId !== action.orderId),
            };
        case "productDeleted":
            return {
                ...state,
                products: state.products.filter((product) => product.id !== action.productId),
            };
        case "orderAdded":
            return { ...state, orders: [...state.orders, action.order] };
        case "productAdded":
            return state.orders.some((order) => order.id === action.product.orderId)
                ? { ...state, products: [...state.products, action.product] }
                : state;
    }
};

interface OrdersDataContextValue extends OrdersDataState {
    productsByOrderId: Map<string, Product[]>;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    deleteOrder: (orderId: string) => void;
    deleteProduct: (productId: string) => void;
    addOrder: (title: string) => void;
    addProduct: (orderId: string, draft: ProductDraft) => void;
}

const OrdersDataContext = createContext<OrdersDataContextValue | null>(null);

export function OrdersDataProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(ordersDataReducer, initialState);
    const [searchQuery, setSearchQuery] = useState("");
    const productsByOrderId = useMemo(
        () => groupProductsByOrderId(state.products),
        [state.products],
    );
    const value = useMemo<OrdersDataContextValue>(
        () => ({
            ...state,
            productsByOrderId,
            searchQuery,
            setSearchQuery,
            deleteOrder: (orderId) => dispatch({ type: "orderDeleted", orderId }),
            deleteProduct: (productId) => dispatch({ type: "productDeleted", productId }),
            addOrder: (title) => {
                const normalizedTitle = title.trim();
                if (!normalizedTitle) {
                    return;
                }

                dispatch({
                    type: "orderAdded",
                    order: {
                        id: `order-${crypto.randomUUID()}`,
                        title: normalizedTitle,
                        createdAt: new Date().toISOString().slice(0, 10),
                    },
                });
            },
            addProduct: (orderId, draft) => {
                const usd = Number(draft.priceUsd);
                const uah = Number(draft.priceUah);

                if (
                    !state.orders.some((order) => order.id === orderId) ||
                    !draft.title.trim() ||
                    !draft.serialNumber.trim() ||
                    !Number.isFinite(usd) ||
                    !Number.isFinite(uah) ||
                    usd < 0 ||
                    uah < 0
                ) {
                    return;
                }

                dispatch({
                    type: "productAdded",
                    product: {
                        id: `product-${crypto.randomUUID()}`,
                        orderId,
                        title: draft.title.trim(),
                        serialNumber: draft.serialNumber.trim(),
                        type: draft.type,
                        status: draft.status,
                        condition: "New",
                        specification: "Standard",
                        groupName: "New arrivals",
                        warranty: { start: draft.warrantyStart, end: draft.warrantyEnd },
                        price: { usd, uah },
                    },
                });
            },
        }),
        [state, searchQuery, productsByOrderId],
    );
    return <OrdersDataContext.Provider value={value}>{children}</OrdersDataContext.Provider>;
}

export const useOrdersData = () => {
    const context = useContext(OrdersDataContext);
    if (!context) throw new Error("useOrdersData must be used within OrdersDataProvider");
    return context;
};

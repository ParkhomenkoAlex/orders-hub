import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialOrders, initialProducts } from "@/data/orders";
import { filterOrders, groupProductsByOrderId } from "@/lib/order-domain";
import type { Order, Product } from "@/types/domain";
import type { RootState } from "./store";

export interface InventoryState {
    orders: Order[];
    products: Product[];
    searchQuery: string;
}

const initialState: InventoryState = {
    orders: initialOrders,
    products: initialProducts,
    searchQuery: "",
};

const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {
        orderAdded: (state, action: PayloadAction<Order>) => {
            state.orders.push(action.payload);
        },
        orderDeleted: (state, action: PayloadAction<string>) => {
            state.orders = state.orders.filter((order) => order.id !== action.payload);
            state.products = state.products.filter((product) => product.orderId !== action.payload);
        },
        productAdded: (state, action: PayloadAction<Product>) => {
            if (state.orders.some((order) => order.id === action.payload.orderId)) {
                state.products.push(action.payload);
            }
        },
        productDeleted: (state, action: PayloadAction<string>) => {
            state.products = state.products.filter((product) => product.id !== action.payload);
        },
        searchQuerySet: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
    },
});

export const { orderAdded, orderDeleted, productAdded, productDeleted, searchQuerySet } =
    inventorySlice.actions;

export const selectOrders = (state: RootState) => state.inventory.orders;
export const selectProducts = (state: RootState) => state.inventory.products;
export const selectSearchQuery = (state: RootState) => state.inventory.searchQuery;

export const selectProductsByOrderId = createSelector([selectProducts], groupProductsByOrderId);

export const selectVisibleOrders = createSelector(
    [selectOrders, selectProductsByOrderId, selectSearchQuery],
    filterOrders,
);

export default inventorySlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export interface InventoryState {
    searchQuery: string;
}

const initialState: InventoryState = {
    searchQuery: "",
};

const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {
        searchQuerySet: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
    },
});

export const { searchQuerySet } = inventorySlice.actions;

export const selectSearchQuery = (state: RootState) => state.inventory.searchQuery;

export default inventorySlice.reducer;

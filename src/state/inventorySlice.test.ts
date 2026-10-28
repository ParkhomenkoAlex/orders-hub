import { describe, expect, it } from "vitest";
import inventoryReducer, { searchQuerySet } from "@/state/inventorySlice";

describe("inventorySlice", () => {
    it("updates the shared search query", () => {
        const state = { searchQuery: "" };

        const nextState = inventoryReducer(state, searchQuerySet("ThinkPad"));

        expect(nextState).toEqual({ searchQuery: "ThinkPad" });
        expect(state).toEqual({ searchQuery: "" });
    });
});

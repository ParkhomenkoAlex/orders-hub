import { describe, expect, it, vi } from "vitest";
import {
    PRODUCTS_TYPE_FILTER_STORAGE_KEY,
    persistProductTypeFilter,
    restoreProductTypeFilter,
} from "./typeFilterStorage";

const createStorage = (initial: Record<string, string> = {}) => {
    const values = new Map(Object.entries(initial));

    return {
        getItem: vi.fn((key: string) => values.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
            values.set(key, value);
        }),
        removeItem: vi.fn((key: string) => {
            values.delete(key);
        }),
    };
};

describe("Products Type filter storage", () => {
    it("uses all when no saved filter exists", () => {
        const storage = createStorage();

        expect(restoreProductTypeFilter(() => storage)).toBe("all");
        expect(storage.removeItem).not.toHaveBeenCalled();
    });

    it("restores a valid canonical product type", () => {
        const storage = createStorage({ [PRODUCTS_TYPE_FILTER_STORAGE_KEY]: "Monitors" });

        expect(restoreProductTypeFilter(() => storage)).toBe("Monitors");
        expect(storage.removeItem).not.toHaveBeenCalled();
    });

    it("persists selected canonical product types and removes all", () => {
        const storage = createStorage();

        persistProductTypeFilter("Laptops", () => storage);
        expect(storage.setItem).toHaveBeenCalledWith(PRODUCTS_TYPE_FILTER_STORAGE_KEY, "Laptops");

        persistProductTypeFilter("all", () => storage);
        expect(storage.removeItem).toHaveBeenCalledWith(PRODUCTS_TYPE_FILTER_STORAGE_KEY);
    });

    it("clears unsupported saved values and falls back to all", () => {
        const storage = createStorage({ [PRODUCTS_TYPE_FILTER_STORAGE_KEY]: "Мониторы" });

        expect(restoreProductTypeFilter(() => storage)).toBe("all");
        expect(storage.removeItem).toHaveBeenCalledWith(PRODUCTS_TYPE_FILTER_STORAGE_KEY);
    });

    it("fails safely when storage is unavailable", () => {
        const getStorage = () => {
            throw new Error("Storage access is blocked.");
        };

        expect(restoreProductTypeFilter(getStorage)).toBe("all");
        expect(() => persistProductTypeFilter("Monitors", getStorage)).not.toThrow();
    });
});

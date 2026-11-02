import { PRODUCT_TYPES } from "@/lib/order-domain";
import type { ProductType } from "@/types/domain";

export const PRODUCTS_TYPE_FILTER_STORAGE_KEY = "orders-hub.products.type-filter";

interface ProductTypeStorage {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
}

type GetProductTypeStorage = () => ProductTypeStorage;

export const isProductType = (value: string): value is ProductType =>
    PRODUCT_TYPES.includes(value as ProductType);

export const restoreProductTypeFilter = (
    getStorage: GetProductTypeStorage,
): ProductType | "all" => {
    try {
        const storage = getStorage();
        const value = storage.getItem(PRODUCTS_TYPE_FILTER_STORAGE_KEY);

        if (value === null) {
            return "all";
        }

        if (isProductType(value)) {
            return value;
        }

        storage.removeItem(PRODUCTS_TYPE_FILTER_STORAGE_KEY);
    } catch {
        // Storage can be disabled or blocked by browser privacy settings.
    }

    return "all";
};

export const persistProductTypeFilter = (
    activeType: ProductType | "all",
    getStorage: GetProductTypeStorage,
) => {
    try {
        const storage = getStorage();

        if (activeType === "all") {
            storage.removeItem(PRODUCTS_TYPE_FILTER_STORAGE_KEY);
            return;
        }

        storage.setItem(PRODUCTS_TYPE_FILTER_STORAGE_KEY, activeType);
    } catch {
        // Storage can be disabled or blocked by browser privacy settings.
    }
};

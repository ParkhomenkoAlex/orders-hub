import { PRODUCT_TYPES } from "./order-domain";
import type { Product, ProductType } from "@/types/domain";

export interface ProductTypeCount {
    type: ProductType;
    count: number;
}

export function getProductTypeCounts(products: Product[]): ProductTypeCount[] {
    const counts = new Map<ProductType, number>(PRODUCT_TYPES.map((type) => [type, 0]));

    for (const product of products) {
        counts.set(product.type, (counts.get(product.type) ?? 0) + 1);
    }

    return PRODUCT_TYPES.map((type) => ({ type, count: counts.get(type) ?? 0 }));
}

export function getProductTypeBarHeight(count: number, maxCount: number): number {
    if (count <= 0 || maxCount <= 0) {
        return 0;
    }

    return (count / maxCount) * 100;
}

import { calculateInventoryAnalytics } from "./inventory-analytics";
import type { Order, Product } from "@/types/domain";

export interface OrderStatusSummaryInput {
    orders: Order[];
    products: Product[];
}

export const createOrderStatusSummaryMetrics = ({ orders, products }: OrderStatusSummaryInput) => {
    const analytics = calculateInventoryAnalytics({
        orders: orders.map(({ id }) => ({ id })),
        products: products.map(({ id, type, status }) => ({ id, type, status })),
    });

    return {
        totalOrders: analytics.totalOrders,
        totalProducts: analytics.totalProducts,
        availableProducts: analytics.productsByStatus.Available,
    };
};

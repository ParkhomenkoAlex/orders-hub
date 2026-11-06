import { PRODUCT_TYPES } from "./order-domain";
import type { Order, Product, ProductStatus, ProductType } from "@/types/domain";

const PRODUCT_STATUSES: readonly ProductStatus[] = ["Available", "In service", "Reserved"];

export interface InventoryAnalyticsInput {
    orders: Array<Pick<Order, "id">>;
    products: Array<Pick<Product, "id" | "type" | "status">>;
}

export interface InventoryAnalytics {
    totalOrders: number;
    totalProducts: number;
    productsByType: Record<ProductType, number>;
    productsByStatus: Record<ProductStatus, number>;
}

export interface InventoryAnalyticsWorkerRequest {
    type: "calculate";
    requestId: number;
    input: InventoryAnalyticsInput;
}

export interface InventoryAnalyticsWorkerResult {
    type: "result";
    requestId: number;
    analytics: InventoryAnalytics;
}

export interface InventoryAnalyticsWorkerError {
    type: "error";
    requestId: number;
}

export type InventoryAnalyticsWorkerResponse =
    InventoryAnalyticsWorkerResult | InventoryAnalyticsWorkerError;

const hasId = (value: { id: unknown }): value is { id: string } =>
    typeof value.id === "string" && value.id.length > 0;

const isProductType = (value: unknown): value is ProductType =>
    typeof value === "string" && PRODUCT_TYPES.includes(value as ProductType);

const isProductStatus = (value: unknown): value is ProductStatus =>
    typeof value === "string" && PRODUCT_STATUSES.includes(value as ProductStatus);

export function calculateInventoryAnalytics(input: InventoryAnalyticsInput): InventoryAnalytics {
    const productsByType = Object.fromEntries(PRODUCT_TYPES.map((type) => [type, 0])) as Record<
        ProductType,
        number
    >;
    const productsByStatus = Object.fromEntries(
        PRODUCT_STATUSES.map((status) => [status, 0]),
    ) as Record<ProductStatus, number>;
    const orderIds = new Set<string>();
    const productIds = new Set<string>();

    for (const order of Array.isArray(input.orders) ? input.orders : []) {
        if (hasId(order)) {
            orderIds.add(order.id);
        }
    }

    for (const product of Array.isArray(input.products) ? input.products : []) {
        if (!hasId(product) || productIds.has(product.id)) {
            continue;
        }

        productIds.add(product.id);

        if (isProductType(product.type)) {
            productsByType[product.type] += 1;
        }

        if (isProductStatus(product.status)) {
            productsByStatus[product.status] += 1;
        }
    }

    return {
        totalOrders: orderIds.size,
        totalProducts: productIds.size,
        productsByType,
        productsByStatus,
    };
}

export function createInventoryAnalyticsWorkerRequest(
    requestId: number,
    input: InventoryAnalyticsInput,
): InventoryAnalyticsWorkerRequest {
    return { type: "calculate", requestId, input };
}

export function handleInventoryAnalyticsWorkerRequest(
    request: InventoryAnalyticsWorkerRequest,
): InventoryAnalyticsWorkerResponse {
    try {
        return {
            type: "result",
            requestId: request.requestId,
            analytics: calculateInventoryAnalytics(request.input),
        };
    } catch {
        return { type: "error", requestId: request.requestId };
    }
}

export const isCurrentInventoryAnalyticsResponse = (
    response: InventoryAnalyticsWorkerResponse,
    latestRequestId: number,
) => response.requestId === latestRequestId;

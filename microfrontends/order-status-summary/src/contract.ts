export const ORDER_STATUS_SUMMARY_TAG = "orders-hub-order-status-summary";
export const ORDER_STATUS_SUMMARY_VERSION = 1 as const;

export type OrderStatusSummaryLocale = "en" | "ru";

export interface OrderStatusSummaryMetrics {
    totalOrders: number;
    totalProducts: number;
    availableProducts: number;
}

export interface OrderStatusSummaryLabels {
    totalOrders: string;
    totalProducts: string;
    availableProducts: string;
}

export interface OrderStatusSummaryContract {
    version: typeof ORDER_STATUS_SUMMARY_VERSION;
    locale: OrderStatusSummaryLocale;
    metrics: OrderStatusSummaryMetrics;
    labels: OrderStatusSummaryLabels;
}

const isCount = (value: unknown) =>
    typeof value === "number" && Number.isInteger(value) && value >= 0;

const isText = (value: unknown) => typeof value === "string" && value.length > 0;

export const isOrderStatusSummaryContract = (
    value: unknown,
): value is OrderStatusSummaryContract => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const contract = value as Partial<OrderStatusSummaryContract>;
    const metrics = contract.metrics as Partial<OrderStatusSummaryMetrics> | undefined;
    const labels = contract.labels as Partial<OrderStatusSummaryLabels> | undefined;

    return (
        contract.version === ORDER_STATUS_SUMMARY_VERSION &&
        (contract.locale === "en" || contract.locale === "ru") &&
        Boolean(metrics) &&
        isCount(metrics?.totalOrders) &&
        isCount(metrics?.totalProducts) &&
        isCount(metrics?.availableProducts) &&
        Boolean(labels) &&
        isText(labels?.totalOrders) &&
        isText(labels?.totalProducts) &&
        isText(labels?.availableProducts)
    );
};

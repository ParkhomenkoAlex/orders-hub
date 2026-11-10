export const ORDER_STATUS_SUMMARY_TAG = "orders-hub-order-status-summary";
export const ORDER_STATUS_SUMMARY_VERSION = 1;
const isCount = (value) => typeof value === "number" && Number.isInteger(value) && value >= 0;
const isText = (value) => typeof value === "string" && value.length > 0;
export const isOrderStatusSummaryContract = (value) => {
    if (!value || typeof value !== "object") {
        return false;
    }
    const contract = value;
    const metrics = contract.metrics;
    const labels = contract.labels;
    return (contract.version === ORDER_STATUS_SUMMARY_VERSION &&
        (contract.locale === "en" || contract.locale === "ru") &&
        Boolean(metrics) &&
        isCount(metrics?.totalOrders) &&
        isCount(metrics?.totalProducts) &&
        isCount(metrics?.availableProducts) &&
        Boolean(labels) &&
        isText(labels?.totalOrders) &&
        isText(labels?.totalProducts) &&
        isText(labels?.availableProducts));
};

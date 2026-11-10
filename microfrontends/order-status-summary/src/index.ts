import {
    isOrderStatusSummaryContract,
    ORDER_STATUS_SUMMARY_TAG,
    ORDER_STATUS_SUMMARY_VERSION,
    type OrderStatusSummaryContract,
} from "./contract.js";

const escapeHtml = (value: string | number) =>
    String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

export const createOrderStatusSummaryMarkup = (contract: OrderStatusSummaryContract) => `
    <style>
        :host { display: block; }
        .orderStatusSummary { display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .orderStatusSummary__metric { background: #f7fafb; border: 1px solid #d9e1e5; border-radius: 4px; display: grid; gap: 4px; padding: 14px; }
        .orderStatusSummary__label { color: #84939d; font: 13px/1.3 Arial, sans-serif; }
        .orderStatusSummary__value { color: #263b49; font: 700 24px/1 Arial, sans-serif; }
        @media (max-width: 560px) { .orderStatusSummary { grid-template-columns: 1fr; } }
    </style>
    <section class="orderStatusSummary" aria-label="${escapeHtml(contract.labels.totalProducts)}">
        <div class="orderStatusSummary__metric">
            <span class="orderStatusSummary__label">${escapeHtml(contract.labels.totalOrders)}</span>
            <strong class="orderStatusSummary__value">${escapeHtml(contract.metrics.totalOrders)}</strong>
        </div>
        <div class="orderStatusSummary__metric">
            <span class="orderStatusSummary__label">${escapeHtml(contract.labels.totalProducts)}</span>
            <strong class="orderStatusSummary__value">${escapeHtml(contract.metrics.totalProducts)}</strong>
        </div>
        <div class="orderStatusSummary__metric">
            <span class="orderStatusSummary__label">${escapeHtml(contract.labels.availableProducts)}</span>
            <strong class="orderStatusSummary__value">${escapeHtml(contract.metrics.availableProducts)}</strong>
        </div>
    </section>
`;

class OrderStatusSummaryElement extends HTMLElement {
    private readonly root = this.attachShadow({ mode: "open" });

    set summary(value: unknown) {
        if (!isOrderStatusSummaryContract(value)) {
            this.dispatchEvent(
                new CustomEvent("orders-hub-order-status-summary:error", {
                    bubbles: true,
                    composed: true,
                    detail: { reason: "invalid-contract" },
                }),
            );
            return;
        }

        this.lang = value.locale;
        this.root.innerHTML = createOrderStatusSummaryMarkup(value);
        this.dispatchEvent(
            new CustomEvent("orders-hub-order-status-summary:ready", {
                bubbles: true,
                composed: true,
                detail: { version: ORDER_STATUS_SUMMARY_VERSION },
            }),
        );
    }
}

if (typeof customElements !== "undefined" && !customElements.get(ORDER_STATUS_SUMMARY_TAG)) {
    customElements.define(ORDER_STATUS_SUMMARY_TAG, OrderStatusSummaryElement);
}

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import {
    getOrderStatusSummaryMicrofrontendUrl,
    OrderStatusSummaryMicrofrontendContent,
} from "./OrderStatusSummaryMicrofrontend";

describe("OrderStatusSummaryMicrofrontend", () => {
    it("uses a configured remote bundle URL or the independently built local fallback", () => {
        expect(getOrderStatusSummaryMicrofrontendUrl("https://cdn.example.com/summary.js")).toBe(
            "https://cdn.example.com/summary.js",
        );
        expect(getOrderStatusSummaryMicrofrontendUrl()).toBe(
            "/microfrontends/order-status-summary/index.js",
        );
    });

    it("renders localized loading and unavailable fallbacks without the remote bundle", () => {
        const loading = renderToStaticMarkup(
            <I18nProvider initialLocale="en">
                <OrderStatusSummaryMicrofrontendContent state="loading" />
            </I18nProvider>,
        );
        const error = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <OrderStatusSummaryMicrofrontendContent state="error" onRetry={() => {}} />
            </I18nProvider>,
        );

        expect(loading).toContain("Loading inventory status");
        expect(error).toContain("Сводка статуса инвентаря недоступна.");
        expect(error).toContain("Повторить");
    });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { InventoryAnalyticsContent } from "./InventoryAnalytics";

describe("InventoryAnalyticsContent", () => {
    it("renders localized loading and error states", () => {
        const loading = renderToStaticMarkup(
            <I18nProvider initialLocale="en">
                <InventoryAnalyticsContent state={{ status: "loading" }} />
            </I18nProvider>,
        );
        const error = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <InventoryAnalyticsContent state={{ status: "error" }} />
            </I18nProvider>,
        );

        expect(loading).toContain("Calculating inventory analytics");
        expect(error).toContain("Аналитика инвентаря недоступна.");
    });

    it("renders worker-calculated totals and localized status labels", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <InventoryAnalyticsContent
                    state={{
                        status: "ready",
                        analytics: {
                            totalOrders: 2,
                            totalProducts: 3,
                            productsByType: {
                                Monitors: 1,
                                Laptops: 1,
                                Motherboards: 0,
                                Accessories: 1,
                            },
                            productsByStatus: {
                                Available: 1,
                                "In service": 1,
                                Reserved: 1,
                            },
                        },
                    }}
                />
            </I18nProvider>,
        );

        expect(markup).toContain("Всего приходов");
        expect(markup).toContain("Всего продуктов");
        expect(markup).toContain("На обслуживании");
        expect(markup).toContain(">3</strong>");
    });
});

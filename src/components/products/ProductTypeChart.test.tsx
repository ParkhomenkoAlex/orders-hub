import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { Product } from "@/types/domain";
import { ProductTypeChart } from "./ProductTypeChart";

const product: Product = {
    id: "product-1",
    orderId: "order-1",
    title: "Monitor",
    serialNumber: "SN-001",
    type: "Monitors",
    status: "Available",
    condition: "New",
    specification: "4K",
    groupName: "Design",
    warranty: { start: "2025-01-01", end: "2026-01-01" },
    price: { usd: 100, uah: 4000 },
};

describe("ProductTypeChart", () => {
    it("renders localized, interactive bars from canonical product types", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <ProductTypeChart
                    products={[product]}
                    activeType="Monitors"
                    isLoading={false}
                    isError={false}
                    onTypeSelect={() => undefined}
                />
            </I18nProvider>,
        );

        expect(markup).toContain("Продукты по типу");
        expect(markup).toContain('aria-pressed="true"');
        expect(markup).toContain('aria-label="Мониторы: 1"');
        expect(markup).toContain("Выбран фильтр: Мониторы");
        expect(markup).toContain("--product-chart-height:100%");
        expect(markup.match(/--product-chart-height/g)).toHaveLength(1);
    });

    it("renders localized loading, empty, and error states", () => {
        const loading = renderToStaticMarkup(
            <I18nProvider initialLocale="en">
                <ProductTypeChart
                    products={[]}
                    activeType="all"
                    isLoading
                    isError={false}
                    onTypeSelect={() => undefined}
                />
            </I18nProvider>,
        );
        const empty = renderToStaticMarkup(
            <I18nProvider initialLocale="en">
                <ProductTypeChart
                    products={[]}
                    activeType="all"
                    isLoading={false}
                    isError={false}
                    onTypeSelect={() => undefined}
                />
            </I18nProvider>,
        );
        const error = renderToStaticMarkup(
            <I18nProvider initialLocale="en">
                <ProductTypeChart
                    products={[]}
                    activeType="all"
                    isLoading={false}
                    isError
                    onTypeSelect={() => undefined}
                />
            </I18nProvider>,
        );

        expect(loading).toContain("Loading product chart");
        expect(empty).toContain("No product data to chart yet.");
        expect(error).toContain("Product chart is unavailable.");
    });
});

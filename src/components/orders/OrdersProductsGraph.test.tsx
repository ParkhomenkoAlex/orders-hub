import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { Order, Product } from "@/types/domain";
import { OrdersProductsGraph } from "./OrdersProductsGraph";

const order: Order = { id: "order-1", title: "Office equipment", createdAt: "2025-01-01" };
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

const renderGraph = (props: Partial<React.ComponentProps<typeof OrdersProductsGraph>> = {}) =>
    renderToStaticMarkup(
        <I18nProvider initialLocale="ru">
            <OrdersProductsGraph orders={[order]} products={[product]} {...props} />
        </I18nProvider>,
    );

describe("OrdersProductsGraph", () => {
    it("renders localized real relationship nodes and an accessible text relationship", () => {
        const markup = renderGraph();

        expect(markup).toContain("Приходы и продукты");
        expect(markup).toContain("Office equipment");
        expect(markup).toContain("Monitor");
        expect(markup).toContain("Office equipment → Monitor");
        expect(markup).toContain('role="button"');
        expect(markup).toContain('aria-label="Выбрать связь: Office equipment — Monitor"');
    });

    it("renders localized loading, empty, and error states", () => {
        const loading = renderGraph({ isLoading: true });
        const empty = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <OrdersProductsGraph orders={[]} products={[]} />
            </I18nProvider>,
        );
        const error = renderGraph({ isError: true });

        expect(loading).toContain("Загрузка графа связей");
        expect(empty).toContain("Пока нет связей между приходами и продуктами.");
        expect(error).toContain("Граф связей недоступен.");
    });
});

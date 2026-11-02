import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { formatCurrency, formatLongDate } from "@/lib/formatters";
import type { Order, Product } from "@/types/domain";

const order: Order = {
    id: "order-1",
    title: "Office equipment",
    createdAt: "2025-01-01",
};

const product: Product = {
    id: "product-1",
    orderId: order.id,
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

const state = vi.hoisted(() => ({
    deleteProduct: vi.fn(),
}));

vi.mock("@/state/hooks", () => ({
    useAppSelector: () => "",
}));

vi.mock("@/state/inventoryApi", () => ({
    useDeleteProductMutation: () => [state.deleteProduct],
    useGetOrdersQuery: () => ({ data: [order], isLoading: false, isError: false }),
    useGetProductsQuery: () => ({ data: [product], isLoading: false, isError: false }),
}));

import { ProductsWorkspace } from "./ProductsWorkspace";

describe("ProductsWorkspace", () => {
    it("translates visible labels while retaining canonical filter values", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <ProductsWorkspace />
            </I18nProvider>,
        );

        expect(markup).toContain("Продукты");
        expect(markup).toContain('for="product-type">Тип');
        expect(markup).toMatch(/value="Monitors"[^>]*>Мониторы<\/option>/);
        expect(markup).toContain('for="product-specification">Спецификация');
        expect(markup).toContain('<th scope="col">Статус</th>');
        expect(markup).toContain('<th scope="col">Состояние</th>');
        expect(markup).toContain(">Доступен</span>");
        expect(markup).toContain("<td>Новый</td>");
        expect(markup).toContain(">с</small>");
        expect(markup).toContain(">по</small>");
        expect(markup).toContain(formatLongDate(product.warranty.start, "ru"));
        expect(markup).toContain(formatCurrency(product.price.usd, "USD", "ru"));
        expect(markup).toContain('aria-label="Удалить Monitor"');
    });
});

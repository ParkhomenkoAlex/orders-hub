import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { Order, Product } from "@/types/domain";
import { OrderDetails } from "./OrderDetails";

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

describe("OrderDetails", () => {
    it("renders translated product status and actions", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <OrderDetails
                    order={order}
                    products={[product]}
                    isClosing={false}
                    onClose={() => undefined}
                    onCloseAnimationEnd={() => undefined}
                    onDeleteProduct={() => undefined}
                    onAddProduct={() => undefined}
                />
            </I18nProvider>,
        );

        expect(markup).toContain("Добавить продукт");
        expect(markup).toContain(">Доступен</span>");
        expect(markup).toContain('aria-label="Доступен: Продукт"');
        expect(markup).toContain('aria-label="Удалить Monitor"');
    });
});

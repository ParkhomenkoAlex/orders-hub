import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { Order, Product } from "@/types/domain";
import { DeleteOrderModal } from "./DeleteOrderModal";

const order: Order = {
    id: "order-1",
    title: "Office equipment",
    createdAt: "2025-01-01",
};

const makeProduct = (id: string): Product => ({
    id,
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
});

describe("DeleteOrderModal", () => {
    it("uses Russian plural forms while preserving the order title", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <DeleteOrderModal
                    order={order}
                    products={[makeProduct("product-1"), makeProduct("product-2")]}
                    onCancel={() => undefined}
                    onConfirm={() => undefined}
                />
            </I18nProvider>,
        );

        expect(markup).toContain(">Удалить этот приход?</h2>");
        expect(markup).toContain("<strong>Office equipment</strong>");
        expect(markup).toContain("2 связанных продукта будут удалены из этой сессии.");
        expect(markup).toContain('aria-label="Закрыть подтверждение"');
    });
});

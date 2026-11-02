import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { Product } from "@/types/domain";
import { DeleteProductModal } from "./DeleteProductModal";

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

describe("DeleteProductModal", () => {
    it("renders the translated confirmation while preserving the product title", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <DeleteProductModal
                    product={product}
                    onCancel={() => undefined}
                    onConfirm={() => undefined}
                />
            </I18nProvider>,
        );

        expect(markup).toContain(">Удалить этот продукт?</h2>");
        expect(markup).toContain("<strong>Monitor</strong>");
        expect(markup).toContain("будет удалён из этого прихода. Сам приход останется доступным.");
        expect(markup).toContain(">Отмена</button>");
        expect(markup).toContain(">Удалить</button>");
    });
});

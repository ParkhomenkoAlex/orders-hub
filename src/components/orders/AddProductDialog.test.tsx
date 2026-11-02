import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { ProductDraft } from "@/types/domain";
import { AddProductDialog, validateProductDraft } from "./AddProductDialog";

const validDraft: ProductDraft = {
    title: "Monitor",
    serialNumber: "SN-001",
    type: "Monitors",
    status: "Available",
    specification: "4K",
    warrantyStart: "2025-01-01",
    warrantyEnd: "2026-01-01",
    priceUsd: "100",
    priceUah: "4000",
};

describe("AddProductDialog", () => {
    it("keeps validation rules while storing translation keys", () => {
        expect(
            validateProductDraft({
                ...validDraft,
                title: " ",
                serialNumber: "",
                warrantyStart: "invalid",
                warrantyEnd: "2026-01-01",
                priceUsd: "-1",
                priceUah: "",
            }),
        ).toEqual({
            title: "productTitleRequired",
            serialNumber: "serialNumberRequired",
            warrantyStart: "warrantyStartInvalid",
            priceUsd: "priceUsdInvalid",
            priceUah: "priceUahInvalid",
        });
        expect(
            validateProductDraft({
                ...validDraft,
                warrantyStart: "2026-01-01",
                warrantyEnd: "2025-01-01",
            }),
        ).toMatchObject({ warrantyEnd: "warrantyEndBeforeStart" });
        expect(validateProductDraft(validDraft)).toEqual({});
    });

    it("renders localized form labels while preserving canonical option values", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <AddProductDialog
                    orderTitle="Office equipment"
                    onCancel={() => undefined}
                    onCreate={() => undefined}
                />
            </I18nProvider>,
        );

        expect(markup).toContain(">Добавить продукт</h2>");
        expect(markup).toContain('for="product-specification">Спецификация</label>');
        expect(markup).toMatch(/value="Accessories"[^>]*>Аксессуары<\/option>/);
        expect(markup).toMatch(/value="Available"[^>]*>Доступен<\/option>/);
    });
});

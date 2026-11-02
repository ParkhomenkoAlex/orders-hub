import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { ProductsTableSkeleton } from "./ProductsTableSkeleton";

describe("ProductsTableSkeleton", () => {
    it("renders translated loading and table labels", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <ProductsTableSkeleton />
            </I18nProvider>,
        );

        expect(markup).toContain('aria-label="Загрузка продуктов"');
        expect(markup).toContain('<th scope="col">Продукт</th>');
        expect(markup).toContain('<th scope="col">Дата прихода</th>');
        expect(markup).toContain(">Действия</span>");
    });
});

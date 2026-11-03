import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { OrderDetailsSkeleton } from "./OrderDetailsSkeleton";

describe("OrderDetailsSkeleton", () => {
    it("renders a translated, noninteractive loading panel", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <OrderDetailsSkeleton />
            </I18nProvider>,
        );

        expect(markup).toContain('aria-busy="true"');
        expect(markup).toContain('role="status"');
        expect(markup).toContain("Загрузка приходов");
        expect(markup).toContain('aria-hidden="true"');
        expect(markup).not.toContain("<button");
    });
});

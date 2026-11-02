import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";

vi.mock("next/navigation", () => ({
    usePathname: () => "/products",
}));

import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
    it("renders translated navigation and accessibility labels", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <Sidebar />
            </I18nProvider>,
        );

        expect(markup).toContain('alt="Фото профиля"');
        expect(markup).toContain('aria-label="Настройки"');
        expect(markup).toContain('aria-label="Основная навигация"');
        expect(markup).toContain(">Приходы</a>");
        expect(markup).toMatch(/<a[^>]*aria-current="page"[^>]*href="\/products"/);
        expect(markup).toContain(">Продукты</a>");
    });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";

const state = vi.hoisted(() => ({
    dispatch: vi.fn(),
    searchQuery: "",
}));

vi.mock("@/state/hooks", () => ({
    useAppDispatch: () => state.dispatch,
    useAppSelector: () => state.searchQuery,
}));
vi.mock("./ActiveSessions", () => ({ ActiveSessions: () => <span>Sessions</span> }));
vi.mock("./CurrentDateTime", () => ({ CurrentDateTime: () => <time>Today</time> }));

import { TopMenu } from "./TopMenu";

describe("TopMenu", () => {
    it("renders its fixed labels from the active translation catalog", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <TopMenu />
            </I18nProvider>,
        );

        expect(markup).toContain("Inventory");
        expect(markup).toContain('aria-label="Главная страница Orders Hub"');
        expect(markup).toContain('placeholder="Поиск приходов и продуктов"');
        expect(markup).toContain('aria-label="Язык"');
        expect(markup).toContain(">EN</option>");
        expect(markup).toContain(">RU</option>");
    });
});

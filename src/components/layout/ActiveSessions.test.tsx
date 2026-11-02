import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { ActiveSessions } from "./ActiveSessions";

describe("ActiveSessions", () => {
    it("renders a translated unavailable state and accessible status", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <ActiveSessions
                    className="sessions"
                    dotClassName="dot"
                    offlineDotClassName="offline"
                />
            </I18nProvider>,
        );

        expect(markup).toContain("Сессии: недоступно");
        expect(markup).toContain('aria-label="Активные сессии: недоступно"');
    });
});

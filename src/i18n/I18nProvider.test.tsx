import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider, createLocaleCookie, useTranslation } from "./I18nProvider";

function TranslationProbe() {
    const { locale, t } = useTranslation();

    return <span>{`${locale}:${t.navigation.orders}`}</span>;
}

describe("I18nProvider", () => {
    it("provides the server-resolved locale and its translations", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <TranslationProbe />
            </I18nProvider>,
        );

        expect(markup).toContain("ru:Приходы");
    });

    it("serializes a persistent locale cookie with secure handling", () => {
        expect(createLocaleCookie("ru", false)).toBe(
            "orders-hub.locale=ru; Path=/; SameSite=Lax; Max-Age=31536000",
        );
        expect(createLocaleCookie("en", true)).toBe(
            "orders-hub.locale=en; Path=/; SameSite=Lax; Max-Age=31536000; Secure",
        );
    });
});

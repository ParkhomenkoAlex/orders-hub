import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { OfflineFallback } from "./OfflineFallback";

describe("OfflineFallback", () => {
    it("renders the localized offline shell without application content", () => {
        const markup = renderToStaticMarkup(
            <I18nProvider initialLocale="ru">
                <OfflineFallback />
            </I18nProvider>,
        );

        expect(markup).toContain("Нет подключения к сети");
        expect(markup).toContain("после восстановления подключения");
        expect(markup).toContain('role="status"');
    });
});

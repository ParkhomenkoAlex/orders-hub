import { describe, expect, it } from "vitest";
import {
    DEFAULT_LOCALE,
    getIntlLocale,
    isLocale,
    LOCALE_COOKIE_NAME,
    resolveLocale,
    SUPPORTED_LOCALES,
} from "./config";
import { messages } from "./messages";

const getMessageKeys = (value: object, prefix = ""): string[] =>
    Object.entries(value).flatMap(([key, item]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        return typeof item === "string" ? [path] : getMessageKeys(item, path);
    });

describe("locale configuration", () => {
    it("recognizes the supported locales", () => {
        expect(SUPPORTED_LOCALES).toEqual(["en", "ru"]);
        expect(isLocale("en")).toBe(true);
        expect(isLocale("ru")).toBe(true);
        expect(isLocale("uk")).toBe(false);
        expect(isLocale(undefined)).toBe(false);
    });

    it("falls back to English for missing or unsupported locale values", () => {
        expect(DEFAULT_LOCALE).toBe("en");
        expect(resolveLocale("ru")).toBe("ru");
        expect(resolveLocale("uk")).toBe("en");
        expect(resolveLocale(null)).toBe("en");
        expect(resolveLocale(undefined)).toBe("en");
    });

    it("defines stable cookie and Intl locale values", () => {
        expect(LOCALE_COOKIE_NAME).toBe("orders-hub.locale");
        expect(getIntlLocale("en")).toBe("en-GB");
        expect(getIntlLocale("ru")).toBe("ru-RU");
    });
});

describe("translation catalogs", () => {
    it("keeps every locale catalog structurally aligned", () => {
        const englishKeys = getMessageKeys(messages.en);

        for (const locale of SUPPORTED_LOCALES) {
            expect(getMessageKeys(messages[locale])).toEqual(englishKeys);
        }
    });
});

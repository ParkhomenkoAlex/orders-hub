export const SUPPORTED_LOCALES = ["en", "ru"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "orders-hub.locale";

const intlLocales: Record<Locale, string> = {
    en: "en-GB",
    ru: "ru-RU",
};

export const isLocale = (value: unknown): value is Locale =>
    typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);

export const resolveLocale = (value: unknown): Locale => (isLocale(value) ? value : DEFAULT_LOCALE);

export const getIntlLocale = (locale: Locale) => intlLocales[locale];

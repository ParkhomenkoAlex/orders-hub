import { DEFAULT_LOCALE, getIntlLocale, type Locale } from "@/i18n/config";

const getLongDateFormatter = (locale: Locale) =>
    new Intl.DateTimeFormat(getIntlLocale(locale), {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const getShortDateFormatter = (locale: Locale) =>
    new Intl.DateTimeFormat(getIntlLocale(locale), { day: "2-digit", month: "2-digit" });

const getCurrencyFormatter = (locale: Locale, currency: "USD" | "UAH") =>
    new Intl.NumberFormat(getIntlLocale(locale), {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const toLocalDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ||
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
        ? null
        : date;
};

export const formatLongDate = (value: string, locale: Locale = DEFAULT_LOCALE) => {
    const date = toLocalDate(value);
    return date ? getLongDateFormatter(locale).format(date) : "—";
};

export const formatShortDate = (value: string, locale: Locale = DEFAULT_LOCALE) => {
    const date = toLocalDate(value);
    return date ? getShortDateFormatter(locale).format(date) : "—";
};

export const formatCurrency = (
    value: number,
    currency: "USD" | "UAH",
    locale: Locale = DEFAULT_LOCALE,
) => getCurrencyFormatter(locale, currency).format(value);

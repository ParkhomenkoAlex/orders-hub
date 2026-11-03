import { DEFAULT_LOCALE, getIntlLocale, type Locale } from "@/i18n/config";

const getLongDateFormatter = (locale: Locale) =>
    new Intl.DateTimeFormat(getIntlLocale(locale), {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const getShortDateFormatter = (locale: Locale) =>
    new Intl.DateTimeFormat(getIntlLocale(locale), { day: "2-digit", month: "2-digit" });

type Currency = "USD" | "UAH";

interface CurrencyFormat {
    decimalSeparator: string;
    groupSeparator: string;
    prefix?: string;
    suffix?: string;
}

const currencyFormats: Record<Locale, Record<Currency, CurrencyFormat>> = {
    en: {
        USD: { decimalSeparator: ".", groupSeparator: ",", prefix: "US$" },
        UAH: { decimalSeparator: ".", groupSeparator: ",", prefix: "UAH " },
    },
    ru: {
        USD: { decimalSeparator: ",", groupSeparator: "\u00a0", suffix: " $" },
        UAH: { decimalSeparator: ",", groupSeparator: "\u00a0", suffix: " грн." },
    },
};

const formatCurrencyNumber = (value: number, format: CurrencyFormat) => {
    const sign = value < 0 ? "-" : "";
    const [whole, fraction] = Math.abs(value).toFixed(2).split(".");
    const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, format.groupSeparator);

    return `${sign}${groupedWhole}${format.decimalSeparator}${fraction}`;
};

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
    currency: Currency,
    locale: Locale = DEFAULT_LOCALE,
) => {
    const format = currencyFormats[locale][currency];
    const amount = formatCurrencyNumber(value, format);

    return `${format.prefix ?? ""}${amount}${format.suffix ?? ""}`;
};

const locale = "en-GB";
const longDateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit" });
const currencyFormatters = {
    USD: new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }),
    UAH: new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "UAH",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }),
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

export const formatLongDate = (value: string) => {
    const date = toLocalDate(value);
    return date ? longDateFormatter.format(date) : "—";
};

export const formatShortDate = (value: string) => {
    const date = toLocalDate(value);
    return date ? shortDateFormatter.format(date) : "—";
};

export const formatCurrency = (value: number, currency: "USD" | "UAH") =>
    currencyFormatters[currency].format(value);

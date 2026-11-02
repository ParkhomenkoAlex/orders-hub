"use client";

import { useEffect, useState } from "react";
import { getIntlLocale, type Locale } from "@/i18n/config";
import { useTranslation } from "@/i18n/I18nProvider";
import styles from "./CurrentDateTime.module.scss";

export const formatCurrentDateTime = (date: Date, locale: Locale) => {
    const intlLocale = getIntlLocale(locale);

    return {
        weekday: new Intl.DateTimeFormat(intlLocale, { weekday: "long" }).format(date),
        date: new Intl.DateTimeFormat(intlLocale, {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(date),
        time: new Intl.DateTimeFormat(intlLocale, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }).format(date),
    };
};

export function CurrentDateTime() {
    const { locale, t } = useTranslation();
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        const initialUpdate = window.setTimeout(() => setNow(new Date()), 0);
        const interval = window.setInterval(() => setNow(new Date()), 1000);

        return () => {
            window.clearTimeout(initialUpdate);
            window.clearInterval(interval);
        };
    }, []);

    const currentDateTime = now ? formatCurrentDateTime(now, locale) : null;
    const weekday = currentDateTime?.weekday ?? t.dateTime.today;
    const date = currentDateTime?.date ?? "-- --- ----";
    const time = currentDateTime?.time ?? "--:--:--";

    return (
        <div className={styles.dateTime}>
            <span>{weekday}</span>
            <strong>{date}</strong>
            <span className={styles.dateTime__clock}>◷</span>
            <time dateTime={now?.toTimeString().slice(0, 8)}>{time}</time>
        </div>
    );
}

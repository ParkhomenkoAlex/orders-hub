"use client";

import { useEffect, useState } from "react";
import styles from "./CurrentDateTime.module.scss";

const weekdayFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "long" });
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
});

export function CurrentDateTime() {
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        const initialUpdate = window.setTimeout(() => setNow(new Date()), 0);
        const interval = window.setInterval(() => setNow(new Date()), 1000);

        return () => {
            window.clearTimeout(initialUpdate);
            window.clearInterval(interval);
        };
    }, []);

    const weekday = now ? weekdayFormatter.format(now) : "Today";
    const date = now ? dateFormatter.format(now) : "-- --- ----";
    const time = now ? timeFormatter.format(now) : "--:--:--";

    return (
        <div className={styles.dateTime}>
            <span>{weekday}</span>
            <strong>{date}</strong>
            <span className={styles.dateTime__clock}>◷</span>
            <time dateTime={now?.toTimeString().slice(0, 8)}>{time}</time>
        </div>
    );
}

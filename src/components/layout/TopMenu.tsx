"use client";

import { useEffect, useState } from "react";
import { useOrdersData } from "@/state/OrdersDataProvider";

const getCurrentTime = () => new Date();
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

export function TopMenu() {
    const { searchQuery, setSearchQuery } = useOrdersData();
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        const initialUpdate = window.setTimeout(() => setNow(getCurrentTime()), 0);
        const timer = window.setInterval(() => setNow(getCurrentTime()), 1000);
        return () => {
            window.clearTimeout(initialUpdate);
            window.clearInterval(timer);
        };
    }, []);

    const weekday = now ? weekdayFormatter.format(now) : "Today";
    const date = now ? dateFormatter.format(now) : "-- --- ----";
    const time = now ? timeFormatter.format(now) : "--:--:--";

    return (
        <header className="top-menu d-flex align-items-center">
            <div className="top-menu__brand" aria-label="Orders Hub">
                <span className="top-menu__badge">◆</span>
                <span>INVENTORY</span>
            </div>
            <div className="top-menu__search flex-grow-1">
                <label className="visually-hidden" htmlFor="global-search">
                    Search orders and products
                </label>
                <input
                    id="global-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search orders and products"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}
            </div>
            <div className="top-menu__time">
                <span>{weekday}</span>
                <strong>{date}</strong>
                <span className="top-menu__clock">◷</span>
                <time dateTime={now?.toTimeString().slice(0, 8)}>{time}</time>
            </div>
            <div
                className="top-menu__sessions"
                title="Live session tracking will be enabled with Socket.IO"
            >
                <span className="top-menu__session-dot" /> Sessions: unavailable
            </div>
        </header>
    );
}

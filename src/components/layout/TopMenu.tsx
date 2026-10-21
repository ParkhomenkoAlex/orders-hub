"use client";

import Image from "next/image";
import Link from "next/link";
import { useOrdersData } from "@/state/OrdersDataProvider";
import { CurrentDateTime } from "./CurrentDateTime";
import styles from "./TopMenu.module.scss";

export function TopMenu() {
    const { searchQuery, setSearchQuery } = useOrdersData();
    return (
        <header className={`${styles.topMenu} d-flex align-items-center`}>
            <Link className={styles.topMenu__brand} href="/orders" aria-label="Orders Hub home">
                <Image
                    className={styles.topMenu__logo}
                    src="/images/logo.png"
                    alt=""
                    width={38}
                    height={44}
                    priority
                    unoptimized
                />
                <span>INVENTORY</span>
            </Link>
            <div className={`${styles.topMenu__search} flex-grow-1`}>
                <input
                    type="search"
                    aria-label="Search orders and products"
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
            <CurrentDateTime />
            <div
                className={styles.topMenu__sessions}
                title="Live session tracking will be enabled with Socket.IO"
            >
                <span className={styles.topMenu__sessionDot} /> Sessions: unavailable
            </div>
        </header>
    );
}

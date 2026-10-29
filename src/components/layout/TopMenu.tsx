"use client";

import Image from "next/image";
import Link from "next/link";
import { searchQuerySet, selectSearchQuery } from "@/state/inventorySlice";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { ActiveSessions } from "./ActiveSessions";
import { CurrentDateTime } from "./CurrentDateTime";
import styles from "./TopMenu.module.scss";

export function TopMenu() {
    const dispatch = useAppDispatch();
    const searchQuery = useAppSelector(selectSearchQuery);
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
                    onChange={(event) => dispatch(searchQuerySet(event.target.value))}
                    placeholder="Search orders and products"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => dispatch(searchQuerySet(""))}
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}
            </div>
            <CurrentDateTime />
            <ActiveSessions
                className={styles.topMenu__sessions}
                dotClassName={styles.topMenu__sessionDot}
                offlineDotClassName={styles["topMenu__sessionDot--offline"]}
            />
        </header>
    );
}

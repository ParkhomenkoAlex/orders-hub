"use client";

import Image from "next/image";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { useTranslation } from "@/i18n/I18nProvider";
import { searchQuerySet, selectSearchQuery } from "@/state/inventorySlice";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { ActiveSessions } from "./ActiveSessions";
import { CurrentDateTime } from "./CurrentDateTime";
import styles from "./TopMenu.module.scss";

export function TopMenu() {
    const dispatch = useAppDispatch();
    const searchQuery = useAppSelector(selectSearchQuery);
    const { locale, setLocale, t } = useTranslation();

    return (
        <header className={`${styles.topMenu} d-flex align-items-center`}>
            <Link className={styles.topMenu__brand} href="/orders" aria-label={t.app.home}>
                <Image
                    className={styles.topMenu__logo}
                    src="/images/logo.png"
                    alt=""
                    width={38}
                    height={44}
                    priority
                    unoptimized
                />
                <span>Inventory</span>
            </Link>
            <div className={`${styles.topMenu__search} flex-grow-1`}>
                <input
                    type="search"
                    aria-label={t.search.label}
                    value={searchQuery}
                    onChange={(event) => dispatch(searchQuerySet(event.target.value))}
                    placeholder={t.search.placeholder}
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => dispatch(searchQuerySet(""))}
                        aria-label={t.search.clear}
                    >
                        ×
                    </button>
                )}
            </div>
            <CurrentDateTime />
            <label className={styles.topMenu__locale}>
                <span className="visually-hidden">{t.language.label}</span>
                <select
                    aria-label={t.language.label}
                    value={locale}
                    onChange={(event) => {
                        if (isLocale(event.target.value)) {
                            setLocale(event.target.value);
                        }
                    }}
                >
                    <option value="en">EN</option>
                    <option value="ru">RU</option>
                </select>
            </label>
            <ActiveSessions
                className={styles.topMenu__sessions}
                dotClassName={styles.topMenu__sessionDot}
                offlineDotClassName={styles["topMenu__sessionDot--offline"]}
            />
        </header>
    );
}

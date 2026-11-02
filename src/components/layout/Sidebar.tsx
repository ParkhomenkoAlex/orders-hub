"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION_ITEMS } from "@/constants/navigation";
import { SettingsIcon } from "@/components/ui/Icons";
import { useTranslation } from "@/i18n/I18nProvider";
import styles from "./Sidebar.module.scss";

export function Sidebar() {
    const pathname = usePathname();
    const { t } = useTranslation();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebar__profile}>
                <Image
                    className={styles.sidebar__avatar}
                    src="/images/avatar.png"
                    alt={t.app.profilePhoto}
                    width={94}
                    height={94}
                    priority
                    unoptimized
                />
                <button
                    type="button"
                    className={styles.sidebar__settings}
                    aria-label={t.navigation.settings}
                >
                    <SettingsIcon />
                </button>
            </div>
            <nav className={`${styles.sidebar__nav} d-flex`} aria-label={t.app.primaryNavigation}>
                {NAVIGATION_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        className={`${styles.sidebar__link} ${pathname === item.href ? styles["sidebar__link--active"] : ""}`}
                        href={item.href}
                        aria-current={pathname === item.href ? "page" : undefined}
                    >
                        {t.navigation[item.labelKey]}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}

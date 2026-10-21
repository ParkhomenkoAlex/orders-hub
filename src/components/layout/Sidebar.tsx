"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION_ITEMS } from "@/constants/navigation";
import { SettingsIcon } from "@/components/ui/Icons";
import styles from "./Sidebar.module.scss";

export function Sidebar() {
    const pathname = usePathname();
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebar__profile}>
                <Image
                    className={styles.sidebar__avatar}
                    src="/images/avatar.png"
                    alt="Profile photo"
                    width={94}
                    height={94}
                    priority
                    unoptimized
                />
                <button type="button" className={styles.sidebar__settings} aria-label="Settings">
                    <SettingsIcon />
                </button>
            </div>
            <nav className={`${styles.sidebar__nav} d-flex`} aria-label="Primary navigation">
                {NAVIGATION_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        className={`${styles.sidebar__link} ${pathname === item.href ? styles["sidebar__link--active"] : ""}`}
                        href={item.href}
                        aria-current={pathname === item.href ? "page" : undefined}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}

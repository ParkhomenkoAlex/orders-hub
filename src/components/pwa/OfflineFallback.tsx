"use client";

import { useTranslation } from "@/i18n/I18nProvider";
import styles from "./OfflineFallback.module.scss";

export function OfflineFallback() {
    const { t } = useTranslation();

    return (
        <main className={styles.offlineFallback}>
            <section className={styles.offlineFallback__content} role="status">
                <h1>{t.pwa.offlineTitle}</h1>
                <p>{t.pwa.offlineDescription}</p>
            </section>
        </main>
    );
}

"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "@/i18n/I18nProvider";
import styles from "./OrderStatusSummaryMicrofrontend.module.scss";

export function OrderStatusSummaryMicrofrontendSkeleton() {
    const { t } = useTranslation();

    return (
        <section
            className={styles.orderStatusSummaryMicrofrontend}
            aria-busy="true"
            aria-label={t.microfrontend.loading}
        >
            <p className="visually-hidden" role="status">
                {t.microfrontend.loading}
            </p>
            <Skeleton className={styles.orderStatusSummaryMicrofrontend__mount} />
        </section>
    );
}

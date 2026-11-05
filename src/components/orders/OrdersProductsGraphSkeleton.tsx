"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "@/i18n/I18nProvider";
import styles from "./OrdersProductsGraph.module.scss";

export function OrdersProductsGraphSkeleton() {
    const { t } = useTranslation();

    return (
        <section className={styles.ordersGraph} aria-busy="true" aria-label={t.graph.loading}>
            <p className="visually-hidden" role="status">
                {t.graph.loading}
            </p>
            <Skeleton className={styles.ordersGraph__titleSkeleton} />
            <Skeleton className={styles.ordersGraph__descriptionSkeleton} />
            <Skeleton className={styles.ordersGraph__canvasSkeleton} />
        </section>
    );
}

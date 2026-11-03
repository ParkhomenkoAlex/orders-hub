"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "@/i18n/I18nProvider";
import styles from "./Orders.module.scss";

const SKELETON_ROWS = 3;

export function OrderDetailsSkeleton() {
    const { t } = useTranslation();

    return (
        <section
            id="order-details"
            className={`${styles.orderDetails} ${styles["orderDetails--skeleton"]}`}
            aria-busy="true"
            aria-label={t.loading.orders}
        >
            <p className="visually-hidden" role="status">
                {t.loading.orders}
            </p>
            <div className={styles.orderDetails__heading} aria-hidden="true">
                <Skeleton className={styles.orderDetails__skeletonTitle} />
                <Skeleton className={styles.orderDetails__skeletonAction} />
            </div>
            <ul className={styles.orderDetails__products} aria-hidden="true">
                {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                    <li key={index} className={styles.orderDetails__product}>
                        <Skeleton className={styles.orderDetails__skeletonMark} />
                        <div className={styles.orderDetails__identity}>
                            <Skeleton className={styles.orderDetails__skeletonProduct} />
                            <Skeleton className={styles.orderDetails__skeletonSerial} />
                        </div>
                        <Skeleton className={styles.orderDetails__skeletonStatus} />
                        <Skeleton className={styles.orderDetails__skeletonDelete} />
                    </li>
                ))}
            </ul>
        </section>
    );
}

"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "@/i18n/I18nProvider";
import styles from "./Orders.module.scss";

const SKELETON_ROWS = 5;

export function OrdersListSkeleton() {
    const { t } = useTranslation();

    return (
        <section className={styles.ordersList} aria-busy="true" aria-label={t.loading.orders}>
            <p className="visually-hidden" role="status">
                {t.loading.orders}
            </p>
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <article
                    key={index}
                    className={`${styles.orderCard} ${styles["orderCard--skeleton"]}`}
                    aria-hidden="true"
                >
                    <div className={styles.orderCard__select}>
                        <Skeleton className={styles.orderCard__skeletonTitle} />
                        <span className={styles.orderCard__products}>
                            <Skeleton className={styles.orderCard__skeletonIcon} />
                            <span>
                                <Skeleton className={styles.orderCard__skeletonCount} />
                                <Skeleton className={styles.orderCard__skeletonLabel} />
                            </span>
                        </span>
                        <span className={styles.orderCard__date}>
                            <Skeleton className={styles.orderCard__skeletonDate} />
                            <Skeleton
                                className={`${styles.orderCard__skeletonDate} ${styles["orderCard__skeletonDate--short"]}`}
                            />
                        </span>
                        <span className={styles.orderCard__total}>
                            <Skeleton className={styles.orderCard__skeletonTotal} />
                            <Skeleton
                                className={`${styles.orderCard__skeletonTotal} ${styles["orderCard__skeletonTotal--short"]}`}
                            />
                        </span>
                    </div>
                    <Skeleton className={styles.orderCard__skeletonDelete} />
                </article>
            ))}
        </section>
    );
}

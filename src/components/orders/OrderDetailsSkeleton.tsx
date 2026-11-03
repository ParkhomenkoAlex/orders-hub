"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "@/i18n/I18nProvider";

const SKELETON_ROWS = 3;

export function OrderDetailsSkeleton() {
    const { t } = useTranslation();

    return (
        <section
            id="order-details"
            className="order-details order-details--skeleton"
            aria-busy="true"
            aria-label={t.loading.orders}
        >
            <p className="visually-hidden" role="status">
                {t.loading.orders}
            </p>
            <div className="order-details__heading" aria-hidden="true">
                <Skeleton className="skeleton--details-title" />
                <Skeleton className="skeleton--details-action" />
            </div>
            <ul className="order-details__products" aria-hidden="true">
                {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                    <li key={index} className="order-details__product">
                        <Skeleton className="skeleton--details-mark" />
                        <div className="order-details__identity">
                            <Skeleton className="skeleton--details-product" />
                            <Skeleton className="skeleton--details-serial" />
                        </div>
                        <Skeleton className="skeleton--details-status" />
                        <Skeleton className="skeleton--details-delete" />
                    </li>
                ))}
            </ul>
        </section>
    );
}

"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "@/i18n/I18nProvider";

const SKELETON_ROWS = 5;

export function OrdersListSkeleton() {
    const { t } = useTranslation();

    return (
        <section className="orders-list" aria-busy="true" aria-label={t.loading.orders}>
            <p className="visually-hidden" role="status">
                {t.loading.orders}
            </p>
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <article key={index} className="order-card order-card--skeleton" aria-hidden="true">
                    <div className="order-card__select">
                        <Skeleton className="skeleton--order-title" />
                        <span className="order-card__products">
                            <Skeleton className="skeleton--order-icon" />
                            <span>
                                <Skeleton className="skeleton--order-count" />
                                <Skeleton className="skeleton--order-label" />
                            </span>
                        </span>
                        <span className="order-card__date">
                            <Skeleton className="skeleton--order-date" />
                            <Skeleton className="skeleton--order-date skeleton--order-date-short" />
                        </span>
                        <span className="order-card__total">
                            <Skeleton className="skeleton--order-total" />
                            <Skeleton className="skeleton--order-total skeleton--order-total-short" />
                        </span>
                    </div>
                    <Skeleton className="skeleton--order-delete" />
                </article>
            ))}
        </section>
    );
}

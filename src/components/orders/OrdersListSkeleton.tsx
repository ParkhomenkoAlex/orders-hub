import { Skeleton } from "@/components/ui/Skeleton";

const SKELETON_ROWS = 5;

export function OrdersListSkeleton() {
    return (
        <section className="orders-list" aria-busy="true" aria-label="Loading orders">
            <p className="visually-hidden" role="status">
                Loading orders
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

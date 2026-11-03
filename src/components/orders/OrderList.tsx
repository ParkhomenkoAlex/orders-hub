"use client";

import { formatCurrency, formatLongDate, formatShortDate } from "@/lib/formatters";
import { getOrderTotal } from "@/lib/order-domain";
import { useTranslation } from "@/i18n/I18nProvider";
import { getCountForm } from "@/i18n/plural";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import type { Order, Product } from "@/types/domain";
import { InventoryIcon, TrashIcon } from "@/components/ui/Icons";
import workspaceStyles from "@/components/ui/Workspace.module.scss";
import styles from "./Orders.module.scss";

interface OrderListProps {
    orders: Order[];
    productsByOrderId: Map<string, Product[]>;
    hasOrders: boolean;
    selectedOrderId: string | null;
    onSelect: (orderId: string) => void;
    onDelete: (orderId: string) => void;
}

export const formatOrderProductCount = (
    count: number,
    locale: Locale,
    messages: Messages["orders"],
) => messages.productCount[getCountForm(count, locale)];

export function OrderList({
    orders,
    productsByOrderId,
    hasOrders,
    selectedOrderId,
    onSelect,
    onDelete,
}: OrderListProps) {
    const { locale, t } = useTranslation();

    if (!orders.length)
        return (
            <div className={workspaceStyles.emptyState}>
                <span>✓</span>
                <h2>{hasOrders ? t.orders.noMatches : t.orders.noOrders}</h2>
                <p>{hasOrders ? t.orders.noMatchesHint : t.orders.noOrdersHint}</p>
            </div>
        );
    return (
        <div className={styles.ordersList}>
            {orders.map((order) => {
                const orderProducts = productsByOrderId.get(order.id) ?? [];
                const total = getOrderTotal(orderProducts);
                const isSelected = selectedOrderId === order.id;
                return (
                    <article
                        key={order.id}
                        className={`${styles.orderCard} ${isSelected ? styles["orderCard--selected"] : ""}`}
                    >
                        <button
                            type="button"
                            className={styles.orderCard__select}
                            onClick={() => onSelect(order.id)}
                            aria-expanded={isSelected}
                            aria-label={(isSelected
                                ? t.orders.closeDetails
                                : t.orders.openDetails
                            ).replace("{title}", order.title)}
                            aria-controls={isSelected ? "order-details" : undefined}
                            data-order-id={order.id}
                        >
                            <span className={styles.orderCard__title}>{order.title}</span>
                            <span className={styles.orderCard__products}>
                                <span className={styles.orderCard__listIcon}>
                                    <InventoryIcon />
                                </span>
                                <span>
                                    <strong>{orderProducts.length}</strong>
                                    <small>
                                        {formatOrderProductCount(
                                            orderProducts.length,
                                            locale,
                                            t.orders,
                                        )}
                                    </small>
                                </span>
                            </span>
                            <span className={styles.orderCard__date}>
                                <small>{formatShortDate(order.createdAt, locale)}</small>
                                {formatLongDate(order.createdAt, locale)}
                            </span>
                            <span className={styles.orderCard__total}>
                                <small>{formatCurrency(total.usd, "USD", locale)}</small>
                                {formatCurrency(total.uah, "UAH", locale)}
                            </span>
                        </button>
                        <button
                            className={styles.orderCard__delete}
                            type="button"
                            onClick={() => onDelete(order.id)}
                            aria-label={t.orders.deleteLabel.replace("{title}", order.title)}
                        >
                            <TrashIcon />
                        </button>
                    </article>
                );
            })}
        </div>
    );
}

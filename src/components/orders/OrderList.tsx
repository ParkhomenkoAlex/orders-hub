import { formatCurrency, formatLongDate, formatShortDate } from "@/lib/formatters";
import { getOrderTotal } from "@/lib/order-domain";
import type { Order, Product } from "@/types/domain";
import { InventoryIcon, TrashIcon } from "@/components/ui/Icons";

interface OrderListProps {
    orders: Order[];
    productsByOrderId: Map<string, Product[]>;
    hasOrders: boolean;
    selectedOrderId: string | null;
    onSelect: (orderId: string) => void;
    onDelete: (orderId: string) => void;
}

export function OrderList({
    orders,
    productsByOrderId,
    hasOrders,
    selectedOrderId,
    onSelect,
    onDelete,
}: OrderListProps) {
    if (!orders.length)
        return (
            <div className="empty-state">
                <span>✓</span>
                <h2>{hasOrders ? "No matching orders" : "No orders left"}</h2>
                <p>
                    {hasOrders
                        ? "Try another search phrase."
                        : "No orders yet. Create an order to get started."}
                </p>
            </div>
        );
    return (
        <div className="orders-list">
            {orders.map((order) => {
                const orderProducts = productsByOrderId.get(order.id) ?? [];
                const total = getOrderTotal(orderProducts);
                const isSelected = selectedOrderId === order.id;
                return (
                    <article
                        key={order.id}
                        className={`order-card ${isSelected ? "order-card--selected" : ""}`}
                    >
                        <button
                            type="button"
                            className="order-card__select"
                            onClick={() => onSelect(order.id)}
                            aria-expanded={isSelected}
                            aria-label={`${isSelected ? "Close details for" : "View details for"} ${order.title}`}
                            aria-controls={isSelected ? "order-details" : undefined}
                            data-order-id={order.id}
                        >
                            <span className="order-card__title">{order.title}</span>
                            <span className="order-card__products">
                                <span className="order-card__list-icon">
                                    <InventoryIcon />
                                </span>
                                <span>
                                    <strong>{orderProducts.length}</strong>
                                    <small>Products</small>
                                </span>
                            </span>
                            <span className="order-card__date">
                                <small>{formatShortDate(order.createdAt)}</small>
                                {formatLongDate(order.createdAt)}
                            </span>
                            <span className="order-card__total">
                                <small>{formatCurrency(total.usd, "USD")}</small>
                                {formatCurrency(total.uah, "UAH")}
                            </span>
                        </button>
                        <button
                            className="order-card__delete"
                            type="button"
                            onClick={() => onDelete(order.id)}
                            aria-label={`Delete ${order.title}`}
                        >
                            <TrashIcon />
                        </button>
                    </article>
                );
            })}
        </div>
    );
}

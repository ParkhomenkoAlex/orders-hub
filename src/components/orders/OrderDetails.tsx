import { ProductMark } from "@/components/ui/ProductMark";
import { TrashIcon } from "@/components/ui/Icons";
import type { Order, Product } from "@/types/domain";

interface OrderDetailsProps {
    order: Order;
    products: Product[];
    isClosing: boolean;
    onClose: () => void;
    onCloseAnimationEnd: () => void;
    onDeleteProduct: (product: Product) => void;
    onAddProduct: () => void;
}

export function OrderDetails({
    order,
    products,
    isClosing,
    onClose,
    onCloseAnimationEnd,
    onDeleteProduct,
    onAddProduct,
}: OrderDetailsProps) {
    return (
        <section
            id="order-details"
            className={`order-details ${isClosing ? "order-details--closing" : ""}`}
            aria-labelledby="order-details-title"
            aria-hidden={isClosing || undefined}
            inert={isClosing}
            onAnimationEnd={(event) => {
                if (
                    event.target === event.currentTarget &&
                    event.animationName === "details-exit"
                ) {
                    onCloseAnimationEnd();
                }
            }}
        >
            <button
                type="button"
                className="order-details__close"
                onClick={onClose}
                aria-label="Close order details"
            >
                ×
            </button>
            <div className="order-details__heading">
                <h2 id="order-details-title">{order.title}</h2>
                <button type="button" className="order-details__add" onClick={onAddProduct}>
                    <span aria-hidden="true">+</span> Add product
                </button>
            </div>
            {products.length ? (
                <ul className="order-details__products">
                    {products.map((product) => (
                        <li key={product.id} className="order-details__product">
                            <ProductMark status={product.status} />
                            <div className="order-details__identity">
                                <strong>{product.title}</strong>
                                <span>{product.serialNumber}</span>
                            </div>
                            <span
                                className={`status status--${product.status.toLowerCase().replace(" ", "-")}`}
                            >
                                {product.status}
                            </span>
                            <button
                                type="button"
                                className="icon-button icon-button--delete"
                                onClick={() => onDeleteProduct(product)}
                                aria-label={`Delete ${product.title}`}
                            >
                                <TrashIcon />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="order-details__empty">This order has no products yet.</p>
            )}
        </section>
    );
}

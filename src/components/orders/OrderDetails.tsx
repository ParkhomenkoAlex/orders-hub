"use client";

import { ProductMark } from "@/components/ui/ProductMark";
import { TrashIcon } from "@/components/ui/Icons";
import { useTranslation } from "@/i18n/I18nProvider";
import type { Order, Product } from "@/types/domain";
import iconStyles from "@/components/ui/IconButton.module.scss";
import statusStyles from "@/components/ui/Status.module.scss";
import styles from "./Orders.module.scss";

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
    const { t } = useTranslation();

    return (
        <section
            id="order-details"
            className={`${styles.orderDetails} ${isClosing ? styles["orderDetails--closing"] : ""}`}
            aria-labelledby="order-details-title"
            aria-hidden={isClosing || undefined}
            inert={isClosing}
            onAnimationEnd={(event) => {
                if (event.target === event.currentTarget && isClosing) {
                    onCloseAnimationEnd();
                }
            }}
        >
            <button
                type="button"
                className={styles.orderDetails__close}
                onClick={onClose}
                aria-label={t.orders.closeDetails.replace("{title}", order.title)}
            >
                ×
            </button>
            <div className={styles.orderDetails__heading}>
                <h2 id="order-details-title">{order.title}</h2>
                <button type="button" className={styles.orderDetails__add} onClick={onAddProduct}>
                    <span aria-hidden="true">+</span> {t.orders.addProduct}
                </button>
            </div>
            {products.length ? (
                <ul className={styles.orderDetails__products}>
                    {products.map((product) => (
                        <li key={product.id} className={styles.orderDetails__product}>
                            <ProductMark status={product.status} />
                            <div className={styles.orderDetails__identity}>
                                <strong>{product.title}</strong>
                                <span>{product.serialNumber}</span>
                            </div>
                            <span
                                className={`${statusStyles.status} ${
                                    product.status === "In service"
                                        ? statusStyles["status--inService"]
                                        : product.status === "Reserved"
                                          ? statusStyles["status--reserved"]
                                          : statusStyles["status--available"]
                                }`}
                            >
                                {t.productStatuses[product.status]}
                            </span>
                            <button
                                type="button"
                                className={`${iconStyles.iconButton} ${iconStyles["iconButton--delete"]} ${styles.orderDetails__delete}`}
                                onClick={() => onDeleteProduct(product)}
                                aria-label={t.products.deleteLabel.replace(
                                    "{title}",
                                    product.title,
                                )}
                            >
                                <TrashIcon />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.orderDetails__empty}>{t.orders.noProducts}</p>
            )}
        </section>
    );
}

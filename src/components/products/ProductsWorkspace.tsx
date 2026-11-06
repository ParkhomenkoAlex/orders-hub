"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductMark } from "@/components/ui/ProductMark";
import { TrashIcon } from "@/components/ui/Icons";
import { useTranslation } from "@/i18n/I18nProvider";
import { PRODUCT_TYPES, filterProducts } from "@/lib/order-domain";
import { formatCurrency, formatLongDate } from "@/lib/formatters";
import { selectSearchQuery } from "@/state/inventorySlice";
import {
    useDeleteProductMutation,
    useGetOrdersQuery,
    useGetProductsQuery,
} from "@/state/inventoryApi";
import { useAppSelector } from "@/state/hooks";
import type { Order, Product, ProductType } from "@/types/domain";
import { DeleteProductModal } from "./DeleteProductModal";
import { InventoryAnalytics } from "./InventoryAnalytics";
import { ProductTypeChart } from "./ProductTypeChart";
import formStyles from "@/components/ui/FormDialog.module.scss";
import iconStyles from "@/components/ui/IconButton.module.scss";
import statusStyles from "@/components/ui/Status.module.scss";
import workspaceStyles from "@/components/ui/Workspace.module.scss";
import styles from "./Products.module.scss";
import { ProductsTableSkeleton } from "./ProductsTableSkeleton";
import {
    isProductType,
    persistProductTypeFilter,
    restoreProductTypeFilter,
} from "./typeFilterStorage";

const EMPTY_ORDERS: Order[] = [];
const EMPTY_PRODUCTS: Product[] = [];

export function ProductsWorkspace() {
    const { locale, t } = useTranslation();
    const productsQuery = useGetProductsQuery();
    const ordersQuery = useGetOrdersQuery();
    const products = productsQuery.data ?? EMPTY_PRODUCTS;
    const orders = ordersQuery.data ?? EMPTY_ORDERS;
    const isInitialLoading =
        (productsQuery.isLoading && productsQuery.data === undefined) ||
        (ordersQuery.isLoading && ordersQuery.data === undefined);
    const searchQuery = useAppSelector(selectSearchQuery);
    const [deleteProductRequest] = useDeleteProductMutation();
    const [activeType, setActiveType] = useState<ProductType | "all">("all");
    const [isTypeFilterRestored, setIsTypeFilterRestored] = useState(false);
    const [specification, setSpecification] = useState("all");
    const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
    const [deleteProductError, setDeleteProductError] = useState(false);
    const catalogRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLTableElement>(null);
    const specifications = useMemo(
        () => [...new Set(products.map((product) => product.specification))],
        [products],
    );
    const visibleProducts = filterProducts(products, activeType, searchQuery).filter(
        (product) => specification === "all" || product.specification === specification,
    );
    const orderById = useMemo(() => new Map(orders.map((order) => [order.id, order])), [orders]);
    const hasFilters =
        activeType !== "all" || specification !== "all" || Boolean(searchQuery.trim());

    useEffect(() => {
        let isMounted = true;

        queueMicrotask(() => {
            if (!isMounted) {
                return;
            }

            setActiveType(restoreProductTypeFilter(() => window.localStorage));
            setIsTypeFilterRestored(true);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!isTypeFilterRestored) {
            return;
        }

        persistProductTypeFilter(activeType, () => window.localStorage);
    }, [activeType, isTypeFilterRestored]);

    return (
        <div
            ref={catalogRef}
            className={`${workspaceStyles.pageWorkspace} ${styles.productsWorkspace}`}
        >
            <header
                className={`${workspaceStyles.pageWorkspace__header} ${styles.productsWorkspace__header}`}
            >
                <h1>
                    {t.products.title}{" "}
                    <span>/ {productsQuery.data === undefined ? "—" : visibleProducts.length}</span>
                </h1>
                <div className={styles.productsWorkspace__filters}>
                    <label className={styles.productFilter} htmlFor="product-type">
                        {t.products.type}
                        <select
                            id="product-type"
                            className="form-select"
                            value={activeType}
                            onChange={(event) => {
                                const value = event.target.value;
                                setActiveType(
                                    value === "all" || isProductType(value) ? value : "all",
                                );
                            }}
                        >
                            <option value="all">{t.products.allTypes}</option>
                            {PRODUCT_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {t.productTypes[type]}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={styles.productFilter} htmlFor="product-specification">
                        {t.products.specification}
                        <select
                            id="product-specification"
                            className="form-select"
                            value={specification}
                            onChange={(event) => setSpecification(event.target.value)}
                        >
                            <option value="all">{t.products.allSpecifications}</option>
                            {specifications.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </header>
            {isInitialLoading ? (
                <ProductsTableSkeleton />
            ) : productsQuery.isError || ordersQuery.isError ? (
                <div className={workspaceStyles.emptyState}>
                    <span>!</span>
                    <h2>{t.errors.loadProducts}</h2>
                    <p>{t.errors.connection}</p>
                    <button
                        type="button"
                        className={formStyles.formModal__submit}
                        onClick={() => {
                            void productsQuery.refetch();
                            void ordersQuery.refetch();
                        }}
                    >
                        {t.actions.retry}
                    </button>
                </div>
            ) : visibleProducts.length ? (
                <div className={`${styles.productsTable} table-responsive`}>
                    <table ref={tableRef} className="mb-0">
                        <colgroup>
                            <col className={styles["productsTable__col--product"]} />
                            <col className={styles["productsTable__col--status"]} />
                            <col className={styles["productsTable__col--warranty"]} />
                            <col className={styles["productsTable__col--condition"]} />
                            <col className={styles["productsTable__col--price"]} />
                            <col className={styles["productsTable__col--group"]} />
                            <col className={styles["productsTable__col--owner"]} />
                            <col className={styles["productsTable__col--order"]} />
                            <col className={styles["productsTable__col--orderDate"]} />
                            <col className={styles["productsTable__col--actions"]} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col">{t.products.product}</th>
                                <th scope="col">{t.products.status}</th>
                                <th scope="col">{t.products.warranty}</th>
                                <th scope="col">{t.products.condition}</th>
                                <th scope="col">{t.products.price}</th>
                                <th scope="col">{t.products.group}</th>
                                <th scope="col">{t.products.owner}</th>
                                <th scope="col">{t.products.order}</th>
                                <th scope="col">{t.products.orderDate}</th>
                                <th scope="col">
                                    <span className="visually-hidden">{t.products.actions}</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleProducts.map((product) => {
                                const order = orderById.get(product.orderId);
                                return (
                                    <tr key={product.id}>
                                        <td>
                                            <div className={styles.productRow__identity}>
                                                <ProductMark status={product.status} />
                                                <div>
                                                    <strong>{product.title}</strong>
                                                    <span>{product.serialNumber}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
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
                                        </td>
                                        <td>
                                            <div className={styles.productRow__warranty}>
                                                <small>{t.products.from}</small>
                                                <span>
                                                    {formatLongDate(product.warranty.start, locale)}
                                                </span>
                                                <small>{t.products.to}</small>
                                                <span>
                                                    {formatLongDate(product.warranty.end, locale)}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{t.productConditions[product.condition]}</td>
                                        <td>
                                            <div className={styles.productRow__price}>
                                                <small>
                                                    {formatCurrency(
                                                        product.price.usd,
                                                        "USD",
                                                        locale,
                                                    )}
                                                </small>
                                                <span>
                                                    {formatCurrency(
                                                        product.price.uah,
                                                        "UAH",
                                                        locale,
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={styles.productRow__order}>
                                            {product.groupName}
                                        </td>
                                        <td className={styles.productRow__owner}>
                                            <span
                                                className={styles.productRow__ownerText}
                                                title={product.ownerName ?? undefined}
                                            >
                                                {product.ownerName ?? "—"}
                                            </span>
                                        </td>
                                        <td className={styles.productRow__order}>
                                            <span className={styles.productRow__orderTitle}>
                                                {order?.title ?? (
                                                    <span className={styles.productRow__warning}>
                                                        {t.products.missingOrder}
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            <time
                                                className={styles.productRow__date}
                                                dateTime={order?.createdAt}
                                            >
                                                {order
                                                    ? formatLongDate(order.createdAt, locale)
                                                    : "—"}
                                            </time>
                                        </td>
                                        <td className={styles.productRow__action}>
                                            <button
                                                type="button"
                                                className={`${iconStyles.iconButton} ${iconStyles["iconButton--delete"]}`}
                                                onClick={() => {
                                                    setDeleteProductError(false);
                                                    setPendingProduct(product);
                                                }}
                                                aria-label={t.products.deleteLabel.replace(
                                                    "{title}",
                                                    product.title,
                                                )}
                                            >
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={workspaceStyles.emptyState}>
                    <span>⌕</span>
                    <h2>{hasFilters ? t.products.noMatches : t.products.noProducts}</h2>
                    <p>{hasFilters ? t.products.noMatchesHint : t.products.noProductsHint}</p>
                </div>
            )}
            <ProductTypeChart
                products={products}
                activeType={activeType}
                isLoading={productsQuery.isLoading && productsQuery.data === undefined}
                isError={productsQuery.isError}
                onTypeSelect={setActiveType}
            />
            <InventoryAnalytics
                orders={orders}
                products={products}
                isLoading={isInitialLoading}
                isError={productsQuery.isError || ordersQuery.isError}
            />
            {pendingProduct && (
                <DeleteProductModal
                    product={pendingProduct}
                    error={deleteProductError ? t.errors.deleteProduct : null}
                    onCancel={() => {
                        setDeleteProductError(false);
                        setPendingProduct(null);
                    }}
                    onConfirm={async () => {
                        setDeleteProductError(false);
                        try {
                            await deleteProductRequest(pendingProduct.id).unwrap();
                        } catch {
                            setDeleteProductError(true);
                            return;
                        }
                        setPendingProduct(null);
                    }}
                    fallbackFocus={() =>
                        tableRef.current?.querySelector<HTMLButtonElement>("button") ??
                        catalogRef.current?.querySelector<HTMLSelectElement>("select") ??
                        null
                    }
                />
            )}
        </div>
    );
}

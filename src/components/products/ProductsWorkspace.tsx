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
import { ProductTypeChart } from "./ProductTypeChart";
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
        <div ref={catalogRef} className="page-workspace products-workspace">
            <header className="page-workspace__header">
                <h1>
                    {t.products.title}{" "}
                    <span>/ {productsQuery.data === undefined ? "—" : visibleProducts.length}</span>
                </h1>
                <div className="products-workspace__filters">
                    <label className="product-filter" htmlFor="product-type">
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
                    <label className="product-filter" htmlFor="product-specification">
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
                <div className="empty-state">
                    <span>!</span>
                    <h2>{t.errors.loadProducts}</h2>
                    <p>{t.errors.connection}</p>
                    <button
                        type="button"
                        className="form-modal__submit"
                        onClick={() => {
                            void productsQuery.refetch();
                            void ordersQuery.refetch();
                        }}
                    >
                        {t.actions.retry}
                    </button>
                </div>
            ) : visibleProducts.length ? (
                <div className="products-table table-responsive">
                    <table ref={tableRef} className="mb-0">
                        <colgroup>
                            <col className="products-table__col--product" />
                            <col className="products-table__col--status" />
                            <col className="products-table__col--warranty" />
                            <col className="products-table__col--condition" />
                            <col className="products-table__col--price" />
                            <col className="products-table__col--group" />
                            <col className="products-table__col--owner" />
                            <col className="products-table__col--order" />
                            <col className="products-table__col--order-date" />
                            <col className="products-table__col--actions" />
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
                                            <div className="product-row__identity">
                                                <ProductMark status={product.status} />
                                                <div>
                                                    <strong>{product.title}</strong>
                                                    <span>{product.serialNumber}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`status status--${product.status.toLowerCase().replace(" ", "-")}`}
                                            >
                                                {t.productStatuses[product.status]}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="product-row__warranty">
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
                                            <div className="product-row__price">
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
                                        <td className="product-row__order">{product.groupName}</td>
                                        <td className="product-row__owner">
                                            <span
                                                className="product-row__owner-text"
                                                title={product.ownerName ?? undefined}
                                            >
                                                {product.ownerName ?? "—"}
                                            </span>
                                        </td>
                                        <td className="product-row__order">
                                            <span className="product-row__order-title">
                                                {order?.title ?? (
                                                    <span className="data-warning">
                                                        {t.products.missingOrder}
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            <time
                                                className="product-row__date"
                                                dateTime={order?.createdAt}
                                            >
                                                {order
                                                    ? formatLongDate(order.createdAt, locale)
                                                    : "—"}
                                            </time>
                                        </td>
                                        <td className="product-row__action">
                                            <button
                                                type="button"
                                                className="icon-button icon-button--delete"
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
                <div className="empty-state">
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

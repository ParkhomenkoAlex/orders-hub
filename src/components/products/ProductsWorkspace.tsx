"use client";

import { useMemo, useRef, useState } from "react";
import { ProductMark } from "@/components/ui/ProductMark";
import { TrashIcon } from "@/components/ui/Icons";
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
import { ProductsTableSkeleton } from "./ProductsTableSkeleton";

const isProductType = (value: string): value is ProductType =>
    PRODUCT_TYPES.includes(value as ProductType);

const EMPTY_ORDERS: Order[] = [];
const EMPTY_PRODUCTS: Product[] = [];

export function ProductsWorkspace() {
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
    const [specification, setSpecification] = useState("all");
    const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
    const [deleteProductError, setDeleteProductError] = useState<string | null>(null);
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
    return (
        <div ref={catalogRef} className="page-workspace products-workspace">
            <header className="page-workspace__header">
                <h1>
                    Products{" "}
                    <span>/ {productsQuery.data === undefined ? "—" : visibleProducts.length}</span>
                </h1>
                <div className="products-workspace__filters">
                    <label className="product-filter" htmlFor="product-type">
                        Type
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
                            <option value="all">All types</option>
                            {PRODUCT_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="product-filter" htmlFor="product-specification">
                        Specification
                        <select
                            id="product-specification"
                            className="form-select"
                            value={specification}
                            onChange={(event) => setSpecification(event.target.value)}
                        >
                            <option value="all">All specifications</option>
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
                    <h2>Unable to load products</h2>
                    <p>Please check the connection and try again.</p>
                    <button
                        type="button"
                        className="form-modal__submit"
                        onClick={() => {
                            void productsQuery.refetch();
                            void ordersQuery.refetch();
                        }}
                    >
                        Retry
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
                                <th scope="col">Product</th>
                                <th scope="col">Status</th>
                                <th scope="col">Warranty</th>
                                <th scope="col">Condition</th>
                                <th scope="col">Price</th>
                                <th scope="col">Group</th>
                                <th scope="col">Owner</th>
                                <th scope="col">Order</th>
                                <th scope="col">Order date</th>
                                <th scope="col">
                                    <span className="visually-hidden">Actions</span>
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
                                                {product.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="product-row__warranty">
                                                <small>from</small>
                                                <span>
                                                    {formatLongDate(product.warranty.start)}
                                                </span>
                                                <small>to</small>
                                                <span>{formatLongDate(product.warranty.end)}</span>
                                            </div>
                                        </td>
                                        <td>{product.condition}</td>
                                        <td>
                                            <div className="product-row__price">
                                                <small>
                                                    {formatCurrency(product.price.usd, "USD")}
                                                </small>
                                                <span>
                                                    {formatCurrency(product.price.uah, "UAH")}
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
                                                        Missing order
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            <time
                                                className="product-row__date"
                                                dateTime={order?.createdAt}
                                            >
                                                {order ? formatLongDate(order.createdAt) : "—"}
                                            </time>
                                        </td>
                                        <td className="product-row__action">
                                            <button
                                                type="button"
                                                className="icon-button icon-button--delete"
                                                onClick={() => {
                                                    setDeleteProductError(null);
                                                    setPendingProduct(product);
                                                }}
                                                aria-label={`Delete ${product.title}`}
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
                    <h2>{hasFilters ? "No matching products" : "No products left"}</h2>
                    <p>
                        {hasFilters
                            ? "Try another type, specification, or search phrase."
                            : "No products yet. Add a product to an order to get started."}
                    </p>
                </div>
            )}
            {pendingProduct && (
                <DeleteProductModal
                    product={pendingProduct}
                    error={deleteProductError}
                    onCancel={() => {
                        setDeleteProductError(null);
                        setPendingProduct(null);
                    }}
                    onConfirm={async () => {
                        setDeleteProductError(null);
                        try {
                            await deleteProductRequest(pendingProduct.id).unwrap();
                        } catch {
                            setDeleteProductError(
                                "Unable to delete this product. Please try again.",
                            );
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

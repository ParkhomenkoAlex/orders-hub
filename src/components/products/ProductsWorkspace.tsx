"use client";

import { useMemo, useRef, useState } from "react";
import { ProductMark } from "@/components/ui/ProductMark";
import { TrashIcon } from "@/components/ui/Icons";
import { PRODUCT_TYPES, filterProducts } from "@/lib/order-domain";
import { formatCurrency, formatLongDate } from "@/lib/formatters";
import {
    productDeleted,
    selectOrders,
    selectProducts,
    selectSearchQuery,
} from "@/state/inventorySlice";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import type { Product, ProductType } from "@/types/domain";
import { DeleteProductModal } from "./DeleteProductModal";

const isProductType = (value: string): value is ProductType =>
    PRODUCT_TYPES.includes(value as ProductType);

export function ProductsWorkspace() {
    const dispatch = useAppDispatch();
    const products = useAppSelector(selectProducts);
    const orders = useAppSelector(selectOrders);
    const searchQuery = useAppSelector(selectSearchQuery);
    const [activeType, setActiveType] = useState<ProductType | "all">("all");
    const [specification, setSpecification] = useState("all");
    const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
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
                    Products <span>/ {visibleProducts.length}</span>
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
            {visibleProducts.length ? (
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
                                                onClick={() => setPendingProduct(product)}
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
                            : "There are no products in the current data set."}
                    </p>
                </div>
            )}
            {pendingProduct && (
                <DeleteProductModal
                    product={pendingProduct}
                    onCancel={() => setPendingProduct(null)}
                    onConfirm={() => {
                        dispatch(productDeleted(pendingProduct.id));
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

"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/i18n/I18nProvider";
import { filterOrders, groupProductsByOrderId } from "@/lib/order-domain";
import { selectSearchQuery } from "@/state/inventorySlice";
import {
    useCreateOrderMutation,
    useCreateProductMutation,
    useDeleteOrderMutation,
    useDeleteProductMutation,
    useGetOrdersQuery,
    useGetProductsQuery,
} from "@/state/inventoryApi";
import { useAppSelector } from "@/state/hooks";
import type { Order, Product, ProductDraft } from "@/types/domain";
import { AddOrderDialog } from "./AddOrderDialog";
import { AddProductDialog } from "./AddProductDialog";
import { DeleteOrderModal } from "./DeleteOrderModal";
import { OrderDetailsSkeleton } from "./OrderDetailsSkeleton";
import { OrderList } from "./OrderList";
import { OrdersListSkeleton } from "./OrdersListSkeleton";
import { DeleteProductModal } from "../products/DeleteProductModal";

const EMPTY_ORDERS: Order[] = [];
const EMPTY_PRODUCTS: Product[] = [];
const OrderDetails = dynamic(
    () =>
        import("./OrderDetails").then(({ OrderDetails: LoadedOrderDetails }) => LoadedOrderDetails),
    {
        loading: OrderDetailsSkeleton,
        ssr: false,
    },
);

interface OrdersWorkspaceProps {
    initialOrders?: Order[];
    initialProducts?: Product[];
}

export function OrdersWorkspace({ initialOrders, initialProducts }: OrdersWorkspaceProps) {
    const { t } = useTranslation();
    const searchQuery = useAppSelector(selectSearchQuery);
    const ordersQuery = useGetOrdersQuery();
    const productsQuery = useGetProductsQuery();
    const orders = ordersQuery.data ?? initialOrders ?? EMPTY_ORDERS;
    const products = productsQuery.data ?? initialProducts ?? EMPTY_PRODUCTS;
    const hasInitialOrders = ordersQuery.data !== undefined || initialOrders !== undefined;
    const hasInitialProducts = productsQuery.data !== undefined || initialProducts !== undefined;
    const isInitialLoading =
        (ordersQuery.isLoading && !hasInitialOrders) ||
        (productsQuery.isLoading && !hasInitialProducts);
    const [createOrderRequest] = useCreateOrderMutation();
    const [createProductRequest] = useCreateProductMutation();
    const [deleteOrderRequest] = useDeleteOrderMutation();
    const [deleteProductRequest] = useDeleteProductMutation();
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
    const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [isDetailsClosing, setIsDetailsClosing] = useState(false);
    const [addOrderError, setAddOrderError] = useState(false);
    const [addProductError, setAddProductError] = useState(false);
    const [deleteOrderError, setDeleteOrderError] = useState(false);
    const [deleteProductError, setDeleteProductError] = useState(false);
    const focusOrderIdRef = useRef<string | null>(null);
    const addOrderButtonRef = useRef<HTMLButtonElement>(null);
    const productsByOrderId = useMemo(() => groupProductsByOrderId(products), [products]);
    const visibleOrders = useMemo(
        () => filterOrders(orders, productsByOrderId, searchQuery),
        [orders, productsByOrderId, searchQuery],
    );
    const selectedOrder = useMemo(
        () => visibleOrders.find((order) => order.id === selectedOrderId) ?? null,
        [visibleOrders, selectedOrderId],
    );
    const pendingOrder = useMemo(
        () => orders.find((order) => order.id === pendingDeleteId) ?? null,
        [orders, pendingDeleteId],
    );
    const closeDetails = () => {
        if (!selectedOrderId || isDetailsClosing) {
            return;
        }

        focusOrderIdRef.current = selectedOrderId;
        setIsDetailsClosing(true);

        window.requestAnimationFrame(() => {
            document
                .querySelector<HTMLButtonElement>(`[data-order-id="${selectedOrderId}"]`)
                ?.focus();
        });
    };

    const finishClosingDetails = () => {
        setSelectedOrderId(null);
        setIsDetailsClosing(false);
    };

    const selectOrder = (orderId: string) => {
        if (isDetailsClosing) {
            return;
        }

        if (selectedOrderId === orderId) {
            closeDetails();
            return;
        }

        setSelectedOrderId(orderId);
    };
    useEffect(() => {
        const orderId = focusOrderIdRef.current;
        if (!orderId) return;
        document.querySelector<HTMLButtonElement>(`[data-order-id="${orderId}"]`)?.focus();
        focusOrderIdRef.current = null;
    }, [selectedOrderId, visibleOrders]);
    const removeOrder = async () => {
        if (!pendingDeleteId) return;

        setDeleteOrderError(false);
        try {
            await deleteOrderRequest(pendingDeleteId).unwrap();
        } catch {
            setDeleteOrderError(true);
            return;
        }

        if (selectedOrderId === pendingDeleteId) {
            setSelectedOrderId(null);
            setIsDetailsClosing(false);
        }

        setPendingDeleteId(null);
    };

    const removeProduct = async () => {
        if (!pendingProduct) return;

        setDeleteProductError(false);
        try {
            await deleteProductRequest(pendingProduct.id).unwrap();
        } catch {
            setDeleteProductError(true);
            return;
        }
        setPendingProduct(null);
    };

    const createOrder = async (title: string) => {
        setAddOrderError(false);
        try {
            await createOrderRequest({ title }).unwrap();
        } catch {
            setAddOrderError(true);
            return;
        }
        setIsAddOrderOpen(false);
    };

    const createProduct = async (draft: ProductDraft) => {
        if (!selectedOrder) return;

        setAddProductError(false);
        try {
            await createProductRequest({
                orderId: selectedOrder.id,
                title: draft.title,
                serialNumber: draft.serialNumber,
                type: draft.type,
                status: draft.status,
                specification: draft.specification,
                warranty: { start: draft.warrantyStart, end: draft.warrantyEnd },
                price: { usd: Number(draft.priceUsd), uah: Number(draft.priceUah) },
            }).unwrap();
        } catch {
            setAddProductError(true);
            return;
        }
        setIsAddProductOpen(false);
    };
    return (
        <div
            className={`page-workspace orders-workspace ${selectedOrder ? "orders-workspace--selected" : ""}`}
        >
            <header className="page-workspace__header">
                <button
                    ref={addOrderButtonRef}
                    type="button"
                    className="page-workspace__add"
                    onClick={() => setIsAddOrderOpen(true)}
                    aria-label={t.orders.addLabel}
                >
                    +
                </button>
                <h1>
                    {t.orders.title} <span>/ {hasInitialOrders ? orders.length : "—"}</span>
                </h1>
            </header>
            {isInitialLoading ? (
                <div className="orders-workspace__body row g-3">
                    <div className="col-12">
                        <OrdersListSkeleton />
                    </div>
                </div>
            ) : ordersQuery.isError || productsQuery.isError ? (
                <div className="empty-state">
                    <span>!</span>
                    <h2>{t.errors.loadOrders}</h2>
                    <p>{t.errors.connection}</p>
                    <button
                        type="button"
                        className="form-modal__submit"
                        onClick={() => {
                            void ordersQuery.refetch();
                            void productsQuery.refetch();
                        }}
                    >
                        {t.actions.retry}
                    </button>
                </div>
            ) : (
                <div className="orders-workspace__body row g-3">
                    <div className={selectedOrder ? "col-12 col-xl-5" : "col-12"}>
                        <OrderList
                            orders={visibleOrders}
                            productsByOrderId={productsByOrderId}
                            hasOrders={orders.length > 0}
                            selectedOrderId={selectedOrderId}
                            onSelect={selectOrder}
                            onDelete={(orderId) => {
                                setDeleteOrderError(false);
                                setPendingDeleteId(orderId);
                            }}
                        />
                    </div>
                    {selectedOrder && (
                        <div className="col-12 col-xl-7">
                            <OrderDetails
                                key={selectedOrder.id}
                                order={selectedOrder}
                                products={productsByOrderId.get(selectedOrder.id) ?? []}
                                isClosing={isDetailsClosing}
                                onClose={closeDetails}
                                onCloseAnimationEnd={finishClosingDetails}
                                onDeleteProduct={(product) => {
                                    setDeleteProductError(false);
                                    setPendingProduct(product);
                                }}
                                onAddProduct={() => {
                                    setAddProductError(false);
                                    setIsAddProductOpen(true);
                                }}
                            />
                        </div>
                    )}
                </div>
            )}
            {pendingOrder && (
                <DeleteOrderModal
                    order={pendingOrder}
                    products={productsByOrderId.get(pendingOrder.id) ?? []}
                    error={deleteOrderError ? t.errors.deleteOrder : null}
                    onCancel={() => {
                        setDeleteOrderError(false);
                        setPendingDeleteId(null);
                    }}
                    onConfirm={removeOrder}
                    fallbackFocus={() => addOrderButtonRef.current}
                />
            )}
            {pendingProduct && (
                <DeleteProductModal
                    product={pendingProduct}
                    error={deleteProductError ? t.errors.deleteProduct : null}
                    onCancel={() => {
                        setDeleteProductError(false);
                        setPendingProduct(null);
                    }}
                    onConfirm={removeProduct}
                    fallbackFocus={() =>
                        document.querySelector<HTMLElement>(".order-details__add") ??
                        addOrderButtonRef.current
                    }
                />
            )}
            {isAddOrderOpen && (
                <AddOrderDialog
                    error={addOrderError ? t.errors.createOrder : null}
                    onCancel={() => {
                        setAddOrderError(false);
                        setIsAddOrderOpen(false);
                    }}
                    onCreate={createOrder}
                />
            )}
            {isAddProductOpen && selectedOrder && (
                <AddProductDialog
                    orderTitle={selectedOrder.title}
                    error={addProductError ? t.errors.createProduct : null}
                    onCancel={() => {
                        setAddProductError(false);
                        setIsAddProductOpen(false);
                    }}
                    onCreate={createProduct}
                />
            )}
        </div>
    );
}

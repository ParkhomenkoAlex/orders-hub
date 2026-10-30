"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { OrderDetails } from "./OrderDetails";
import { OrderList } from "./OrderList";
import { OrdersListSkeleton } from "./OrdersListSkeleton";
import { DeleteProductModal } from "../products/DeleteProductModal";

const EMPTY_ORDERS: Order[] = [];
const EMPTY_PRODUCTS: Product[] = [];

interface OrdersWorkspaceProps {
    initialOrders?: Order[];
    initialProducts?: Product[];
}

export function OrdersWorkspace({ initialOrders, initialProducts }: OrdersWorkspaceProps) {
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
    const [addOrderError, setAddOrderError] = useState<string | null>(null);
    const [addProductError, setAddProductError] = useState<string | null>(null);
    const [deleteOrderError, setDeleteOrderError] = useState<string | null>(null);
    const [deleteProductError, setDeleteProductError] = useState<string | null>(null);
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

        setDeleteOrderError(null);
        try {
            await deleteOrderRequest(pendingDeleteId).unwrap();
        } catch {
            setDeleteOrderError("Unable to delete this order. Please try again.");
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

        setDeleteProductError(null);
        try {
            await deleteProductRequest(pendingProduct.id).unwrap();
        } catch {
            setDeleteProductError("Unable to delete this product. Please try again.");
            return;
        }
        setPendingProduct(null);
    };

    const createOrder = async (title: string) => {
        setAddOrderError(null);
        try {
            await createOrderRequest({ title }).unwrap();
        } catch {
            setAddOrderError("Unable to create this order. Please try again.");
            return;
        }
        setIsAddOrderOpen(false);
    };

    const createProduct = async (draft: ProductDraft) => {
        if (!selectedOrder) return;

        setAddProductError(null);
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
            setAddProductError("Unable to create this product. Please try again.");
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
                    aria-label="Add order"
                >
                    +
                </button>
                <h1>
                    Orders <span>/ {hasInitialOrders ? orders.length : "—"}</span>
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
                    <h2>Unable to load orders</h2>
                    <p>Please check the connection and try again.</p>
                    <button
                        type="button"
                        className="form-modal__submit"
                        onClick={() => {
                            void ordersQuery.refetch();
                            void productsQuery.refetch();
                        }}
                    >
                        Retry
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
                                setDeleteOrderError(null);
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
                                    setDeleteProductError(null);
                                    setPendingProduct(product);
                                }}
                                onAddProduct={() => {
                                    setAddProductError(null);
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
                    error={deleteOrderError}
                    onCancel={() => {
                        setDeleteOrderError(null);
                        setPendingDeleteId(null);
                    }}
                    onConfirm={removeOrder}
                    fallbackFocus={() => addOrderButtonRef.current}
                />
            )}
            {pendingProduct && (
                <DeleteProductModal
                    product={pendingProduct}
                    error={deleteProductError}
                    onCancel={() => {
                        setDeleteProductError(null);
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
                    error={addOrderError}
                    onCancel={() => {
                        setAddOrderError(null);
                        setIsAddOrderOpen(false);
                    }}
                    onCreate={createOrder}
                />
            )}
            {isAddProductOpen && selectedOrder && (
                <AddProductDialog
                    orderTitle={selectedOrder.title}
                    error={addProductError}
                    onCancel={() => {
                        setAddProductError(null);
                        setIsAddProductOpen(false);
                    }}
                    onCreate={createProduct}
                />
            )}
        </div>
    );
}

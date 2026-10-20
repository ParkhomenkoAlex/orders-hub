"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { filterOrders } from "@/lib/order-domain";
import { useOrdersData } from "@/state/OrdersDataProvider";
import type { Product, ProductDraft } from "@/types/domain";
import { AddOrderDialog } from "./AddOrderDialog";
import { AddProductDialog } from "./AddProductDialog";
import { DeleteOrderModal } from "./DeleteOrderModal";
import { OrderDetails } from "./OrderDetails";
import { OrderList } from "./OrderList";
import { DeleteProductModal } from "../products/DeleteProductModal";

export function OrdersWorkspace() {
    const {
        orders,
        productsByOrderId,
        deleteOrder,
        deleteProduct,
        addOrder,
        addProduct,
        searchQuery,
    } = useOrdersData();
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
    const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [isDetailsClosing, setIsDetailsClosing] = useState(false);
    const focusOrderIdRef = useRef<string | null>(null);
    const addOrderButtonRef = useRef<HTMLButtonElement>(null);
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
    const removeOrder = () => {
        if (!pendingDeleteId) return;

        deleteOrder(pendingDeleteId);

        if (selectedOrderId === pendingDeleteId) {
            setSelectedOrderId(null);
            setIsDetailsClosing(false);
        }

        setPendingDeleteId(null);
    };

    const removeProduct = () => {
        if (!pendingProduct) return;

        deleteProduct(pendingProduct.id);
        setPendingProduct(null);
    };

    const createOrder = (title: string) => {
        addOrder(title);
        setIsAddOrderOpen(false);
    };

    const createProduct = (draft: ProductDraft) => {
        if (!selectedOrder) return;

        addProduct(selectedOrder.id, draft);
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
                    Orders <span>/ {orders.length}</span>
                </h1>
            </header>
            <div className="orders-workspace__body row g-3">
                <div className={selectedOrder ? "col-12 col-xl-5" : "col-12"}>
                    <OrderList
                        orders={visibleOrders}
                        productsByOrderId={productsByOrderId}
                        hasOrders={orders.length > 0}
                        selectedOrderId={selectedOrderId}
                        onSelect={selectOrder}
                        onDelete={setPendingDeleteId}
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
                            onDeleteProduct={setPendingProduct}
                            onAddProduct={() => setIsAddProductOpen(true)}
                        />
                    </div>
                )}
            </div>
            {pendingOrder && (
                <DeleteOrderModal
                    order={pendingOrder}
                    products={productsByOrderId.get(pendingOrder.id) ?? []}
                    onCancel={() => setPendingDeleteId(null)}
                    onConfirm={removeOrder}
                    fallbackFocus={() => addOrderButtonRef.current}
                />
            )}
            {pendingProduct && (
                <DeleteProductModal
                    product={pendingProduct}
                    onCancel={() => setPendingProduct(null)}
                    onConfirm={removeProduct}
                    fallbackFocus={() =>
                        document.querySelector<HTMLElement>(".order-details__add") ??
                        addOrderButtonRef.current
                    }
                />
            )}
            {isAddOrderOpen && (
                <AddOrderDialog onCancel={() => setIsAddOrderOpen(false)} onCreate={createOrder} />
            )}
            {isAddProductOpen && selectedOrder && (
                <AddProductDialog
                    orderTitle={selectedOrder.title}
                    onCancel={() => setIsAddProductOpen(false)}
                    onCreate={createProduct}
                />
            )}
        </div>
    );
}

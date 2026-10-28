"use client";

import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import type { Order, Product } from "@/types/domain";

interface DeleteOrderModalProps {
    order: Order;
    products: Product[];
    error?: string | null;
    onCancel: () => void;
    onConfirm: () => void;
    fallbackFocus?: () => HTMLElement | null;
}

export function DeleteOrderModal({
    order,
    products,
    error,
    onCancel,
    onConfirm,
    fallbackFocus,
}: DeleteOrderModalProps) {
    return (
        <ConfirmDeleteDialog
            titleId="delete-order-title"
            descriptionId="delete-order-description"
            title="Delete this order?"
            description={
                <>
                    The order <strong>{order.title}</strong> and its {products.length} related
                    product{products.length === 1 ? "" : "s"} will be removed from this session.
                </>
            }
            preview={products[0]}
            error={error}
            onCancel={onCancel}
            onConfirm={onConfirm}
            fallbackFocus={fallbackFocus}
        />
    );
}

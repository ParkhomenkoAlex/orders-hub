import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import type { Product } from "@/types/domain";

interface DeleteProductModalProps {
    product: Product;
    error?: string | null;
    onCancel: () => void;
    onConfirm: () => void;
    fallbackFocus?: () => HTMLElement | null;
}

export function DeleteProductModal({
    product,
    error,
    onCancel,
    onConfirm,
    fallbackFocus,
}: DeleteProductModalProps) {
    return (
        <ConfirmDeleteDialog
            titleId="delete-product-title"
            descriptionId="delete-product-description"
            title="Delete this product?"
            description={
                <>
                    <strong>{product.title}</strong> will be removed from this order. The order
                    itself will remain available.
                </>
            }
            preview={product}
            error={error}
            onCancel={onCancel}
            onConfirm={onConfirm}
            fallbackFocus={fallbackFocus}
        />
    );
}

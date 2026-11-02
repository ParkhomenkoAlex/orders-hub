"use client";

import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import { useTranslation } from "@/i18n/I18nProvider";
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
    const { t } = useTranslation();
    const [beforeTitle = "", afterTitle = ""] = t.dialogs.deleteProductDescription.split("{title}");

    return (
        <ConfirmDeleteDialog
            titleId="delete-product-title"
            descriptionId="delete-product-description"
            title={t.dialogs.deleteProductTitle}
            description={
                <>
                    {beforeTitle}
                    <strong>{product.title}</strong>
                    {afterTitle}
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

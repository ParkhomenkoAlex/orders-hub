"use client";

import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import { useTranslation } from "@/i18n/I18nProvider";
import { getCountForm } from "@/i18n/plural";
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
    const { locale, t } = useTranslation();
    const description = t.dialogs.deleteOrderDescription[getCountForm(products.length, locale)];
    const [beforeTitle = "", afterTitle = ""] = description.split("{title}");

    return (
        <ConfirmDeleteDialog
            titleId="delete-order-title"
            descriptionId="delete-order-description"
            title={t.dialogs.deleteOrderTitle}
            description={
                <>
                    {beforeTitle}
                    <strong>{order.title}</strong>
                    {afterTitle.replace("{count}", String(products.length))}
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

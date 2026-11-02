"use client";

import { useTranslation } from "@/i18n/I18nProvider";
import type { ProductStatus } from "@/types/domain";

interface ProductMarkProps {
    status: ProductStatus;
}

export function ProductMark({ status }: ProductMarkProps) {
    const { t } = useTranslation();

    return (
        <span
            className="product-mark"
            aria-label={`${t.productStatuses[status]}: ${t.products.product}`}
        >
            <span
                className={`product-mark__dot product-mark__dot--${status.toLowerCase().replace(" ", "-")}`}
            />
            <span className="product-mark__screen" aria-hidden="true">
                <span />
            </span>
        </span>
    );
}

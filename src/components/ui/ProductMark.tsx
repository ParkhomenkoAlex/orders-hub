"use client";

import { useTranslation } from "@/i18n/I18nProvider";
import type { ProductStatus } from "@/types/domain";
import styles from "./ProductMark.module.scss";

interface ProductMarkProps {
    status: ProductStatus;
}

export function ProductMark({ status }: ProductMarkProps) {
    const { t } = useTranslation();

    return (
        <span
            className={styles.productMark}
            aria-label={`${t.productStatuses[status]}: ${t.products.product}`}
        >
            <span
                className={`${styles.productMark__dot} ${
                    status === "In service"
                        ? styles["productMark__dot--inService"]
                        : status === "Reserved"
                          ? styles["productMark__dot--reserved"]
                          : ""
                }`}
            />
            <span className={styles.productMark__screen} aria-hidden="true">
                <span />
            </span>
        </span>
    );
}

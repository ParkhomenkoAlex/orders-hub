"use client";

import { useState, type FormEvent } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { useTranslation } from "@/i18n/I18nProvider";
import { PRODUCT_TYPES } from "@/lib/order-domain";
import type { ProductDraft, ProductStatus, ProductType } from "@/types/domain";
import styles from "@/components/ui/FormDialog.module.scss";

const PRODUCT_STATUSES: readonly ProductStatus[] = ["Available", "In service", "Reserved"];

const isProductType = (value: string): value is ProductType =>
    PRODUCT_TYPES.some((type) => type === value);

const isProductStatus = (value: string): value is ProductStatus =>
    PRODUCT_STATUSES.some((status) => status === value);

const isCalendarDate = (value: string) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
        return false;
    }

    const [year, month, day] = match.slice(1).map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const initialDraft: ProductDraft = {
    title: "",
    serialNumber: "",
    type: "Accessories",
    status: "Available",
    specification: "Standard",
    warrantyStart: "",
    warrantyEnd: "",
    priceUsd: "",
    priceUah: "",
};

type ProductValidationErrorKey =
    | "productTitleRequired"
    | "serialNumberRequired"
    | "warrantyStartInvalid"
    | "warrantyEndInvalid"
    | "warrantyEndBeforeStart"
    | "priceUsdInvalid"
    | "priceUahInvalid";

type ProductValidationErrors = Partial<Record<keyof ProductDraft, ProductValidationErrorKey>>;

export const validateProductDraft = (draft: ProductDraft): ProductValidationErrors => {
    const errors: ProductValidationErrors = {};
    const priceUsd = Number(draft.priceUsd);
    const priceUah = Number(draft.priceUah);

    if (!draft.title.trim()) errors.title = "productTitleRequired";
    if (!draft.serialNumber.trim()) errors.serialNumber = "serialNumberRequired";
    if (!isCalendarDate(draft.warrantyStart)) errors.warrantyStart = "warrantyStartInvalid";
    if (!isCalendarDate(draft.warrantyEnd)) errors.warrantyEnd = "warrantyEndInvalid";
    if (
        isCalendarDate(draft.warrantyStart) &&
        isCalendarDate(draft.warrantyEnd) &&
        draft.warrantyEnd < draft.warrantyStart
    ) {
        errors.warrantyEnd = "warrantyEndBeforeStart";
    }
    if (!draft.priceUsd.trim() || !Number.isFinite(priceUsd) || priceUsd < 0) {
        errors.priceUsd = "priceUsdInvalid";
    }
    if (!draft.priceUah.trim() || !Number.isFinite(priceUah) || priceUah < 0) {
        errors.priceUah = "priceUahInvalid";
    }

    return errors;
};

interface AddProductDialogProps {
    orderTitle: string;
    error?: string | null;
    onCancel: () => void;
    onCreate: (draft: ProductDraft) => void;
}

export function AddProductDialog({ error, orderTitle, onCancel, onCreate }: AddProductDialogProps) {
    const { t } = useTranslation();
    const [draft, setDraft] = useState<ProductDraft>(initialDraft);
    const [errors, setErrors] = useState<ProductValidationErrors>({});

    const updateField = <Field extends keyof ProductDraft>(
        field: Field,
        value: ProductDraft[Field],
    ) => {
        setDraft((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextErrors = validateProductDraft(draft);

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }

        onCreate({
            ...draft,
            title: draft.title.trim(),
            serialNumber: draft.serialNumber.trim(),
            specification: draft.specification.trim() || "Standard",
        });
    };

    return (
        <ModalDialog
            className={`${styles.formModal} ${styles["formModal--product"]}`}
            titleId="add-product-title"
            descriptionId="add-product-description"
            onClose={onCancel}
        >
            <div className={styles.formModal__content}>
                <header className={styles.formModal__header}>
                    <h2 id="add-product-title">{t.dialogs.addProductTitle}</h2>
                    <p id="add-product-description">
                        {t.dialogs.addProductDescription.replace("{orderTitle}", orderTitle)}
                    </p>
                </header>
                <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.formModal__grid}>
                        <div
                            className={`${styles.formModal__field} ${styles["formModal__field--wide"]}`}
                        >
                            <label htmlFor="product-title">{t.dialogs.productTitle}</label>
                            <input
                                id="product-title"
                                className="form-control"
                                value={draft.title}
                                required
                                onChange={(event) => updateField("title", event.target.value)}
                                aria-invalid={Boolean(errors.title)}
                                aria-describedby={errors.title ? "product-title-error" : undefined}
                                data-autofocus
                            />
                            {errors.title && (
                                <p id="product-title-error" className={styles.formModal__error}>
                                    {t.validation[errors.title]}
                                </p>
                            )}
                        </div>
                        <div className={styles.formModal__field}>
                            <label htmlFor="product-serial">{t.dialogs.serialNumber}</label>
                            <input
                                id="product-serial"
                                className="form-control"
                                value={draft.serialNumber}
                                required
                                onChange={(event) =>
                                    updateField("serialNumber", event.target.value)
                                }
                                aria-invalid={Boolean(errors.serialNumber)}
                                aria-describedby={
                                    errors.serialNumber ? "product-serial-error" : undefined
                                }
                            />
                            {errors.serialNumber && (
                                <p id="product-serial-error" className={styles.formModal__error}>
                                    {t.validation[errors.serialNumber]}
                                </p>
                            )}
                        </div>
                        <div className={styles.formModal__field}>
                            <label htmlFor="product-specification">
                                {t.products.specification}
                            </label>
                            <input
                                id="product-specification"
                                className="form-control"
                                value={draft.specification}
                                onChange={(event) =>
                                    updateField("specification", event.target.value)
                                }
                            />
                        </div>
                        <div className={styles.formModal__field}>
                            <label htmlFor="product-type">{t.dialogs.productType}</label>
                            <select
                                id="product-type"
                                className="form-select"
                                value={draft.type}
                                onChange={(event) => {
                                    if (isProductType(event.target.value)) {
                                        updateField("type", event.target.value);
                                    }
                                }}
                            >
                                {PRODUCT_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {t.productTypes[type]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formModal__field}>
                            <label htmlFor="product-status">{t.dialogs.productStatus}</label>
                            <select
                                id="product-status"
                                className="form-select"
                                value={draft.status}
                                onChange={(event) => {
                                    if (isProductStatus(event.target.value)) {
                                        updateField("status", event.target.value);
                                    }
                                }}
                            >
                                {PRODUCT_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {t.productStatuses[status]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formModal__field}>
                            <label htmlFor="warranty-start">{t.dialogs.warrantyStart}</label>
                            <input
                                id="warranty-start"
                                className="form-control"
                                type="date"
                                value={draft.warrantyStart}
                                required
                                onChange={(event) =>
                                    updateField("warrantyStart", event.target.value)
                                }
                                aria-invalid={Boolean(errors.warrantyStart)}
                                aria-describedby={
                                    errors.warrantyStart ? "warranty-start-error" : undefined
                                }
                            />
                            {errors.warrantyStart && (
                                <p
                                    id="warranty-start-error"
                                    className={styles.formModal__error}
                                    role="alert"
                                >
                                    {t.validation[errors.warrantyStart]}
                                </p>
                            )}
                        </div>
                        <div className={styles.formModal__field}>
                            <label htmlFor="warranty-end">{t.dialogs.warrantyEnd}</label>
                            <input
                                id="warranty-end"
                                className="form-control"
                                type="date"
                                value={draft.warrantyEnd}
                                required
                                onChange={(event) => updateField("warrantyEnd", event.target.value)}
                                aria-invalid={Boolean(errors.warrantyEnd)}
                                aria-describedby={
                                    errors.warrantyEnd ? "warranty-end-error" : undefined
                                }
                            />
                            {errors.warrantyEnd && (
                                <p
                                    id="warranty-end-error"
                                    className={styles.formModal__error}
                                    role="alert"
                                >
                                    {t.validation[errors.warrantyEnd]}
                                </p>
                            )}
                        </div>
                        <div className={styles.formModal__field}>
                            <label htmlFor="price-usd">{t.dialogs.priceUsd}</label>
                            <input
                                id="price-usd"
                                className="form-control"
                                type="number"
                                min="0"
                                step="0.01"
                                value={draft.priceUsd}
                                required
                                onChange={(event) => updateField("priceUsd", event.target.value)}
                                aria-invalid={Boolean(errors.priceUsd)}
                                aria-describedby={errors.priceUsd ? "price-usd-error" : undefined}
                            />
                            {errors.priceUsd && (
                                <p
                                    id="price-usd-error"
                                    className={styles.formModal__error}
                                    role="alert"
                                >
                                    {t.validation[errors.priceUsd]}
                                </p>
                            )}
                        </div>
                        <div className={styles.formModal__field}>
                            <label htmlFor="price-uah">{t.dialogs.priceUah}</label>
                            <input
                                id="price-uah"
                                className="form-control"
                                type="number"
                                min="0"
                                step="0.01"
                                value={draft.priceUah}
                                required
                                onChange={(event) => updateField("priceUah", event.target.value)}
                                aria-invalid={Boolean(errors.priceUah)}
                                aria-describedby={errors.priceUah ? "price-uah-error" : undefined}
                            />
                            {errors.priceUah && (
                                <p
                                    id="price-uah-error"
                                    className={styles.formModal__error}
                                    role="alert"
                                >
                                    {t.validation[errors.priceUah]}
                                </p>
                            )}
                        </div>
                    </div>
                    {error && (
                        <p className={styles.formModal__error} role="alert">
                            {error}
                        </p>
                    )}
                    <footer className={styles.formModal__actions}>
                        <button
                            type="button"
                            className={styles.formModal__cancel}
                            onClick={onCancel}
                        >
                            {t.actions.cancel}
                        </button>
                        <button type="submit" className={styles.formModal__submit}>
                            {t.dialogs.createProduct}
                        </button>
                    </footer>
                </form>
            </div>
        </ModalDialog>
    );
}

"use client";

import { useState, type FormEvent } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { PRODUCT_TYPES } from "@/lib/order-domain";
import type { ProductDraft, ProductStatus, ProductType } from "@/types/domain";

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

interface AddProductDialogProps {
    orderTitle: string;
    error?: string | null;
    onCancel: () => void;
    onCreate: (draft: ProductDraft) => void;
}

export function AddProductDialog({ error, orderTitle, onCancel, onCreate }: AddProductDialogProps) {
    const [draft, setDraft] = useState<ProductDraft>(initialDraft);
    const [errors, setErrors] = useState<Partial<Record<keyof ProductDraft, string>>>({});

    const updateField = <Field extends keyof ProductDraft>(
        field: Field,
        value: ProductDraft[Field],
    ) => {
        setDraft((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextErrors: Partial<Record<keyof ProductDraft, string>> = {};
        const priceUsd = Number(draft.priceUsd);
        const priceUah = Number(draft.priceUah);

        if (!draft.title.trim()) nextErrors.title = "Enter a product title.";
        if (!draft.serialNumber.trim()) nextErrors.serialNumber = "Enter a serial number.";
        if (!isCalendarDate(draft.warrantyStart))
            nextErrors.warrantyStart = "Enter a valid start date.";
        if (!isCalendarDate(draft.warrantyEnd)) nextErrors.warrantyEnd = "Enter a valid end date.";
        if (
            isCalendarDate(draft.warrantyStart) &&
            isCalendarDate(draft.warrantyEnd) &&
            draft.warrantyEnd < draft.warrantyStart
        ) {
            nextErrors.warrantyEnd = "The end date cannot be earlier than the start date.";
        }
        if (!draft.priceUsd.trim() || !Number.isFinite(priceUsd) || priceUsd < 0) {
            nextErrors.priceUsd = "Enter a non-negative USD price.";
        }
        if (!draft.priceUah.trim() || !Number.isFinite(priceUah) || priceUah < 0) {
            nextErrors.priceUah = "Enter a non-negative UAH price.";
        }

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
            className="form-modal form-modal--product"
            titleId="add-product-title"
            descriptionId="add-product-description"
            onClose={onCancel}
        >
            <div className="form-modal__content">
                <header className="form-modal__header">
                    <h2 id="add-product-title">Add product</h2>
                    <p id="add-product-description">Add a product to {orderTitle}.</p>
                </header>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-modal__grid">
                        <div className="form-modal__field form-modal__field--wide">
                            <label htmlFor="product-title">Product title</label>
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
                                <p id="product-title-error" className="form-modal__error">
                                    {errors.title}
                                </p>
                            )}
                        </div>
                        <div className="form-modal__field">
                            <label htmlFor="product-serial">Serial number</label>
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
                                <p id="product-serial-error" className="form-modal__error">
                                    {errors.serialNumber}
                                </p>
                            )}
                        </div>
                        <div className="form-modal__field">
                            <label htmlFor="product-specification">Specification</label>
                            <input
                                id="product-specification"
                                className="form-control"
                                value={draft.specification}
                                onChange={(event) =>
                                    updateField("specification", event.target.value)
                                }
                            />
                        </div>
                        <div className="form-modal__field">
                            <label htmlFor="product-type">Product type</label>
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
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-modal__field">
                            <label htmlFor="product-status">Status</label>
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
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-modal__field">
                            <label htmlFor="warranty-start">Warranty start</label>
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
                                    className="form-modal__error"
                                    role="alert"
                                >
                                    {errors.warrantyStart}
                                </p>
                            )}
                        </div>
                        <div className="form-modal__field">
                            <label htmlFor="warranty-end">Warranty end</label>
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
                                    className="form-modal__error"
                                    role="alert"
                                >
                                    {errors.warrantyEnd}
                                </p>
                            )}
                        </div>
                        <div className="form-modal__field">
                            <label htmlFor="price-usd">Price, USD</label>
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
                                <p id="price-usd-error" className="form-modal__error" role="alert">
                                    {errors.priceUsd}
                                </p>
                            )}
                        </div>
                        <div className="form-modal__field">
                            <label htmlFor="price-uah">Price, UAH</label>
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
                                <p id="price-uah-error" className="form-modal__error" role="alert">
                                    {errors.priceUah}
                                </p>
                            )}
                        </div>
                    </div>
                    {error && (
                        <p className="form-modal__error" role="alert">
                            {error}
                        </p>
                    )}
                    <footer className="form-modal__actions">
                        <button type="button" className="form-modal__cancel" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="form-modal__submit">
                            Add product
                        </button>
                    </footer>
                </form>
            </div>
        </ModalDialog>
    );
}

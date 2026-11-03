"use client";

import type { ReactNode } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { ProductMark } from "@/components/ui/ProductMark";
import { useTranslation } from "@/i18n/I18nProvider";
import type { Product } from "@/types/domain";
import formStyles from "./FormDialog.module.scss";
import styles from "./ConfirmDeleteDialog.module.scss";

interface ConfirmDeleteDialogProps {
    titleId: string;
    descriptionId: string;
    title: string;
    description: ReactNode;
    preview?: Product;
    error?: string | null;
    onCancel: () => void;
    onConfirm: () => void;
    fallbackFocus?: () => HTMLElement | null;
}

export function ConfirmDeleteDialog({
    titleId,
    descriptionId,
    title,
    description,
    preview,
    error,
    onCancel,
    onConfirm,
    fallbackFocus,
}: ConfirmDeleteDialogProps) {
    const { t } = useTranslation();

    return (
        <ModalDialog
            className={styles.deleteModal}
            titleId={titleId}
            descriptionId={descriptionId}
            onClose={onCancel}
            fallbackFocus={fallbackFocus}
        >
            <button
                className={styles.deleteModal__close}
                type="button"
                onClick={onCancel}
                aria-label={t.dialogs.closeConfirmation}
            >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path
                        d="m4 4 8 8M12 4l-8 8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                </svg>
            </button>
            <div className={styles.deleteModal__content}>
                <h2 id={titleId}>{title}</h2>
                <p id={descriptionId}>{description}</p>
                {preview && (
                    <div className={styles.deleteModal__preview}>
                        <ProductMark status={preview.status} />
                        <div>
                            <strong>{preview.title}</strong>
                            <span>{preview.serialNumber}</span>
                        </div>
                    </div>
                )}
                {error && (
                    <p className={formStyles.formModal__error} role="alert">
                        {error}
                    </p>
                )}
            </div>
            <footer className={styles.deleteModal__actions}>
                <button
                    type="button"
                    className={styles.deleteModal__cancel}
                    onClick={onCancel}
                    data-autofocus
                >
                    {t.actions.cancel}
                </button>
                <button type="button" className={styles.deleteModal__confirm} onClick={onConfirm}>
                    {t.actions.delete}
                </button>
            </footer>
        </ModalDialog>
    );
}

import type { ReactNode } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { ProductMark } from "@/components/ui/ProductMark";
import type { Product } from "@/types/domain";

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
    return (
        <ModalDialog
            className="delete-modal"
            titleId={titleId}
            descriptionId={descriptionId}
            onClose={onCancel}
            fallbackFocus={fallbackFocus}
        >
            <button
                className="delete-modal__close"
                type="button"
                onClick={onCancel}
                aria-label="Close confirmation"
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
            <div className="delete-modal__content">
                <h2 id={titleId}>{title}</h2>
                <p id={descriptionId}>{description}</p>
                {preview && (
                    <div className="delete-modal__preview">
                        <ProductMark status={preview.status} />
                        <div>
                            <strong>{preview.title}</strong>
                            <span>{preview.serialNumber}</span>
                        </div>
                    </div>
                )}
                {error && (
                    <p className="form-modal__error" role="alert">
                        {error}
                    </p>
                )}
            </div>
            <footer className="delete-modal__actions">
                <button
                    type="button"
                    className="delete-modal__cancel"
                    onClick={onCancel}
                    data-autofocus
                >
                    Cancel
                </button>
                <button type="button" className="delete-modal__confirm" onClick={onConfirm}>
                    Delete
                </button>
            </footer>
        </ModalDialog>
    );
}

"use client";

import { useState, type FormEvent } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";

interface AddOrderDialogProps {
    error?: string | null;
    onCancel: () => void;
    onCreate: (title: string) => void;
}

export function AddOrderDialog({ error: apiError, onCancel, onCreate }: AddOrderDialogProps) {
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setError("Enter an order title.");
            return;
        }

        onCreate(trimmedTitle);
    };

    return (
        <ModalDialog
            className="form-modal"
            titleId="add-order-title"
            descriptionId="add-order-description"
            onClose={onCancel}
        >
            <div className="form-modal__content">
                <header className="form-modal__header">
                    <h2 id="add-order-title">Add order</h2>
                    <p id="add-order-description">
                        Create an empty order and add products to it later.
                    </p>
                </header>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-modal__field">
                        <label htmlFor="order-title">Order title</label>
                        <input
                            id="order-title"
                            className="form-control"
                            value={title}
                            required
                            onChange={(event) => {
                                setTitle(event.target.value);
                                setError("");
                            }}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? "order-title-error" : undefined}
                            data-autofocus
                        />
                        {error && (
                            <p id="order-title-error" className="form-modal__error" role="alert">
                                {error}
                            </p>
                        )}
                    </div>
                    {apiError && (
                        <p className="form-modal__error" role="alert">
                            {apiError}
                        </p>
                    )}
                    <footer className="form-modal__actions">
                        <button type="button" className="form-modal__cancel" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="form-modal__submit">
                            Create order
                        </button>
                    </footer>
                </form>
            </div>
        </ModalDialog>
    );
}

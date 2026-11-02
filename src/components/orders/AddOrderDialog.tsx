"use client";

import { useState, type FormEvent } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { useTranslation } from "@/i18n/I18nProvider";

interface AddOrderDialogProps {
    error?: string | null;
    onCancel: () => void;
    onCreate: (title: string) => void;
}

export function AddOrderDialog({ error: apiError, onCancel, onCreate }: AddOrderDialogProps) {
    const { t } = useTranslation();
    const [title, setTitle] = useState("");
    const [hasTitleError, setHasTitleError] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setHasTitleError(true);
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
                    <h2 id="add-order-title">{t.dialogs.addOrderTitle}</h2>
                    <p id="add-order-description">{t.dialogs.addOrderDescription}</p>
                </header>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-modal__field">
                        <label htmlFor="order-title">{t.dialogs.orderTitle}</label>
                        <input
                            id="order-title"
                            className="form-control"
                            value={title}
                            required
                            onChange={(event) => {
                                setTitle(event.target.value);
                                setHasTitleError(false);
                            }}
                            aria-invalid={hasTitleError}
                            aria-describedby={hasTitleError ? "order-title-error" : undefined}
                            data-autofocus
                        />
                        {hasTitleError && (
                            <p id="order-title-error" className="form-modal__error" role="alert">
                                {t.validation.orderTitleRequired}
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
                            {t.actions.cancel}
                        </button>
                        <button type="submit" className="form-modal__submit">
                            {t.dialogs.createOrder}
                        </button>
                    </footer>
                </form>
            </div>
        </ModalDialog>
    );
}

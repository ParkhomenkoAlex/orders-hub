"use client";

import { useState, type FormEvent } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { useTranslation } from "@/i18n/I18nProvider";
import styles from "@/components/ui/FormDialog.module.scss";

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
            className={styles.formModal}
            titleId="add-order-title"
            descriptionId="add-order-description"
            onClose={onCancel}
        >
            <div className={styles.formModal__content}>
                <header className={styles.formModal__header}>
                    <h2 id="add-order-title">{t.dialogs.addOrderTitle}</h2>
                    <p id="add-order-description">{t.dialogs.addOrderDescription}</p>
                </header>
                <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.formModal__field}>
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
                            <p
                                id="order-title-error"
                                className={styles.formModal__error}
                                role="alert"
                            >
                                {t.validation.orderTitleRequired}
                            </p>
                        )}
                    </div>
                    {apiError && (
                        <p className={styles.formModal__error} role="alert">
                            {apiError}
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
                            {t.dialogs.createOrder}
                        </button>
                    </footer>
                </form>
            </div>
        </ModalDialog>
    );
}

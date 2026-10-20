"use client";

import { useEffect, useEffectEvent, useRef, type ReactNode } from "react";

interface ModalDialogProps {
    className: string;
    titleId: string;
    descriptionId?: string;
    children: ReactNode;
    onClose: () => void;
    fallbackFocus?: () => HTMLElement | null;
}

export function ModalDialog({
    className,
    titleId,
    descriptionId,
    children,
    onClose,
    fallbackFocus,
}: ModalDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const requestClose = useEffectEvent(() => onClose());
    const resolveFallbackFocus = useEffectEvent(() => fallbackFocus?.());

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) {
            return;
        }

        const previousFocus =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;

        const handleCancel = (event: Event) => {
            event.preventDefault();
            requestClose();
        };

        const handleClick = (event: MouseEvent) => {
            const bounds = dialog.getBoundingClientRect();

            // Native dialogs receive a click on their backdrop. A geometric test keeps controls
            // positioned slightly outside the dialog, such as the close button, interactive.
            if (
                event.clientX < bounds.left ||
                event.clientX > bounds.right ||
                event.clientY < bounds.top ||
                event.clientY > bounds.bottom
            ) {
                requestClose();
            }
        };

        dialog.addEventListener("cancel", handleCancel);
        dialog.addEventListener("click", handleClick);
        dialog.showModal();
        dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();

        return () => {
            dialog.removeEventListener("cancel", handleCancel);
            dialog.removeEventListener("click", handleClick);

            if (dialog.open) {
                dialog.close();
            }

            window.requestAnimationFrame(() => {
                const focusTarget = previousFocus?.isConnected
                    ? previousFocus
                    : resolveFallbackFocus();

                focusTarget?.focus();
            });
        };
    }, []);

    return (
        <dialog
            ref={dialogRef}
            className={className}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
        >
            {children}
        </dialog>
    );
}

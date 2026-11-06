"use client";

import { useEffect } from "react";

export const SERVICE_WORKER_PATH = "/sw.js";

export const canRegisterServiceWorker = (
    serviceWorker: ServiceWorkerContainer | undefined,
    isProduction: boolean,
) => Boolean(isProduction && serviceWorker);

export const registerPwaServiceWorker = (serviceWorker: ServiceWorkerContainer) =>
    serviceWorker.register(SERVICE_WORKER_PATH, { scope: "/", type: "module" });

export function PwaRegistration() {
    useEffect(() => {
        const serviceWorker = navigator.serviceWorker;

        if (!canRegisterServiceWorker(serviceWorker, process.env.NODE_ENV === "production")) {
            return;
        }

        void registerPwaServiceWorker(serviceWorker).catch(() => undefined);
    }, []);

    return null;
}

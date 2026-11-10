"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useTranslation } from "@/i18n/I18nProvider";
import { createOrderStatusSummaryMetrics } from "@/lib/order-status-summary";
import type {
    OrderStatusSummaryContract,
    OrderStatusSummaryMetrics,
} from "../../../microfrontends/order-status-summary/src/contract";
import {
    ORDER_STATUS_SUMMARY_TAG,
    ORDER_STATUS_SUMMARY_VERSION,
} from "../../../microfrontends/order-status-summary/src/contract";
import type { Order, Product } from "@/types/domain";
import styles from "./OrderStatusSummaryMicrofrontend.module.scss";

const LOCAL_MICROFRONTEND_URL = "/microfrontends/order-status-summary/index.js";

interface OrderStatusSummaryElement extends HTMLElement {
    summary: OrderStatusSummaryContract;
}

interface OrderStatusSummaryMicrofrontendProps {
    orders: Order[];
    products: Product[];
    isLoading: boolean;
    isError: boolean;
}

type LoadState = "loading" | "ready" | "error";

const scriptLoads = new Map<string, Promise<void>>();

export const getOrderStatusSummaryMicrofrontendUrl = (configuredUrl?: string) =>
    configuredUrl?.trim() || LOCAL_MICROFRONTEND_URL;

export const loadOrderStatusSummaryMicrofrontend = (url: string) => {
    if (customElements.get(ORDER_STATUS_SUMMARY_TAG)) {
        return Promise.resolve();
    }

    const currentLoad = scriptLoads.get(url);
    if (currentLoad) {
        return currentLoad;
    }

    const load = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.async = true;
        script.dataset.ordersHubMicrofrontend = ORDER_STATUS_SUMMARY_TAG;
        script.src = url;
        script.type = "module";
        script.onload = () => {
            if (customElements.get(ORDER_STATUS_SUMMARY_TAG)) {
                resolve();
                return;
            }

            scriptLoads.delete(url);
            reject(new Error("The Order Status Summary microfrontend was not registered."));
        };
        script.onerror = () => {
            script.remove();
            scriptLoads.delete(url);
            reject(new Error("The Order Status Summary microfrontend could not be loaded."));
        };
        document.head.append(script);
    });

    scriptLoads.set(url, load);
    return load;
};

interface OrderStatusSummaryMicrofrontendContentProps {
    state: LoadState;
    metrics?: OrderStatusSummaryMetrics;
    onRetry?: () => void;
    mountRef?: RefObject<HTMLDivElement | null>;
}

export function OrderStatusSummaryMicrofrontendContent({
    state,
    metrics,
    onRetry,
    mountRef,
}: OrderStatusSummaryMicrofrontendContentProps) {
    const { t } = useTranslation();

    return (
        <section
            className={styles.orderStatusSummaryMicrofrontend}
            aria-busy={state === "loading" || undefined}
            aria-labelledby="order-status-summary-title"
        >
            <header className={styles.orderStatusSummaryMicrofrontend__header}>
                <h2 id="order-status-summary-title">{t.microfrontend.title}</h2>
                <p>{t.microfrontend.description}</p>
            </header>
            {state === "loading" ? (
                <p className={styles.orderStatusSummaryMicrofrontend__message} role="status">
                    {t.microfrontend.loading}
                </p>
            ) : state === "error" ? (
                <div role="status">
                    <p className={styles.orderStatusSummaryMicrofrontend__message}>
                        {t.microfrontend.unavailable}
                    </p>
                    {onRetry && (
                        <button
                            type="button"
                            className={styles.orderStatusSummaryMicrofrontend__retry}
                            onClick={onRetry}
                        >
                            {t.actions.retry}
                        </button>
                    )}
                </div>
            ) : (
                <div
                    ref={mountRef}
                    className={styles.orderStatusSummaryMicrofrontend__mount}
                    aria-label={t.microfrontend.title}
                    data-orders={metrics?.totalOrders}
                    data-products={metrics?.totalProducts}
                />
            )}
        </section>
    );
}

export function OrderStatusSummaryMicrofrontend({
    orders,
    products,
    isLoading,
    isError,
}: OrderStatusSummaryMicrofrontendProps) {
    const { locale, t } = useTranslation();
    const mountRef = useRef<HTMLDivElement>(null);
    const [retryVersion, setRetryVersion] = useState(0);
    const [loadResult, setLoadResult] = useState<Exclude<LoadState, "loading"> | null>(null);
    const [completedLoadKey, setCompletedLoadKey] = useState<string | null>(null);
    const scriptUrl = getOrderStatusSummaryMicrofrontendUrl(
        process.env.NEXT_PUBLIC_ORDER_STATUS_SUMMARY_MFE_URL,
    );
    const metrics = useMemo(
        () => createOrderStatusSummaryMetrics({ orders, products }),
        [orders, products],
    );
    const contract = useMemo<OrderStatusSummaryContract>(
        () => ({
            version: ORDER_STATUS_SUMMARY_VERSION,
            locale,
            metrics,
            labels: {
                totalOrders: t.microfrontend.totalOrders,
                totalProducts: t.microfrontend.totalProducts,
                availableProducts: t.microfrontend.availableProducts,
            },
        }),
        [locale, metrics, t],
    );
    const loadKey = `${scriptUrl}:${retryVersion}`;
    const state: LoadState = isLoading
        ? "loading"
        : isError
          ? "error"
          : completedLoadKey === loadKey
            ? (loadResult ?? "error")
            : "loading";

    useEffect(() => {
        if (isLoading || isError) {
            return;
        }

        let isDisposed = false;
        void loadOrderStatusSummaryMicrofrontend(scriptUrl).then(
            () => {
                if (!isDisposed) {
                    setLoadResult("ready");
                    setCompletedLoadKey(loadKey);
                }
            },
            () => {
                if (!isDisposed) {
                    setLoadResult("error");
                    setCompletedLoadKey(loadKey);
                }
            },
        );

        return () => {
            isDisposed = true;
        };
    }, [isError, isLoading, loadKey, scriptUrl]);

    useEffect(() => {
        if (state !== "ready" || !mountRef.current) {
            return;
        }

        const element = document.createElement(
            ORDER_STATUS_SUMMARY_TAG,
        ) as OrderStatusSummaryElement;
        const handleError = () => setLoadResult("error");
        element.addEventListener("orders-hub-order-status-summary:error", handleError);
        mountRef.current.replaceChildren(element);
        element.summary = contract;

        return () => {
            element.removeEventListener("orders-hub-order-status-summary:error", handleError);
            element.remove();
        };
    }, [contract, state]);

    return (
        <OrderStatusSummaryMicrofrontendContent
            state={state}
            metrics={metrics}
            mountRef={mountRef}
            onRetry={() => setRetryVersion((current) => current + 1)}
        />
    );
}

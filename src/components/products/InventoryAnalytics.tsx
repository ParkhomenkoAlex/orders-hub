"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/i18n/I18nProvider";
import {
    createInventoryAnalyticsWorkerRequest,
    isCurrentInventoryAnalyticsResponse,
    type InventoryAnalytics,
    type InventoryAnalyticsWorkerResponse,
} from "@/lib/inventory-analytics";
import type { Order, Product } from "@/types/domain";
import styles from "./InventoryAnalytics.module.scss";

interface InventoryAnalyticsProps {
    orders: Order[];
    products: Product[];
    isLoading: boolean;
    isError: boolean;
}

type AnalyticsState =
    | { status: "loading" }
    | { status: "error" }
    | { status: "ready"; analytics: InventoryAnalytics };

interface InventoryAnalyticsContentProps {
    state: AnalyticsState;
}

export function InventoryAnalyticsContent({ state }: InventoryAnalyticsContentProps) {
    const { t } = useTranslation();

    return (
        <section
            className={styles.inventoryAnalytics}
            aria-busy={state.status === "loading" || undefined}
            aria-labelledby="inventory-analytics-title"
        >
            <h2 id="inventory-analytics-title">{t.analytics.title}</h2>
            <p className={styles.inventoryAnalytics__description}>{t.analytics.description}</p>
            {state.status === "loading" ? (
                <p className={styles.inventoryAnalytics__message} role="status">
                    {t.analytics.loading}
                </p>
            ) : state.status === "error" ? (
                <p className={styles.inventoryAnalytics__message} role="status">
                    {t.analytics.unavailable}
                </p>
            ) : (
                <>
                    <div className={styles.inventoryAnalytics__summary}>
                        <div className={styles.inventoryAnalytics__metric}>
                            <span>{t.analytics.totalOrders}</span>
                            <strong>{state.analytics.totalOrders}</strong>
                        </div>
                        <div className={styles.inventoryAnalytics__metric}>
                            <span>{t.analytics.totalProducts}</span>
                            <strong>{state.analytics.totalProducts}</strong>
                        </div>
                    </div>
                    <div className={styles.inventoryAnalytics__statusList}>
                        <h3>{t.analytics.productsByStatus}</h3>
                        <ul>
                            {Object.entries(state.analytics.productsByStatus).map(
                                ([status, count]) => (
                                    <li key={status}>
                                        <span>
                                            {
                                                t.productStatuses[
                                                    status as keyof typeof t.productStatuses
                                                ]
                                            }
                                            :
                                        </span>
                                        <strong>{count}</strong>
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>
                </>
            )}
        </section>
    );
}

export function InventoryAnalytics({
    orders,
    products,
    isLoading,
    isError,
}: InventoryAnalyticsProps) {
    const workerRef = useRef<Worker | null>(null);
    const latestRequestIdRef = useRef(0);
    const [state, setState] = useState<AnalyticsState>({ status: "loading" });

    useEffect(() => {
        let isDisposed = false;
        let worker: Worker | null = null;

        try {
            worker = new Worker(
                new URL("../../workers/inventory-analytics.worker.ts", import.meta.url),
            );

            workerRef.current = worker;
            worker.onmessage = (event: MessageEvent<InventoryAnalyticsWorkerResponse>) => {
                if (
                    isDisposed ||
                    !isCurrentInventoryAnalyticsResponse(event.data, latestRequestIdRef.current)
                ) {
                    return;
                }

                setState(
                    event.data.type === "result"
                        ? { status: "ready", analytics: event.data.analytics }
                        : { status: "error" },
                );
            };
            worker.onerror = () => {
                if (isDisposed) {
                    return;
                }

                setState({ status: "error" });
            };
        } catch {
            queueMicrotask(() => {
                if (!isDisposed) {
                    setState({ status: "error" });
                }
            });
        }

        return () => {
            isDisposed = true;
            worker?.terminate();
            workerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (isError || !workerRef.current) {
            return;
        }

        const requestId = latestRequestIdRef.current + 1;
        latestRequestIdRef.current = requestId;
        workerRef.current.postMessage(
            createInventoryAnalyticsWorkerRequest(requestId, {
                orders: orders.map(({ id }) => ({ id })),
                products: products.map(({ id, type, status }) => ({ id, type, status })),
            }),
        );
    }, [isError, isLoading, orders, products]);

    return <InventoryAnalyticsContent state={isError ? { status: "error" } : state} />;
}

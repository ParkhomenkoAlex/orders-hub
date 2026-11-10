"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/i18n/I18nProvider";
import { formatCurrency } from "@/lib/formatters";
import {
    calculateInventoryValue,
    getProductUsdCents,
    type InventoryValueSource,
} from "@/lib/wasm-inventory-value";
import type { Product } from "@/types/domain";
import styles from "./WasmInventoryValue.module.scss";

interface WasmInventoryValueProps {
    products: Product[];
    isLoading: boolean;
    isError: boolean;
}

type ValueState =
    | { status: "loading" }
    | { status: "empty" }
    | { status: "error" }
    | { status: "ready"; cents: number; source: InventoryValueSource };

interface WasmInventoryValueContentProps {
    state: ValueState;
}

export function WasmInventoryValueContent({ state }: WasmInventoryValueContentProps) {
    const { locale, t } = useTranslation();

    return (
        <section
            className={styles.wasmInventoryValue}
            aria-busy={state.status === "loading" || undefined}
            aria-labelledby="wasm-inventory-value-title"
        >
            <h2 id="wasm-inventory-value-title">{t.wasm.title}</h2>
            <p className={styles.wasmInventoryValue__description}>{t.wasm.description}</p>
            {state.status === "loading" ? (
                <p className={styles.wasmInventoryValue__message} role="status">
                    {t.wasm.loading}
                </p>
            ) : state.status === "empty" ? (
                <p className={styles.wasmInventoryValue__message}>{t.wasm.empty}</p>
            ) : state.status === "error" ? (
                <p className={styles.wasmInventoryValue__message} role="status">
                    {t.wasm.unavailable}
                </p>
            ) : (
                <div aria-live="polite">
                    <strong className={styles.wasmInventoryValue__amount}>
                        {formatCurrency(state.cents / 100, "USD", locale)}
                    </strong>
                    <p
                        className={`${styles.wasmInventoryValue__source} ${
                            state.source === "wasm"
                                ? styles["wasmInventoryValue__source--wasm"]
                                : styles["wasmInventoryValue__source--fallback"]
                        }`}
                    >
                        {state.source === "wasm" ? t.wasm.calculated : t.wasm.fallback}
                    </p>
                </div>
            )}
        </section>
    );
}

export function WasmInventoryValue({ products, isLoading, isError }: WasmInventoryValueProps) {
    const cents = useMemo(() => getProductUsdCents(products), [products]);
    const inputKey = cents.join(",");
    const [result, setResult] = useState<
        { inputKey: string; cents: number; source: InventoryValueSource } | undefined
    >();
    const state: ValueState = isLoading
        ? { status: "loading" }
        : isError
          ? { status: "error" }
          : !cents.length
            ? { status: "empty" }
            : result?.inputKey === inputKey
              ? { status: "ready", cents: result.cents, source: result.source }
              : { status: "loading" };

    useEffect(() => {
        if (isLoading || isError || !cents.length) {
            return;
        }

        let isDisposed = false;
        void calculateInventoryValue(cents).then((nextResult) => {
            if (!isDisposed) {
                setResult({ inputKey, ...nextResult });
            }
        });

        return () => {
            isDisposed = true;
        };
    }, [cents, inputKey, isError, isLoading]);

    return <WasmInventoryValueContent state={state} />;
}

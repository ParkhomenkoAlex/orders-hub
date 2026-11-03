"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "@/i18n/I18nProvider";
import { getProductTypeBarHeight, getProductTypeCounts } from "@/lib/product-analytics";
import type { CSSProperties } from "react";
import type { Product, ProductType } from "@/types/domain";
import styles from "./ProductTypeChart.module.scss";

interface ProductTypeChartProps {
    products: Product[];
    activeType: ProductType | "all";
    isLoading: boolean;
    isError: boolean;
    onTypeSelect: (type: ProductType | "all") => void;
}

type ChartStyle = CSSProperties & { "--product-chart-height": string };

export function ProductTypeChart({
    products,
    activeType,
    isLoading,
    isError,
    onTypeSelect,
}: ProductTypeChartProps) {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <section className={styles.chart} aria-busy="true" aria-label={t.charts.loading}>
                <p className="visually-hidden" role="status">
                    {t.charts.loading}
                </p>
                <h2>{t.charts.productTypeTitle}</h2>
                <div className={styles.bars} aria-hidden="true">
                    {Array.from({ length: 4 }, (_, index) => (
                        <div key={index} className={`${styles.bar} ${styles.skeletonBar}`}>
                            <Skeleton className={styles.valueSkeleton} />
                            <Skeleton className={styles.columnSkeleton} />
                            <Skeleton className={styles.labelSkeleton} />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className={styles.chart} aria-labelledby="product-type-chart-title">
                <h2 id="product-type-chart-title">{t.charts.productTypeTitle}</h2>
                <p className={styles.message} role="status">
                    {t.charts.unavailable}
                </p>
            </section>
        );
    }

    const typeCounts = getProductTypeCounts(products);
    const maxCount = Math.max(...typeCounts.map(({ count }) => count));

    if (maxCount === 0) {
        return (
            <section className={styles.chart} aria-labelledby="product-type-chart-title">
                <h2 id="product-type-chart-title">{t.charts.productTypeTitle}</h2>
                <p className={styles.message}>{t.charts.empty}</p>
            </section>
        );
    }

    return (
        <section className={styles.chart} aria-labelledby="product-type-chart-title">
            <div className={styles.header}>
                <div>
                    <h2 id="product-type-chart-title">{t.charts.productTypeTitle}</h2>
                    <p>{t.charts.productTypeDescription}</p>
                </div>
                {activeType !== "all" && (
                    <p className={styles.selection} role="status">
                        {t.charts.selected.replace("{type}", t.productTypes[activeType])}
                    </p>
                )}
            </div>
            <div className={styles.bars} role="list">
                {typeCounts.map(({ type, count }) => {
                    const height = getProductTypeBarHeight(count, maxCount);
                    const label = t.productTypes[type];
                    const isSelected = activeType === type;

                    return (
                        <div key={type} role="listitem">
                            <button
                                type="button"
                                className={`${styles.bar} ${isSelected ? styles.selectedBar : ""}`}
                                aria-pressed={isSelected}
                                aria-label={t.charts.barLabel
                                    .replace("{type}", label)
                                    .replace("{count}", String(count))}
                                onClick={() => onTypeSelect(isSelected ? "all" : type)}
                            >
                                <strong>{count}</strong>
                                <span className={styles.column} aria-hidden="true">
                                    {count > 0 && (
                                        <span
                                            className={styles.fill}
                                            style={
                                                {
                                                    "--product-chart-height": `${height}%`,
                                                } as ChartStyle
                                            }
                                        />
                                    )}
                                </span>
                                <span>{label}</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

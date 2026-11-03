"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "@/i18n/I18nProvider";
import styles from "./Products.module.scss";

const SKELETON_ROWS = 5;

export function ProductsTableSkeleton() {
    const { t } = useTranslation();

    return (
        <div
            className={`${styles.productsTable} table-responsive`}
            aria-busy="true"
            aria-label={t.loading.products}
        >
            <p className="visually-hidden" role="status">
                {t.loading.products}
            </p>
            <table className="mb-0" aria-hidden="true">
                <colgroup>
                    <col className={styles["productsTable__col--product"]} />
                    <col className={styles["productsTable__col--status"]} />
                    <col className={styles["productsTable__col--warranty"]} />
                    <col className={styles["productsTable__col--condition"]} />
                    <col className={styles["productsTable__col--price"]} />
                    <col className={styles["productsTable__col--group"]} />
                    <col className={styles["productsTable__col--owner"]} />
                    <col className={styles["productsTable__col--order"]} />
                    <col className={styles["productsTable__col--orderDate"]} />
                    <col className={styles["productsTable__col--actions"]} />
                </colgroup>
                <thead>
                    <tr>
                        <th scope="col">{t.products.product}</th>
                        <th scope="col">{t.products.status}</th>
                        <th scope="col">{t.products.warranty}</th>
                        <th scope="col">{t.products.condition}</th>
                        <th scope="col">{t.products.price}</th>
                        <th scope="col">{t.products.group}</th>
                        <th scope="col">{t.products.owner}</th>
                        <th scope="col">{t.products.order}</th>
                        <th scope="col">{t.products.orderDate}</th>
                        <th scope="col">
                            <span className="visually-hidden">{t.products.actions}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                        <tr key={index} className={styles.productsTable__skeletonRow}>
                            <td>
                                <div className={styles.productRow__identity}>
                                    <Skeleton className={styles.productRow__skeletonMark} />
                                    <div>
                                        <Skeleton className={styles.productRow__skeletonTitle} />
                                        <Skeleton className={styles.productRow__skeletonSerial} />
                                    </div>
                                </div>
                            </td>
                            <td>
                                <Skeleton className={styles.productRow__skeletonStatus} />
                            </td>
                            <td>
                                <Skeleton className={styles.productRow__skeletonWarranty} />
                            </td>
                            <td>
                                <Skeleton className={styles.productRow__skeletonCondition} />
                            </td>
                            <td>
                                <Skeleton className={styles.productRow__skeletonPrice} />
                            </td>
                            <td>
                                <Skeleton className={styles.productRow__skeletonGroup} />
                            </td>
                            <td>
                                <Skeleton className={styles.productRow__skeletonOwner} />
                            </td>
                            <td>
                                <Skeleton className={styles.productRow__skeletonOrder} />
                            </td>
                            <td>
                                <Skeleton className={styles.productRow__skeletonDate} />
                            </td>
                            <td className={styles.productRow__action}>
                                <Skeleton className={styles.productRow__skeletonDelete} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

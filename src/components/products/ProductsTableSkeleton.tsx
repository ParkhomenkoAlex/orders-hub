import { Skeleton } from "@/components/ui/Skeleton";

const SKELETON_ROWS = 5;

export function ProductsTableSkeleton() {
    return (
        <div
            className="products-table table-responsive"
            aria-busy="true"
            aria-label="Loading products"
        >
            <p className="visually-hidden" role="status">
                Loading products
            </p>
            <table className="mb-0" aria-hidden="true">
                <colgroup>
                    <col className="products-table__col--product" />
                    <col className="products-table__col--status" />
                    <col className="products-table__col--warranty" />
                    <col className="products-table__col--condition" />
                    <col className="products-table__col--price" />
                    <col className="products-table__col--group" />
                    <col className="products-table__col--owner" />
                    <col className="products-table__col--order" />
                    <col className="products-table__col--order-date" />
                    <col className="products-table__col--actions" />
                </colgroup>
                <thead>
                    <tr>
                        <th scope="col">Product</th>
                        <th scope="col">Status</th>
                        <th scope="col">Warranty</th>
                        <th scope="col">Condition</th>
                        <th scope="col">Price</th>
                        <th scope="col">Group</th>
                        <th scope="col">Owner</th>
                        <th scope="col">Order</th>
                        <th scope="col">Order date</th>
                        <th scope="col">
                            <span className="visually-hidden">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                        <tr key={index} className="products-table__skeleton-row">
                            <td>
                                <div className="product-row__identity">
                                    <Skeleton className="skeleton--product-mark" />
                                    <div>
                                        <Skeleton className="skeleton--product-title" />
                                        <Skeleton className="skeleton--product-serial" />
                                    </div>
                                </div>
                            </td>
                            <td>
                                <Skeleton className="skeleton--product-status" />
                            </td>
                            <td>
                                <Skeleton className="skeleton--product-warranty" />
                            </td>
                            <td>
                                <Skeleton className="skeleton--product-condition" />
                            </td>
                            <td>
                                <Skeleton className="skeleton--product-price" />
                            </td>
                            <td>
                                <Skeleton className="skeleton--product-group" />
                            </td>
                            <td>
                                <Skeleton className="skeleton--product-owner" />
                            </td>
                            <td>
                                <Skeleton className="skeleton--product-order" />
                            </td>
                            <td>
                                <Skeleton className="skeleton--product-date" />
                            </td>
                            <td className="product-row__action">
                                <Skeleton className="skeleton--product-delete" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

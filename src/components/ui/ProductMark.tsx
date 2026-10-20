import type { ProductStatus } from "@/types/domain";

interface ProductMarkProps {
    status: ProductStatus;
}

export function ProductMark({ status }: ProductMarkProps) {
    return (
        <span className="product-mark" aria-label={`${status} product`}>
            <span
                className={`product-mark__dot product-mark__dot--${status.toLowerCase().replace(" ", "-")}`}
            />
            <span className="product-mark__screen" aria-hidden="true">
                <span />
            </span>
        </span>
    );
}

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return <span className={`skeleton ${className}`} aria-hidden="true" />;
}

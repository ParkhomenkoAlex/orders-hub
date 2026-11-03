interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return <span className={`${styles.skeleton} ${className}`} aria-hidden="true" />;
}
import styles from "./Skeleton.module.scss";

"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./PageTransition.module.scss";

interface PageTransitionProps {
    children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();

    return (
        <div key={pathname} className={styles.pageTransition}>
            {children}
        </div>
    );
}

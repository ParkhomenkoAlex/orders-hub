import type { ReactNode } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopMenu } from "@/components/layout/TopMenu";
import { StoreProvider } from "@/state/StoreProvider";
import styles from "./DashboardLayout.module.scss";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <StoreProvider>
            <div className={`${styles.appShell} container-fluid p-0`}>
                <TopMenu />
                <Sidebar />
                <main className={styles.appShell__content}>
                    <PageTransition>{children}</PageTransition>
                </main>
            </div>
        </StoreProvider>
    );
}

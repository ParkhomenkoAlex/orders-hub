import type { ReactNode } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopMenu } from "@/components/layout/TopMenu";
import { StoreProvider } from "@/state/StoreProvider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <StoreProvider>
            <div className="app-shell container-fluid p-0">
                <TopMenu />
                <Sidebar />
                <main className="app-shell__content">
                    <PageTransition>{children}</PageTransition>
                </main>
            </div>
        </StoreProvider>
    );
}

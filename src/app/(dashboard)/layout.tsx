import type { ReactNode } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopMenu } from "@/components/layout/TopMenu";
import { OrdersDataProvider } from "@/state/OrdersDataProvider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <OrdersDataProvider>
            <div className="app-shell container-fluid p-0">
                <TopMenu />
                <Sidebar />
                <main className="app-shell__content">
                    <PageTransition>{children}</PageTransition>
                </main>
            </div>
        </OrdersDataProvider>
    );
}

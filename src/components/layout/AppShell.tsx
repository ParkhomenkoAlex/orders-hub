import type { ReactNode } from "react";
import { PageTransition } from "./PageTransition";
import { Sidebar } from "./Sidebar";
import { TopMenu } from "./TopMenu";

export function AppShell({ children }: { children: ReactNode }) {
    return (
        <div className="app-shell container-fluid p-0">
            <TopMenu />
            <Sidebar />
            <main className="app-shell__content">
                <PageTransition>{children}</PageTransition>
            </main>
        </div>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
    { href: "/orders", label: "Orders" },
    { href: "/products", label: "Products" },
];

export function Sidebar() {
    const pathname = usePathname();
    return (
        <aside className="sidebar">
            <div className="sidebar__profile">
                <div className="sidebar__avatar" aria-label="User profile">
                    AP
                </div>
            </div>
            <nav className="sidebar__nav d-flex" aria-label="Primary navigation">
                {navigation.map((item) => (
                    <Link
                        key={item.href}
                        className={`sidebar__link ${pathname === item.href ? "sidebar__link--active" : ""}`}
                        href={item.href}
                        aria-current={pathname === item.href ? "page" : undefined}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Building2,
    Settings,
    ShieldAlert,
    CreditCard,
    LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

interface SidebarProps {
    className?: string;
    mobile?: boolean;
}

export function AdminSidebar({ className, mobile }: SidebarProps) {
    const pathname = usePathname();
    const { signOut } = useAuth();

    const routes = [
        {
            label: "Overview",
            icon: LayoutDashboard,
            href: "/dashboard/admin",
            color: "text-sky-500",
        },
        {
            label: "Restaurants",
            icon: Building2,
            href: "/dashboard/admin/restaurants",
            color: "text-violet-500",
        },
        {
            label: "Clients",
            icon: Users,
            href: "/dashboard/admin/clients",
            color: "text-pink-700",
        },
        {
            label: "Subscriptions",
            icon: CreditCard,
            href: "/dashboard/admin/billing",
            color: "text-orange-700",
        },
        {
            label: "System Health",
            icon: ShieldAlert,
            href: "/dashboard/admin/health",
            color: "text-emerald-500",
        },
        {
            label: "Global Settings",
            icon: Settings,
            href: "/dashboard/admin/settings",
        },
        {
            label: "Owner Dashboard",
            icon: ShieldAlert,
            href: "/dashboard/owner",
            color: "text-amber-500",
        },
    ];

    return (
        <div className={cn(
            "space-y-4 py-4 flex flex-col h-full bg-[#0a0a0a] border-r border-[#2a2a2a] text-white",
            !mobile && "fixed left-0 top-0 bottom-0 w-72 z-50 shadow-2xl shadow-primary/5",
            className
        )}>
            <div className="px-6 py-2">
                <Link href="/dashboard/admin" className="flex items-center pl-2 mb-14">
                    <div className="relative w-8 h-8 mr-4 bg-gradient-to-tr from-primary to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <ShieldAlert className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            GOD MODE
                        </h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Super Admin</p>
                    </div>
                </Link>
            </div>
            <div className="px-3 py-2 flex-1">
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/5 rounded-lg transition-all duration-300 border border-transparent",
                                pathname === route.href ? "bg-white/10 text-white border-primary/20 shadow-sm" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                            {pathname === route.href && (
                                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary" />
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-4 mt-auto border-t border-white/5 mx-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-500/10 group"
                    onClick={signOut}
                >
                    <LogOut className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                    Logout
                </Button>
            </div>
        </div>
    );
}

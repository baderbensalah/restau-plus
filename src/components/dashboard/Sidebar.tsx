
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, UtensilsCrossed, ClipboardList, Settings, ChefHat, LogOut, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";

const sidebarItems = [
    { name: "Overview", href: "/dashboard/owner", icon: LayoutDashboard },
    { name: "Orders", href: "/dashboard/owner/orders", icon: ClipboardList },
    { name: "Menu Management", href: "/dashboard/owner/menu", icon: UtensilsCrossed },
    { name: "Settings", href: "/dashboard/owner/settings", icon: Settings },
];

export function Sidebar({ className, mobile }: { className?: string; mobile?: boolean }) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!user) return;
        const checkAdmin = async () => {
            if (['admin@restauplus.com', 'admin212123@restauplus.com'].includes(user.email || '')) {
                setIsAdmin(true);
                return;
            }
            const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (data?.role === 'admin') setIsAdmin(true);
        };
        checkAdmin();
    }, [user, supabase]);

    if (pathname?.startsWith('/dashboard/admin')) return null;

    // Berry Theme Colors -> Smooth Neutral Update
    // Sidebar bg: Zinc-900
    // Active Item: Teal accents (maintained)

    return (
        <div className={cn(
            "h-full flex flex-col transition-all duration-300",
            mobile ? "bg-zinc-900" : "hidden md:flex fixed left-0 top-0 md:w-64 lg:w-72 bg-zinc-900 border-r border-white/5 text-white",
            className
        )}>
            {/* Logo Section */}
            <div className="flex h-20 items-center px-6 shrink-0">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                        <ChefHat className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight text-white group-hover:text-teal-400 transition-colors">
                            RESTAU+
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex flex-col gap-6 p-4 flex-1 overflow-y-auto custom-scrollbar">

                {/* Dashboard Section */}
                <div className="flex flex-col gap-1">
                    <h3 className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                        Dashboard
                    </h3>
                    {sidebarItems.slice(0, 1).map((item) => { // Overview only
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className="relative group/link">
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute left-0 top-1 bottom-1 w-1 rounded-r-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                                    />
                                )}
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-4 h-12 rounded-r-xl rounded-l-none pl-6 transition-all duration-300",
                                        isActive
                                            ? "bg-zinc-800/80 text-teal-400 font-bold"
                                            : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5 font-medium"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-colors",
                                        isActive ? "text-teal-400" : "text-zinc-500 group-hover/link:text-zinc-100"
                                    )} />
                                    <span className="text-sm tracking-tight">{item.name}</span>
                                </Button>
                            </Link>
                        )
                    })}
                </div>

                {/* Management Section */}
                <div className="flex flex-col gap-1">
                    <h3 className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 mt-4">
                        Management
                    </h3>
                    {sidebarItems.slice(1).map((item) => { // Rest of items
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className="relative group/link">
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute left-0 top-1 bottom-1 w-1 rounded-r-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                                    />
                                )}
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-4 h-12 rounded-r-xl rounded-l-none pl-6 transition-all duration-300",
                                        isActive
                                            ? "bg-zinc-800/80 text-teal-400 font-bold"
                                            : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5 font-medium"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-colors",
                                        isActive ? "text-teal-400" : "text-zinc-500 group-hover/link:text-zinc-100"
                                    )} />
                                    <span className="text-sm tracking-tight">{item.name}</span>
                                </Button>
                            </Link>
                        )
                    })}
                </div>

                {/* Admin Section (Conditional) */}
                {isAdmin && (
                    <div className="flex flex-col gap-1 mt-2 pt-4 border-t border-zinc-800">
                        <h3 className="px-4 text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Shield className="w-3 h-3" />
                            Admin
                        </h3>
                        <Link href="/dashboard/admin">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 h-11 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                            >
                                <LayoutDashboard className="h-[18px] w-[18px]" />
                                <span className="text-sm font-medium">Admin Console</span>
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Footer / Logout */}
            <div className="mt-auto p-4 border-t border-slate-800">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    onClick={signOut}
                >
                    <LogOut className="h-[18px] w-[18px]" />
                    <span className="text-sm font-medium">Logout</span>
                </Button>
            </div>
        </div>
    );
}

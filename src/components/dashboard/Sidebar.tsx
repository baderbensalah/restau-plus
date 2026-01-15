
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    const { signOut } = useAuth();

    // Fix: Do not render Owner Sidebar on Admin pages (prevents hydration errors & double sidebars)
    if (pathname?.startsWith('/dashboard/admin')) return null;

    return (
        <div className={cn(
            "h-full flex flex-col transition-all duration-300",
            mobile ? "bg-background" : "hidden md:flex fixed left-0 top-0 md:w-64 lg:w-72 border-r border-border/40 bg-card/30 backdrop-blur-xl",
            className
        )}>
            <div className="flex h-16 items-center px-6 border-b border-border/40 shrink-0">
                <Link href="/" className="flex items-center space-x-2 group">
                    <motion.div
                        initial={{ rotate: -10, scale: 0.9 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                    >
                        <ChefHat className="h-6 w-6 text-primary" />
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter bg-gradient-to-br from-primary via-white to-primary/50 bg-clip-text text-transparent italic leading-tight">
                            RESTAU+
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/60 -mt-1">
                            Enterprise
                        </span>
                    </div>
                </Link>
            </div>
            <div className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-1 py-2">
                    <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Restaurant
                    </h3>
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className="relative group">
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-primary/10 rounded-lg"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-3 h-11 relative z-10 transition-all duration-200",
                                        isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                                    {item.name}
                                </Button>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_2px_rgba(var(--primary),0.5)]" />
                                )}
                            </Link>
                        )
                    })}
                </div>

                <div className="mt-auto pt-4 border-t border-border/40 space-y-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-500 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-950/20"
                        onClick={signOut}
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
}

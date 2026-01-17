"use client";

import { InviteUserModal } from "@/components/dashboard/InviteUserModal";
import { Zap, ServerCrash, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AdminHeaderActions() {
    const { signOut } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut();
            toast.success("Logged out successfully");
            router.push("/login");
        } catch (error) {
            toast.error("Failed to logout");
        }
    };

    return (
        <div className="flex items-center gap-3">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="bg-white text-black hover:bg-zinc-200 border-0 font-bold shadow-lg shadow-white/10 transition-all hover:scale-105 active:scale-95">
                        <Zap className="w-4 h-4 mr-2" />
                        Quick Actions
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-white/10 text-white z-50">
                    <DropdownMenuLabel>System Shortcuts</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-white/10">
                        <ServerCrash className="w-4 h-4 text-emerald-400" />
                        System Status
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-white/10">
                        <CreditCard className="w-4 h-4 text-purple-400" />
                        Billing Overview
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/10" />

                    <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10">
                        <LogOut className="w-4 h-4" />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <InviteUserModal />
        </div>
    );
}

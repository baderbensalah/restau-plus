"use client";

import { CheckCircle2, XCircle, MoreHorizontal, Mail, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAdminActions } from "@/lib/hooks/use-admin-actions";
import { EditUserModal } from "./EditUserModal";
import { useState } from "react";

export function AdminActions({ profile }: { profile: any }) {
    const { updateAccessStatus } = useAdminActions();
    const [showEditModal, setShowEditModal] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-white/10 text-muted-foreground hover:text-white transition-all rounded-lg">
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-white/10 text-white shadow-2xl">
                    <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-4 py-3">Management</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />

                    <DropdownMenuItem
                        onClick={() => setShowEditModal(true)}
                        className="gap-3 py-3 px-4 focus:bg-white/5 cursor-pointer group"
                    >
                        <UserCog className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <div className="flex flex-col">
                            <span className="font-semibold">Edit Profile</span>
                            <span className="text-[10px] text-muted-foreground">Role, Restaurant, Info</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/5" />

                    <DropdownMenuItem
                        onClick={() => updateAccessStatus(profile.id, "approved")}
                        className="gap-3 py-3 px-4 focus:bg-emerald-500/10 cursor-pointer group"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <div className="flex flex-col">
                            <span className="font-semibold">Approve Access</span>
                            <span className="text-[10px] text-muted-foreground">Grant platform access</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => updateAccessStatus(profile.id, "rejected")}
                        className="gap-3 py-3 px-4 focus:bg-rose-500/10 cursor-pointer group"
                    >
                        <XCircle className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-rose-400">Reject / Revoke</span>
                            <span className="text-[10px] text-muted-foreground">Block platform access</span>
                        </div>
                    </DropdownMenuItem>

                </DropdownMenuContent>
            </DropdownMenu>

            <EditUserModal
                user={profile}
                open={showEditModal}
                onOpenChange={setShowEditModal}
            />
        </>
    );
}

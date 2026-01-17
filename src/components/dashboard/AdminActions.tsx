"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    UserCog,
    Store,
    Ban,
    CheckCircle2,
    XCircle,
    Loader2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleRestaurantStatus } from "@/app/actions/admin-restaurants";
import { updateUserStatus } from "@/app/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EditUserModal } from "./EditUserModal";
import { ViewDetailsModal } from "./ViewDetailsModal";

interface AdminActionsProps {
    profile: {
        id: string;
        full_name: string;
        email: string;
        role: string;
        status: string;
        restaurant_id?: string;
        restaurant_name?: string;
        restaurant_slug?: string;
        restaurant_is_active?: boolean;
        date?: string;
    };
}

export function AdminActions({ profile }: AdminActionsProps) {
    const [loading, setLoading] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const router = useRouter();

    const handleStatusUpdate = async (newStatus: 'active' | 'rejected') => {
        setLoading(true);
        try {
            await updateUserStatus(profile.id, newStatus);
            toast.success(`User marked as ${newStatus}`);
            router.refresh();
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    const handleRestaurantToggle = async () => {
        if (!profile.restaurant_id) return;
        setLoading(true);
        try {
            const newStatus = !profile.restaurant_is_active;
            await toggleRestaurantStatus(profile.restaurant_id, newStatus);
            toast.success(`Restaurant ${newStatus ? 'activated' : 'suspended'}`);
            router.refresh();
        } catch (error) {
            toast.error("Failed to toggle restaurant");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <EditUserModal
                user={profile}
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
            />
            <ViewDetailsModal
                user={profile}
                open={viewModalOpen}
                onOpenChange={setViewModalOpen}
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-white/10 hover:text-white transition-colors"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <MoreHorizontal className="h-4 w-4" />
                        )}
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-white/10 text-white z-50">
                    <DropdownMenuLabel className="text-zinc-500 text-xs uppercase tracking-wider">User Actions</DropdownMenuLabel>

                    <DropdownMenuItem onClick={() => setViewModalOpen(true)} className="gap-2 cursor-pointer focus:bg-white/10">
                        <UserCog className="w-4 h-4 text-zinc-400" />
                        View Details
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setEditModalOpen(true)} className="gap-2 cursor-pointer focus:bg-white/10">
                        <UserCog className="w-4 h-4 text-blue-400" />
                        Edit Profile
                    </DropdownMenuItem>

                    {profile.restaurant_id && (
                        <>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuLabel className="text-zinc-500 text-xs uppercase tracking-wider">Restaurant</DropdownMenuLabel>
                            <DropdownMenuItem onClick={handleRestaurantToggle} className="gap-2 cursor-pointer focus:bg-white/10">
                                {profile.restaurant_is_active ? (
                                    <>
                                        <Ban className="w-4 h-4 text-red-400" />
                                        <span className="text-red-400">Suspend Store</span>
                                    </>
                                ) : (
                                    <>
                                        <Store className="w-4 h-4 text-green-400" />
                                        <span className="text-green-400">Activate Store</span>
                                    </>
                                )}
                            </DropdownMenuItem>
                        </>
                    )}

                    <DropdownMenuSeparator className="bg-white/10" />

                    {profile.status !== 'active' && (
                        <DropdownMenuItem onClick={() => handleStatusUpdate('active')} className="gap-2 cursor-pointer focus:bg-white/10">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            Approve Access
                        </DropdownMenuItem>
                    )}

                    {profile.status !== 'rejected' && (
                        <DropdownMenuItem onClick={() => handleStatusUpdate('rejected')} className="gap-2 cursor-pointer focus:bg-white/10">
                            <XCircle className="w-4 h-4 text-red-400" />
                            Revoke Access
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

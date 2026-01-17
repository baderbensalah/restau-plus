"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    Power,
    ExternalLink,
    Trash2,
    AlertTriangle,
    Edit3,
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
import { toast } from "sonner";
import { toggleRestaurantStatus } from "@/app/actions/admin-restaurants";
import { useRouter } from "next/navigation";

interface RestaurantActionsProps {
    restaurant: any;
}

export function RestaurantActions({ restaurant }: RestaurantActionsProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleToggleStatus = async () => {
        setLoading(true);
        try {
            await toggleRestaurantStatus(restaurant.id, restaurant.is_active);
            toast.success(restaurant.is_active ? "Restaurant suspended" : "Restaurant activated");
            // Optimistic update happens via revalidatePath on server, but router.refresh ensures UI sync
            router.refresh();
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        toast.error("Delete is disabled for safety reasons.");
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 text-muted-foreground hover:text-white">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-300 shadow-2xl">
                <DropdownMenuLabel className="text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Actions
                </DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => window.open(`/${restaurant.slug}`, '_blank')}
                    className="hover:bg-zinc-900 hover:text-white cursor-pointer"
                >
                    <ExternalLink className="mr-2 h-4 w-4 text-sky-500" />
                    Visit Store
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="hover:bg-zinc-900 hover:text-white cursor-pointer"
                >
                    <Edit3 className="mr-2 h-4 w-4 text-blue-500" />
                    Edit Details
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-zinc-800" />

                <DropdownMenuItem
                    onClick={handleToggleStatus}
                    disabled={loading}
                    className="hover:bg-zinc-900 cursor-pointer"
                >
                    {restaurant.is_active ? (
                        <>
                            <Power className="mr-2 h-4 w-4 text-amber-500" />
                            <span className="text-amber-500 group-hover:text-amber-400">Suspend Store</span>
                        </>
                    ) : (
                        <>
                            <Power className="mr-2 h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-500 group-hover:text-emerald-400">Activate Store</span>
                        </>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                    className="hover:bg-red-950/20 text-red-500 hover:text-red-400 cursor-pointer"
                    onClick={handleDelete}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Permanently
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

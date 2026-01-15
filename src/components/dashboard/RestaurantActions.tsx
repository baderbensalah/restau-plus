"use client";

import { MoreHorizontal, Trash2, Edit3, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export function RestaurantActions({ restaurantId, slug }: { restaurantId: string; slug: string }) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this restaurant? This will remove all associated data, including menus and orders.")) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from("restaurants")
                .delete()
                .eq("id", restaurantId);

            if (error) throw error;
            toast.success("Restaurant deleted successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete restaurant");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10 text-muted-foreground hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-white/10 text-white shadow-2xl">
                <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-4 py-3">Restaurant Options</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />

                <DropdownMenuItem
                    onClick={() => window.open(`/${slug}`, '_blank')}
                    className="gap-3 py-3 px-4 focus:bg-white/5 cursor-pointer group"
                >
                    <ExternalLink className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                    <span>View Public Menu</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="gap-3 py-3 px-4 focus:bg-white/5 cursor-pointer">
                    <Edit3 className="w-4 h-4 text-blue-400" />
                    <span>Edit Details</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/5" />

                <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={loading}
                    className="gap-3 py-3 px-4 focus:bg-rose-500/10 cursor-pointer group text-rose-400"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    <span>Delete Entity</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

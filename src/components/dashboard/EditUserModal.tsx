"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UserCog, Loader2, Save } from "lucide-react";
import { useAdminActions } from "@/lib/hooks/use-admin-actions";

interface EditUserModalProps {
    user: {
        id: string;
        email: string;
        full_name: string | null;
        role: string;
        status: string;
        restaurant_id: string | null;
    };
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditUserModal({ user, open, onOpenChange }: EditUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState(user.full_name || "");
    const [role, setRole] = useState(user.role);
    const [status, setStatus] = useState(user.status);
    const [restaurantId, setRestaurantId] = useState<string>(user.restaurant_id || "none");
    const [restaurants, setRestaurants] = useState<any[]>([]);

    const { updateProfile } = useAdminActions();
    const supabase = createClient();

    useEffect(() => {
        if (open) {
            fetchRestaurants();
        }
    }, [open]);

    async function fetchRestaurants() {
        const { data } = await supabase.from("restaurants").select("id, name").order("name");
        if (data) setRestaurants(data);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const updates = {
            full_name: fullName,
            role,
            status,
            restaurant_id: restaurantId === "none" ? null : restaurantId
        };

        const result = await updateProfile(user.id, updates);

        if (result.success) {
            onOpenChange(false);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                        <UserCog className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold">Edit User Profile</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Modify permissions, roles, and restaurant access for {user.email}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-fullName" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                            Full Name
                        </Label>
                        <Input
                            id="edit-fullName"
                            placeholder="John Doe"
                            className="bg-white/5 border-white/10 text-white h-11 focus:border-primary/50"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                                Role
                            </Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:border-primary/50">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="owner">Owner</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                                Access Status
                            </Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:border-primary/50">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                            Associated Restaurant
                        </Label>
                        <Select value={restaurantId} onValueChange={setRestaurantId}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:border-primary/50 flex items-center gap-2">
                                <SelectValue placeholder="Select restaurant" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white max-h-[200px]">
                                <SelectItem value="none">No Restaurant Linked</SelectItem>
                                {restaurants.map((res) => (
                                    <SelectItem key={res.id} value={res.id}>
                                        {res.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="pt-6">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-muted-foreground hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-white min-w-[140px] shadow-lg shadow-primary/20"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

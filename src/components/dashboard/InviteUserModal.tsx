"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Users, Mail, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function InviteUserModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("owner");
    const [restaurantId, setRestaurantId] = useState<string>("");
    const [restaurants, setRestaurants] = useState<any[]>([]);

    const supabase = createClient();
    const router = useRouter();

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

        try {
            // Note: In a real app, this would use supabase.auth.admin.inviteUserByEmail
            // For now, we'll create a profile and assume the user will sign up with this email
            // or we could use an API route if we had the service role key.

            const { error } = await supabase
                .from("profiles")
                .insert([{
                    email,
                    full_name: fullName,
                    role,
                    restaurant_id: restaurantId || null,
                    status: 'approved' // Admin-created users are pre-approved
                }]);

            if (error) {
                if (error.code === '23505') {
                    throw new Error("A user with this email already exists.");
                }
                throw error;
            }

            toast.success("User invited/created successfully");
            setOpen(false);
            resetForm();
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to invite user");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEmail("");
        setFullName("");
        setRole("owner");
        setRestaurantId("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                    <Users className="w-4 h-4 mr-2" />
                    Invite User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                        <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold">Invite User</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Invite a new restaurant owner or platform administrator.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            className="bg-white/5 border-white/10 text-white h-11 focus:border-primary/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                            Full Name
                        </Label>
                        <Input
                            id="fullName"
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
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                                Restaurant
                            </Label>
                            <Select value={restaurantId} onValueChange={setRestaurantId}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:border-primary/50">
                                    <SelectValue placeholder="Select restaurant" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="none">None (Platform Admin)</SelectItem>
                                    {restaurants.map((res) => (
                                        <SelectItem key={res.id} value={res.id}>
                                            {res.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="pt-6">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-muted-foreground hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invitation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

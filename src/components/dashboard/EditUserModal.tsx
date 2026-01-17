"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUserProfile } from "@/app/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, UserCog } from "lucide-react";

interface EditUserModalProps {
    user: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditUserModal({ user, open, onOpenChange }: EditUserModalProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [formData, setFormData] = useState({
        full_name: user?.full_name || "",
        role: user?.role || "user",
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateUserProfile(user.id, formData);
            toast.success("Profile updated successfully");
            onOpenChange(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-purple-500" />
                        Edit User Profile
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Make changes to the user's details and permissions.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right text-zinc-400">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="col-span-3 bg-zinc-900 border-zinc-800 focus:border-purple-500/50"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right text-zinc-400">
                            Role
                        </Label>
                        <Select
                            value={formData.role}
                            onValueChange={(val) => setFormData({ ...formData, role: val })}
                        >
                            <SelectTrigger className="col-span-3 bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white hover:bg-white/10">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

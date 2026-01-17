"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateUserStatus, updateUserProfile } from "@/app/actions/admin";

export function useAdminActions() {
    const router = useRouter();

    const updateAccessStatus = async (profileId: string, newStatus: "approved" | "rejected" | "pending" | "active") => {
        try {
            // Map "approved" to "active" if necessary, or keep as is depending on DB enum/check
            // The DB seems to accept 'active', 'pending', 'rejected'. 
            // The UI passes 'approved', let's normalize.
            const status = newStatus === 'approved' ? 'active' : newStatus;

            await updateUserStatus(profileId, status as any); // Use Server Action
            toast.success(`User status updated to ${status}`);
            router.refresh();
        } catch (error: any) {
            console.error("Error updating status:", error);
            toast.error(error.message || "Failed to update status");
        }
    };

    const updateProfile = async (profileId: string, updates: any) => {
        try {
            await updateUserProfile(profileId, updates); // Use Server Action
            toast.success("Profile updated successfully");
            router.refresh();
            return { success: true };
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Failed to update profile");
            return { success: false, error };
        }
    };

    return {
        updateAccessStatus,
        updateProfile,
    };
}

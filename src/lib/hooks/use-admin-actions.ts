"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAdminActions() {
    const supabase = createClient();
    const router = useRouter();

    const updateAccessStatus = async (profileId: string, newStatus: "approved" | "rejected" | "pending") => {
        return updateProfile(profileId, { status: newStatus });
    };

    const updateProfile = async (profileId: string, updates: any) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", profileId);

            if (error) throw error;

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

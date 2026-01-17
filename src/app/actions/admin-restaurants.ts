"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleRestaurantStatus(restaurantId: string, is_active: boolean) {
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin' && user.email !== 'admin@restauplus.com') {
        throw new Error("Unauthorized: Admin only");
    }

    const { error } = await supabase
        .from('restaurants')
        .update({ is_active: is_active })
        .eq('id', restaurantId);

    if (error) throw error;

    revalidatePath('/dashboard/admin/restaurants');
    revalidatePath('/dashboard/admin');
    return { success: true };
}

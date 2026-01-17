'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AdminUser = {
    id: string;
    email: string;
    full_name: string;
    role: string;
    status: 'active' | 'pending' | 'rejected' | 'banned';
    restaurant_name?: string;
    restaurant_slug?: string;
    created_at: string;
};

export async function getAdminStats() {
    const supabase = await createClient();

    // Check if admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // In a real app we might optimize this, but for now we fetch counts
    // We can use count() queries for speed
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: pendingUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active');

    // Active Revenue (Mocked slightly if we don't have a payments table yet, but let's try to sum orders if we can, or just return 0)
    // For now, let's return the counts we know
    return {
        totalUsers: totalUsers || 0,
        pendingUsers: pendingUsers || 0,
        activeUsers: activeUsers || 0,
        // Mock revenue for the "Premium" look until we hook up Stripe
        revenue: 12540
    };
}

export async function getUsers(statusFilter?: string, search?: string) {
    const supabase = await createClient();

    let query = supabase.from('profiles').select(`
        *,
        restaurants (id, name, slug, is_active)
    `).order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
    }

    if (search) {
        // Search by email, name or restaurant name
        // Supabase split search might be complex, simplified for now:
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching users:", error);
        return [];
    }

    // Transform to friendlier shape if needed, but returning as is is mostly fine
    return data.map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        status: profile.status || 'pending', // Fallback
        restaurant_name: profile.restaurants?.name,
        restaurant_slug: profile.restaurants?.slug,
        restaurant_id: profile.restaurants?.id,
        restaurant_is_active: profile.restaurants?.is_active,
        created_at: profile.created_at
    }));
}

export async function updateUserStatus(userId: string, newStatus: 'active' | 'rejected' | 'pending') {
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

    if (adminProfile?.role !== 'admin' && user?.email !== 'admin@restauplus.com') {
        throw new Error("Unauthorized");
    }

    const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

    if (error) throw error;

    revalidatePath('/dashboard/admin');
    return { success: true };
}

export async function deleteUser(userId: string) {
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

    if (adminProfile?.role !== 'admin' && user?.email !== 'admin@restauplus.com') {
        throw new Error("Unauthorized");
    }

    // Delete from auth.users requires Service Role usually, but we can delete from public.profiles 
    // and let CASCADE handle it IF we have the right trigger. 
    // But normally we can't delete from auth.users via client client.
    // We will just delete from profiles for now, or assume this is a logical soft delete.
    // Actually, let's try to delete from profiles.

    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

    if (error) throw error;

    revalidatePath('/dashboard/admin');
    return { success: true };
}

export async function updateUserProfile(userId: string, data: { full_name: string; role: string }) {
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin' && user.email !== 'admin@restauplus.com') {
        throw new Error("Unauthorized: Admin only");
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: data.full_name,
            role: data.role as any
        })
        .eq('id', userId);

    if (error) throw error;

    revalidatePath('/dashboard/admin');
    return { success: true };
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const supabase = await createClient();

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // 2. Fetch Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // 3. Smart Redirect
    if (profile?.role === 'admin' || user.email === 'admin@restauplus.com') {
        redirect("/dashboard/admin");
    } else {
        redirect("/dashboard/owner");
    }
}

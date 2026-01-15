
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', (
            await supabase.from('profiles').select('restaurant_id').eq('id', user.id).single()
        ).data?.restaurant_id)
        .single();

    if (!restaurant) return <div>Restaurant not found</div>;

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your restaurant preferences and branding.</p>
            </div>

            <SettingsClient restaurant={restaurant} />
        </div>
    );
}

import { createClient } from "@/lib/supabase/server";
import { OrderBoard } from "./components/OrderBoard";
import { CheckCircle2 } from "lucide-react";

export default async function OrdersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Get Restaurant ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user?.id)
        .single();

    if (!profile?.restaurant_id) return <div>No Restaurant Found</div>;

    // 2. Fetch Active Orders
    const { data: orders } = await supabase
        .from('orders')
        .select(`
            *,
            tables ( number ),
            order_items (
                *,
                menu_items ( name )
            )
        `)
        .eq('restaurant_id', profile.restaurant_id)
        .neq('status', 'paid') // Show everything active
        .neq('status', 'cancelled')
        .order('created_at', { ascending: true });

    return (
        <div className="space-y-6 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Kitchen View</h2>
                    <p className="text-sm text-slate-400">Manage real-time orders and preparation status.</p>
                </div>
                <div className="flex items-center gap-2 bg-[#1e293b] border border-[#2e3b52] px-4 py-2 rounded-xl text-sm font-medium text-teal-400 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    <span>Live Updates Active</span>
                </div>
            </div>

            <OrderBoard initialOrders={orders || []} restaurantId={profile.restaurant_id} />
        </div>
    );
}

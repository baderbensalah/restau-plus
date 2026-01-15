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
        <div className="p-8 space-y-8 h-full flex flex-col bg-gradient-to-br from-background via-[#050505] to-background">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-primary/10 pb-6 whitespace-nowrap">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-3 w-3 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Real-time Operations</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white italic drop-shadow-2xl">
                        KITCHEN <span className="text-primary glow-text">COMMAND</span>
                    </h1>
                </div>
                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                    <p className="text-xs font-black text-muted-foreground uppercase mb-1">Live Status</p>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                        System Online <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </p>
                </div>
            </div>

            <OrderBoard initialOrders={orders || []} restaurantId={profile.restaurant_id} />
        </div>
    );
}

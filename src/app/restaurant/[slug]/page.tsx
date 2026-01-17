import { createClient } from "@/lib/supabase/server";
import { RestaurantApp } from "./RestaurantApp";
import { notFound } from "next/navigation";

export default async function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    // 1. Fetch Restaurant
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!restaurant) return notFound();

    // 1.5 Check Status
    if (!restaurant.is_active) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h1 className="text-2xl font-bold">Restaurant Unavailable</h1>
                    <p className="text-neutral-400 max-w-md mx-auto">
                        This restaurant's page is currently not publicly active.
                        Please check back later.
                    </p>
                </div>
            </div>
        );
    }

    // 2. Fetch Menu Items (Grouped by Category can be done in client or here, raw list is fine)
    const { data: menuItems } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_available', true);

    // 3. Fetch Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('sort_order', { ascending: true });

    return (
        <RestaurantApp
            restaurant={restaurant}
            menuItems={menuItems || []}
            categories={categories || []}
        />
    );
}

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

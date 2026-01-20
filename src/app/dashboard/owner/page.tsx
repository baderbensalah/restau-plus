
import { createClient } from "@/lib/supabase/server";
import { DashboardUI } from "./DashboardUI";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

import { OnboardingUI } from "./OnboardingUI";
import { PendingApprovalUI } from "@/components/dashboard/PendingApprovalUI";

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // Fetch Restaurant Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id, role, full_name, status')
        .eq('id', user.id)
        .single();

    // 1. Check for Missing Restaurant (Onboarding first)
    if (!profile?.restaurant_id) {
        return <OnboardingUI
            userEmail={user.email || ""}
            userName={profile?.full_name || user.user_metadata?.full_name || ""}
        />;
    }

    // 2. Check for Pending Approval (Gatekeeping after onboarding)
    if (profile?.status !== 'active' && profile?.status !== 'approved') {
        return <PendingApprovalUI />;
    }

    if (profile.role !== 'owner' && profile.role !== 'manager') {
        return <div className="p-8 text-center text-red-500">Unauthorized Access: Owners/Managers only.</div>;
    }

    const restaurantId = profile.restaurant_id;

    // Parallel Data Fetching
    const [
        { count: activeOrdersCount },
        { count: activeTablesCount },
        { count: totalOrdersToday }
    ] = await Promise.all([
        supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', restaurantId)
            .neq('status', 'served')
            .neq('status', 'cancelled')
            .neq('status', 'paid'), // Assuming these are "active"

        supabase
            .from('tables')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', restaurantId)
            .eq('status', 'occupied'),

        supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', restaurantId)
            .gte('created_at', new Date().toISOString().split('T')[0]), // Today
    ]);

    // 3. Calculate Daily Revenue (Today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: todayRevenueOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'paid')
        .gte('created_at', today.toISOString());

    const dailyRevenue = todayRevenueOrders?.reduce((acc, order) => acc + (Number(order.total_amount) || 0), 0) || 0;

    // 3b. Calculate Total Revenue (All Time)
    const { data: allTimeRevenueOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'paid');

    const totalRevenue = allTimeRevenueOrders?.reduce((acc, order) => acc + (Number(order.total_amount) || 0), 0) || 0;

    // 4. Fetch Weekly Orders for Revenue Chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: weeklyOrders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'paid')
        .gte('created_at', sevenDaysAgo.toISOString());

    // 4. Group Revenue by Day
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartDataMap = new Map();

    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = days[date.getDay()];
        chartDataMap.set(dayName, 0);
    }

    weeklyOrders?.forEach(order => {
        const dayName = days[new Date(order.created_at).getDay()];
        if (chartDataMap.has(dayName)) {
            chartDataMap.set(dayName, chartDataMap.get(dayName) + (Number(order.total_amount) || 0));
        }
    });

    const chartData = Array.from(chartDataMap).map(([name, total]) => ({ name, total }));

    // 6. Calculate Top Selling Items with actual prices
    const { data: topSellingData } = await supabase
        .from('order_items')
        .select('quantity, menu_items(name, price)')
        .eq('restaurant_id', restaurantId);

    const itemCounts: Record<string, { count: number, price: number }> = {};
    (topSellingData as any[])?.forEach(item => {
        const menuItem = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items;
        const name = menuItem?.name || 'Unknown';
        const price = Number(menuItem?.price) || 0;

        if (!itemCounts[name]) {
            itemCounts[name] = { count: 0, price };
        }
        itemCounts[name].count += item.quantity;
    });

    const topSelling = Object.entries(itemCounts)
        .map(([name, data]) => ({
            name,
            count: data.count,
            revenue: data.count * data.price
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

    // 7. Calculate Weekly Total Growth (Sum of chart data)
    const weeklyTotalRevenue = chartData.reduce((acc, day) => acc + day.total, 0);

    // 8. Fetch Recent Activity (Latest 5 Orders)
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('customer_name, table_number, created_at, status')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(5);

    // Fetch Restaurant Details (Currency)
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('currency')
        .eq('id', restaurantId)
        .single();

    const currencyCode = restaurant?.currency || 'USD';
    const currencySymbol = currencyCode === 'QAR' ? 'QR' : currencyCode === 'MAD' ? 'DH' : '$';

    const stats = {
        currency: currencySymbol,
        totalRevenue,   // All time
        dailyRevenue,   // Today Only
        weeklyTotalRevenue,
        activeOrders: activeOrdersCount || 0,
        activeTables: activeTablesCount || 0,
        totalOrdersToday: totalOrdersToday || 0,
        chartData,
        topSelling,
        recentActivity: recentOrders?.map(order => ({
            title: `New order from ${order.customer_name || 'Guest'}`,
            subtitle: `Table ${order.table_number || 'Express'} • ${order.status}`,
            time: new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })) || []
    };

    return <DashboardUI stats={stats} />;
}

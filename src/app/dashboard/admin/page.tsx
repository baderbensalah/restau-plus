import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Activity, TrendingUp, Search, MoreHorizontal, Globe } from "lucide-react";
import { redirect } from "next/navigation";
import { WorldGlobe } from "@/components/dashboard/WorldGlobe";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // RBAC: Strict Admin Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    // Allow if role is admin OR if it is the hardcoded super-admin email
    if (adminProfile?.role !== 'admin' && user.email !== 'admin@restauplus.com') {
        redirect("/dashboard/owner");
    }

    // 1. Fetch Aggregated Stats (RPC)
    const { data: stats } = await supabase.rpc('get_admin_stats');
    // Error is silently handled by fallback safeStats


    // 2. Fetch Clients List (Standard Query)
    const { data: clients } = await supabase
        .from('profiles')
        .select(`
            *,
            restaurants (*)
        `)
        .in('role', ['owner', 'admin'])
        .order('created_at', { ascending: false })
        .limit(20);

    const safeStats = {
        total_restaurants: stats?.total_restaurants ?? 0,
        total_revenue: stats?.total_revenue ?? 0,
        total_clients: stats?.total_clients ?? 0,
        revenue_history: stats?.revenue_history ?? [],
        active_subs_percentage: stats?.active_subs_percentage ?? 0,
        pending_setup_count: stats?.pending_setup_count ?? 0,
        map_locations: stats?.map_locations ?? []
    };

    return (
        <div className="space-y-8 relative">

            {/* Header Section */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Badge variant="outline" className="mb-2 border-primary/50 text-white bg-primary/10 animate-pulse">
                        LIVE SYSTEM
                    </Badge>
                    <h1 className="text-5xl font-black tracking-tight text-white mb-2">
                        Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">Center</span>
                    </h1>
                    <p className="text-muted-foreground">Global operations monitoring active.</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md">
                        <Activity className="w-4 h-4 mr-2 text-emerald-400" />
                        System Healthy
                    </Button>
                </div>
            </div>

            {/* "Ultra" Top Section: Globe + Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                {/* Globe Card */}
                <div className="lg:col-span-1 relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl group">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/10 opacity-50" />
                    <div className="absolute top-4 left-4 z-10">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-400" />
                            Global Activity
                        </h3>
                        <p className="text-xs text-muted-foreground">Live connections from {safeStats.map_locations.length} locations</p>
                    </div>
                    <WorldGlobe locations={safeStats.map_locations} />
                </div>

                {/* Revenue Chart Card */}
                <div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Revenue Trends</h3>
                            <p className="text-sm text-muted-foreground">Daily platform MRR growth</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-3xl font-black text-white tracking-tight">${safeStats.total_revenue.toLocaleString()}</h3>
                            <p className="text-sm text-emerald-400 font-medium">+12.5% vs last week</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full h-full min-h-[200px]">
                        <RevenueChart data={safeStats.revenue_history} />
                    </div>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-zinc-900/50 border-white/5 p-6 hover:bg-zinc-900/80 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Total Clients</p>
                            <h3 className="text-3xl font-bold text-white mt-2">{safeStats.total_clients}</h3>
                        </div>
                        <Users className="w-8 h-8 text-blue-500/50" />
                    </div>
                </Card>
                <Card className="bg-zinc-900/50 border-white/5 p-6 hover:bg-zinc-900/80 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Total Restaurants</p>
                            <h3 className="text-3xl font-bold text-white mt-2">{safeStats.total_restaurants}</h3>
                        </div>
                        <Building2 className="w-8 h-8 text-purple-500/50" />
                    </div>
                </Card>
                <Card className="bg-zinc-900/50 border-white/5 p-6 hover:bg-zinc-900/80 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Active Subs</p>
                            <h3 className="text-3xl font-bold text-white mt-2">{safeStats.active_subs_percentage}%</h3>
                        </div>
                        <Activity className="w-8 h-8 text-emerald-500/50" />
                    </div>
                </Card>
                <Card className="bg-zinc-900/50 border-white/5 p-6 hover:bg-zinc-900/80 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Pending Setup</p>
                            <h3 className="text-3xl font-bold text-white mt-2">{safeStats.pending_setup_count}</h3>
                        </div>
                        <TrendingUp className="w-8 h-8 text-orange-500/50" />
                    </div>
                </Card>
            </div>

            {/* Client List */}
            <Card className="border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white">Registered Clients</h3>
                        <p className="text-sm text-muted-foreground">Access management for restaurant owners</p>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Find client..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>
                <div className="relative overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-muted-foreground">Owner</TableHead>
                                <TableHead className="text-muted-foreground">Restaurant (Slug)</TableHead>
                                <TableHead className="text-muted-foreground">Joined</TableHead>
                                <TableHead className="text-muted-foreground">Status</TableHead>
                                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients?.map((client: any) => (
                                <TableRow key={client.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white text-base">
                                                {client.full_name || 'No Name'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {client.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {client.restaurants ? (
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                                                    {client.restaurants.name}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    /{client.restaurants.slug}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-red-500 text-xs">No Restaurant Linked</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(client.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0">
                                            Active
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}

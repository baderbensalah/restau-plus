import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminUserList } from "@/components/dashboard/AdminUserList";
import { InviteUserModal } from "@/components/dashboard/InviteUserModal";
import { Badge } from "@/components/ui/badge";
import { Users, Store, Activity, ShieldCheck, Mail, Zap, ServerCrash, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminHeaderActions } from "@/components/dashboard/AdminHeaderActions";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // 1. Auth & Admin Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const SUPER_ADMINS = ['admin@restauplus.com', 'admin212123@restauplus.com', 'bensalahbader.business@gmail.com'];

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    // Allow access if role is admin OR if it's one of the hardcoded super admins
    if (adminProfile?.role !== 'admin' && !SUPER_ADMINS.includes(user.email || '')) {
        redirect("/dashboard/owner");
    }

    // 2. Data Fetching
    const { data: profiles } = await supabase
        .from('profiles')
        .select(`
            id, full_name, email, role, status, created_at,
            restaurant:restaurants(id, name, slug, is_active)
        `)
        .order('created_at', { ascending: false });

    // 3. Stats Calculation
    const totalUsers = profiles?.length || 0;
    const activeUsers = profiles?.filter(p => p.status === 'active' || p.status === 'approved').length || 0;
    const pendingUsers = profiles?.filter(p => p.status === 'pending').length || 0;
    const totalRestaurants = profiles?.filter(p => Array.isArray(p.restaurant) && p.restaurant.length > 0).length || 0;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10 space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="relative">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6 z-10 border-b border-white/10 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/5 px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold">
                                v2.1 Pro
                            </Badge>
                            <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Systems Online
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                            Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Center</span>
                        </h1>
                        <p className="text-zinc-400 font-light max-w-lg text-lg">
                            Manage users, monitor restaurant activity, and oversee platform health.
                        </p>
                    </div>

                    <AdminHeaderActions />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 flex items-center gap-5 hover:border-blue-500/30 transition-colors group">
                    <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                        <Users className="w-7 h-7 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-0.5">Total Users</p>
                        <p className="text-3xl font-black text-white">{totalUsers}</p>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 flex items-center gap-5 hover:border-emerald-500/30 transition-colors group">
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-0.5">Active Accounts</p>
                        <p className="text-3xl font-black text-white">{activeUsers}</p>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 flex items-center gap-5 hover:border-purple-500/30 transition-colors group">
                    <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                        <Store className="w-7 h-7 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-0.5">Restaurants</p>
                        <p className="text-3xl font-black text-white">{totalRestaurants}</p>
                    </div>
                </div>

                <div className={`bg-zinc-900/50 border rounded-2xl p-6 flex items-center gap-5 transition-colors group ${pendingUsers > 0 ? 'border-orange-500/50 shadow-lg shadow-orange-500/10' : 'border-white/10'}`}>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform ${pendingUsers > 0 ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                        <Activity className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-0.5">Pending Review</p>
                        <p className={`text-3xl font-black ${pendingUsers > 0 ? 'text-orange-400' : 'text-zinc-500'}`}>{pendingUsers}</p>
                    </div>
                </div>
            </div>

            {/* Users List (Client Component with Search) */}
            <AdminUserList initialProfiles={profiles || []} />

        </div>
    );
}

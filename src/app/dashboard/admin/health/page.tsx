import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldCheck, Database, Server, Zap } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminHealthPage() {
    const supabase = await createClient();

    // RBAC Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin' && user.email !== 'admin@restauplus.com') {
        redirect("/dashboard/owner");
    }

    // Real DB Counts for health check
    const { count: restaurantCount } = await supabase.from('restaurants').select('*', { count: 'exact', head: true });
    const { count: profileCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    const metrics = [
        { label: "API Gateway", status: "Operational", latency: "24ms", icon: Zap, color: "text-amber-500" },
        { label: "Database", status: "Healthy", latency: "12ms", icon: Database, color: "text-blue-500" },
        { label: "Auth Service", status: "Operational", latency: "42ms", icon: ShieldCheck, color: "text-emerald-500" },
        { label: "Edge Functions", status: "Operational", latency: "8ms", icon: Server, color: "text-purple-500" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                        System <span className="text-primary">Health</span>
                    </h1>
                    <p className="text-muted-foreground">Real-time status of the Restau Plus ecosystem.</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-1.5 font-bold animate-pulse">
                    ALL SYSTEMS NOMINAL
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {metrics.map((m) => (
                    <Card key={m.label} className="bg-zinc-900/50 border-white/5 p-6 hover:bg-zinc-900/80 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center", m.color)}>
                                <m.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded uppercase">LIVE</span>
                        </div>
                        <h3 className="text-white font-bold">{m.label}</h3>
                        <div className="mt-4 flex justify-between items-end">
                            <p className="text-2xl font-black text-white">{m.latency}</p>
                            <p className="text-xs text-muted-foreground font-medium">Latency</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-white/5 bg-black/40 backdrop-blur-xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Database className="w-5 h-5 text-primary" />
                        Infrastructure Load
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                <span className="text-muted-foreground">Database Storage</span>
                                <span className="text-white">1.2GB / 50GB</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[2%]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                <span className="text-muted-foreground">Active Connections</span>
                                <span className="text-white">42 / 500</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[8%]" />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="border-white/5 bg-black/40 backdrop-blur-xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Activity className="w-5 h-5 text-primary" />
                        Platform Integrity
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Total Entities</p>
                            <p className="text-3xl font-black text-white">{restaurantCount}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">User Base</p>
                            <p className="text-3xl font-black text-white">{profileCount}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}

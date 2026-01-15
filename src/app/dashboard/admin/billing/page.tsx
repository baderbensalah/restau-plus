import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, Users, DollarSign } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminBillingPage() {
    const supabase = await createClient();

    // RBAC Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin' && user.email !== 'admin@restauplus.com') {
        redirect("/dashboard/owner");
    }

    // Fetch Subscriptions with Plan & Restaurant info
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select(`
            *,
            restaurant:restaurants(name)
        `)
        .order('created_at', { ascending: false });

    const totalRevenue = subscriptions?.reduce((acc, sub) => acc + (sub.status === 'active' ? 29 : 0), 0) || 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                        Financial <span className="text-primary">Overview</span>
                    </h1>
                    <p className="text-muted-foreground">Monitor platform revenue and subscription statuses.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-zinc-900/50 border-white/5 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Estimated MRR</p>
                            <h3 className="text-4xl font-black text-white mt-2">${totalRevenue}</h3>
                        </div>
                        <TrendingUp className="w-8 h-8 text-emerald-500/50" />
                    </div>
                </Card>
                <Card className="bg-zinc-900/50 border-white/5 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Active Subs</p>
                            <h3 className="text-4xl font-black text-white mt-2">
                                {subscriptions?.filter(s => s.status === 'active').length || 0}
                            </h3>
                        </div>
                        <CreditCard className="w-8 h-8 text-blue-500/50" />
                    </div>
                </Card>
                <Card className="bg-zinc-900/50 border-white/5 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Avg. Ticket</p>
                            <h3 className="text-4xl font-black text-white mt-2">$29.00</h3>
                        </div>
                        <DollarSign className="w-8 h-8 text-purple-500/50" />
                    </div>
                </Card>
            </div>

            <Card className="border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-xl font-bold text-white">Platform Subscriptions</h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-muted-foreground">Restaurant</TableHead>
                            <TableHead className="text-muted-foreground">Status</TableHead>
                            <TableHead className="text-muted-foreground">Plan</TableHead>
                            <TableHead className="text-muted-foreground">Started</TableHead>
                            <TableHead className="text-muted-foreground text-right">Revenue</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptions?.map((sub: any) => (
                            <TableRow key={sub.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell className="font-medium text-white">
                                    {sub.restaurant?.name || 'Unknown'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(
                                        "px-2 py-0.5 font-bold text-[10px]",
                                        sub.status === 'active' ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-zinc-500/30 text-zinc-400 bg-zinc-500/10"
                                    )}>
                                        {sub.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground font-mono text-xs">
                                    PREMIUM_MONTHLY
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(sub.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right text-white font-bold">
                                    ${sub.status === 'active' ? '29.00' : '0.00'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}

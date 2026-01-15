import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Search, Mail, Shield, CheckCircle2, XCircle, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { AdminActions } from "@/components/dashboard/AdminActions";

import { InviteUserModal } from "@/components/dashboard/InviteUserModal";

export default async function AdminClientsPage() {
    const supabase = await createClient();

    // RBAC Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    // Allow if role is admin OR if it is the hardcoded super-admin email
    if (adminProfile?.role !== 'admin' && user.email !== 'admin@restauplus.com') {
        redirect("/dashboard/owner");
    }

    // Fetch Clients (Owners & Admins)
    const { data: clients } = await supabase
        .from('profiles')
        .select(`
            *,
            restaurants (*)
        `)
        .in('role', ['owner', 'admin'])
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                        Platform <span className="text-primary">Clients</span>
                    </h1>
                    <p className="text-muted-foreground">Manage {clients?.length || 0} registered user accounts.</p>
                </div>
                <InviteUserModal />
            </div>

            <Card className="border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between gap-4 bg-white/[0.02]">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or role..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>
                <Table>
                    <TableHeader className="bg-white/[0.01]">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">User Profile</TableHead>
                            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Role</TableHead>
                            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Access Status</TableHead>
                            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Restaurant</TableHead>
                            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Joined</TableHead>
                            <TableHead className="text-muted-foreground text-right font-bold uppercase text-[10px] tracking-widest px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients?.map((client: any) => (
                            <TableRow key={client.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black border border-primary/20 group-hover:scale-105 transition-transform">
                                                {(client.full_name?.[0] || client.email[0]).toUpperCase()}
                                            </div>
                                            {client.status === 'approved' && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center">
                                                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-white group-hover:text-primary transition-colors">{client.full_name || 'Unknown'}</span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                                <Mail className="w-3 h-3 text-muted-foreground/50" />
                                                {client.email}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {client.role === 'admin' ? (
                                        <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 gap-1 px-3 py-1 font-bold">
                                            <Shield className="w-3 h-3" /> ADMIN
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 px-3 py-1 font-bold">
                                            OWNER
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {client.status === 'approved' ? (
                                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 gap-1.5 px-3 py-1 font-bold">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                                        </Badge>
                                    ) : client.status === 'rejected' ? (
                                        <Badge variant="outline" className="border-rose-500/30 text-rose-400 bg-rose-500/10 gap-1.5 px-3 py-1 font-bold">
                                            <XCircle className="w-3.5 h-3.5" /> REJECTED
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 gap-1.5 px-3 py-1 font-bold animate-pulse">
                                            <Clock className="w-3.5 h-3.5" /> PENDING
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {client.restaurants ? (
                                        <div className="flex flex-col group/res">
                                            <span className="text-sm font-semibold text-white group-hover/res:text-primary transition-colors">{client.restaurants.name}</span>
                                            <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">{client.restaurants.slug}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-black tracking-widest text-muted-foreground italic bg-white/5 px-2 py-0.5 rounded">NO LINK</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground font-medium text-sm">
                                    {new Date(client.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    <AdminActions profile={client} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

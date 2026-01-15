import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MoreHorizontal, Search, MapPin, ExternalLink } from "lucide-react";
import { redirect } from "next/navigation";

import { AddRestaurantModal } from "@/components/dashboard/AddRestaurantModal";
import { RestaurantActions } from "@/components/dashboard/RestaurantActions";

export default async function AdminRestaurantsPage() {
    const supabase = await createClient();

    // RBAC Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    // Allow if role is admin OR if it is the hardcoded super-admin email
    if (adminProfile?.role !== 'admin' && user.email !== 'admin@restauplus.com') {
        redirect("/dashboard/owner");
    }

    // Fetch Restaurants with Owner Info
    const { data: restaurants } = await supabase
        .from('restaurants')
        .select(`
            *,
            profiles:profiles(email, full_name, role)
        `)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                        Global <span className="text-primary">Restaurants</span>
                    </h1>
                    <p className="text-muted-foreground">Manage all {restaurants?.length || 0} restaurant entities.</p>
                </div>
                <AddRestaurantModal />
            </div>

            <Card className="border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="p-6 border-b border-white/5 flex justify-between gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name, slug, or city..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-muted-foreground">Restaurant</TableHead>
                            <TableHead className="text-muted-foreground">Location</TableHead>
                            <TableHead className="text-muted-foreground">Owner</TableHead>
                            <TableHead className="text-muted-foreground">Status</TableHead>
                            <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {restaurants?.map((rest: any) => {
                            const owner = rest.profiles?.find((p: any) => p.role === 'owner');
                            return (
                                <TableRow key={rest.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-lg font-bold text-white">
                                                {rest.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white">{rest.name}</span>
                                                <span className="text-xs text-muted-foreground font-mono">/{rest.slug}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {rest.latitude ? (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <MapPin className="w-3 h-3 text-primary" />
                                                {rest.latitude.toFixed(2)}, {rest.longitude.toFixed(2)}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-zinc-600">No Coordinates</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {owner ? (
                                            <div className="flex flex-col">
                                                <span className="text-sm text-white">{owner.full_name || 'Owner'}</span>
                                                <span className="text-xs text-muted-foreground">{owner.email}</span>
                                            </div>
                                        ) : (
                                            <Badge variant="outline" className="border-yellow-500/20 text-yellow-500 text-[10px]">Unclaimed</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0">
                                            Live
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <RestaurantActions restaurantId={rest.id} slug={rest.slug} />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

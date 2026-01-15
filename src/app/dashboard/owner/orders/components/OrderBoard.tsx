
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, ChefHat, BellRing, UtensilsCrossed, User, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served';

interface Order {
    id: string;
    table_id: string | null;
    status: OrderStatus;
    created_at: string;
    customer_name?: string | null;
    table_number?: string | null;
    tables: { number: string } | null;
    order_items: {
        id: string;
        quantity: number;
        menu_items: { name: string } | null;
        notes?: string;
    }[];
}

export function OrderBoard({ initialOrders, restaurantId }: { initialOrders: any[], restaurantId: string }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const supabase = createClient();

    const columns: { status: OrderStatus; label: string; icon: any; color: string; glow: string }[] = [
        { status: 'pending', label: 'New Orders', icon: BellRing, color: 'text-blue-500', glow: 'shadow-blue-500/20' },
        { status: 'preparing', label: 'Preparing', icon: ChefHat, color: 'text-orange-500', glow: 'shadow-orange-500/20' },
        { status: 'ready', label: 'Ready to Serve', icon: CheckCircle2, color: 'text-green-500', glow: 'shadow-green-500/20' },
    ];

    useEffect(() => {
        const channel = supabase
            .channel('realtime orders')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${restaurantId}`
                },
                async (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const { data: newOrder } = await supabase
                            .from('orders')
                            .select(`*, tables(number), order_items(*, menu_items(name))`)
                            .eq('id', payload.new.id)
                            .single();

                        if (newOrder) {
                            setOrders(prev => [newOrder, ...prev]);
                            const tableInfo = newOrder.table_number || (newOrder.tables?.number ? `Table ${newOrder.tables.number}` : "Express");

                            // Play notification sound
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                            audio.play().catch(e => console.log("Audio play blocked:", e));

                            toast.success("New Order Received!", {
                                description: `${tableInfo} - ${newOrder.customer_name || 'Guest'}`,
                                className: "glass-card border-primary/50"
                            });
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, restaurantId]);

    const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
        // Optimistic UI
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (error) {
            toast.error("Failed to update status");
            // Revert on error?
        } else {
            toast.success(`Order moved to ${newStatus}`, {
                className: "glass-card"
            });
        }
    };

    return (
        <div className="flex-1 h-full overflow-hidden flex flex-col p-4">
            <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-8 h-full min-w-[1100px] px-2">
                    {columns.map(col => (
                        <div key={col.status} className="flex-1 min-w-[340px] flex flex-col gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "flex items-center gap-4 p-5 rounded-2xl glass-card sticky top-0 z-10",
                                    "border-white/10 shadow-xl",
                                    col.glow
                                )}
                            >
                                <div className={cn("p-3 rounded-xl bg-background/50 backdrop-blur-md shadow-inner", col.color)}>
                                    <col.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl tracking-tight text-white italic">{col.label}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Live Stream</p>
                                </div>
                                <div className="ml-auto">
                                    <Badge variant="secondary" className="text-lg font-black px-3 bg-white/5 border-white/10 text-white rounded-lg">
                                        {orders.filter(o => o.status === col.status).length}
                                    </Badge>
                                </div>
                            </motion.div>

                            <div className="space-y-6 px-1 pb-10 overflow-y-auto custom-scrollbar h-[calc(100vh-280px)]">
                                <AnimatePresence mode="popLayout">
                                    {orders
                                        .filter(o => o.status === col.status)
                                        .map(order => (
                                            <OrderCard key={order.id} order={order} onUpdate={updateStatus} />
                                        ))}
                                </AnimatePresence>
                                {orders.filter(o => o.status === col.status).length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.3 }}
                                        className="flex flex-col items-center justify-center py-20 text-muted-foreground italic"
                                    >
                                        <div className="p-6 rounded-full bg-white/5 mb-4">
                                            <UtensilsCrossed className="w-12 h-12" />
                                        </div>
                                        <p className="font-black tracking-tighter text-xl">SILENCE IN THE KITCHEN</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function OrderCard({ order, onUpdate }: { order: Order; onUpdate: (id: string, status: OrderStatus) => void }) {
    const [elapsedMinutes, setElapsedMinutes] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedMinutes(Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000));
        }, 10000);
        setElapsedMinutes(Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000));
        return () => clearInterval(interval);
    }, [order.created_at]);

    const isLate = elapsedMinutes > 15;
    const tableDisplay = order.table_number || (order.tables?.number ? `No. ${order.tables.number}` : "Express");

    return (
        <motion.div
            layoutId={order.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            whileHover={{ y: -4 }}
            className="group"
        >
            <Card className={cn(
                "relative overflow-hidden transition-all duration-500 border-white/5",
                "bg-card/30 backdrop-blur-xl group-hover:bg-card/50 group-hover:border-primary/30",
                "rounded-[2rem] shadow-2xl",
                order.status === 'pending' ? "shadow-primary/5" : ""
            )}>
                {/* Visual Status Bar */}
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500",
                    order.status === 'pending' ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" :
                        order.status === 'preparing' ? "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]" :
                            "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                )} />

                <CardHeader className="p-6 pb-4 flex flex-row justify-between items-start space-y-0 relative z-10">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className="bg-primary hover:bg-primary text-white font-black px-4 py-1 rounded-full shadow-lg shadow-primary/20 flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5" />
                                {tableDisplay}
                            </Badge>
                            {order.customer_name && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                                    <User className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-sm font-black italic truncate max-w-[120px]">
                                        {order.customer_name}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className={cn(
                            "flex items-center gap-2 text-xs font-black tracking-widest uppercase",
                            isLate ? "text-red-400 animate-pulse" : "text-muted-foreground/60"
                        )}>
                            <Clock className="w-4 h-4" />
                            {elapsedMinutes}m elapsed
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 relative">
                        {order.status === 'pending' && (
                            <Button
                                onClick={() => onUpdate(order.id, 'preparing')}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 group/btn"
                            >
                                <ChefHat className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                                Cook
                            </Button>
                        )}
                        {order.status === 'preparing' && (
                            <Button
                                onClick={() => onUpdate(order.id, 'ready')}
                                className="bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-lg shadow-orange-500/30 group/btn"
                            >
                                <BellRing className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                                Ready
                            </Button>
                        )}
                        {order.status === 'ready' && (
                            <Button
                                onClick={() => onUpdate(order.id, 'served')}
                                className="bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl shadow-lg shadow-green-500/30 group/btn"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2 group-hover:scale-110" />
                                Serve
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-4 relative z-10">
                    <div className="space-y-3">
                        {order.order_items.map(item => (
                            <div key={item.id} className="group/item flex justify-between items-center p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all">
                                <span className="font-bold text-white flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-white text-xs font-black shadow-lg shadow-primary/20 transition-transform group-hover/item:scale-110">
                                        {item.quantity}
                                    </div>
                                    <span className="text-sm tracking-tight">{item.menu_items?.name || 'Unknown Treasure'}</span>
                                </span>
                            </div>
                        ))}
                    </div>

                    {order.order_items.some(i => i.notes) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20"
                        >
                            <p className="text-xs text-amber-500 font-black italic flex items-start gap-2">
                                <span className="text-lg leading-none">★</span>
                                {order.order_items.map(i => i.notes).filter(Boolean).join(", ")}
                            </p>
                        </motion.div>
                    )}
                </CardContent>

                {/* Ambient Hover Glow */}
                <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Card>
        </motion.div>
    );
}

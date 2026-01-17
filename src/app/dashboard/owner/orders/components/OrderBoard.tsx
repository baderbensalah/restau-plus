
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
        { status: 'pending', label: 'New Orders', icon: BellRing, color: 'text-teal-500', glow: 'shadow-teal-500/20' },
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
        <div className="flex-1 h-full overflow-hidden flex flex-col pt-2">
            <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-6 h-full min-w-[1000px] px-1">
                    {columns.map(col => (
                        <div key={col.status} className="flex-1 min-w-[320px] flex flex-col gap-4">
                            {/* Column Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border-none shadow-sm sticky top-0 z-10"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg bg-zinc-800 text-white", col.color)}>
                                        <col.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-semibold text-base text-zinc-100">{col.label}</h3>
                                </div>
                                <Badge variant="secondary" className="bg-zinc-950 text-white hover:bg-zinc-950">
                                    {orders.filter(o => o.status === col.status).length}
                                </Badge>
                            </motion.div>

                            <div className="space-y-4 px-1 pb-10 overflow-y-auto custom-scrollbar h-[calc(100vh-200px)]">
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
                                        animate={{ opacity: 0.5 }}
                                        className="flex flex-col items-center justify-center py-12 text-zinc-500"
                                    >
                                        <div className="p-4 rounded-full bg-zinc-900 mb-3">
                                            <UtensilsCrossed className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="text-sm font-medium">No orders</p>
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
    const tableDisplay = order.table_number || (order.tables?.number ? `Table ${order.tables.number}` : "Express");

    return (
        <motion.div
            layoutId={order.id}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="group"
        >
            <Card className="border-none bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="p-4 flex flex-row justify-between items-start space-y-0">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-teal-400">#{order.id.slice(0, 4)}</span>
                            <span className="text-xs text-zinc-500">•</span>
                            <span className="text-sm font-semibold text-white">{tableDisplay}</span>
                        </div>
                        {order.customer_name && (
                            <p className="text-sm text-zinc-300 font-medium">
                                {order.customer_name}
                            </p>
                        )}
                        <div className={cn(
                            "flex items-center gap-1.5 text-xs font-medium pt-1",
                            isLate ? "text-red-400" : "text-zinc-500"
                        )}>
                            <Clock className="w-3.5 h-3.5" />
                            {elapsedMinutes} min ago
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        {order.status === 'pending' && (
                            <Button
                                size="sm"
                                onClick={() => onUpdate(order.id, 'preparing')}
                                className="h-8 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg shadow-sm text-xs"
                            >
                                Start Cook
                            </Button>
                        )}
                        {order.status === 'preparing' && (
                            <Button
                                size="sm"
                                onClick={() => onUpdate(order.id, 'ready')}
                                className="h-8 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg shadow-sm text-xs"
                            >
                                Mark Ready
                            </Button>
                        )}
                        {order.status === 'ready' && (
                            <Button
                                size="sm"
                                onClick={() => onUpdate(order.id, 'served')}
                                className="h-8 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg shadow-sm text-xs"
                            >
                                Complete
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-3">
                    <div className="h-px bg-zinc-800 w-full" />
                    <div className="space-y-2">
                        {order.order_items.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <span className="text-zinc-300">
                                    <span className="font-semibold text-white mr-2">{item.quantity}x</span>
                                    {item.menu_items?.name || 'Unknown Item'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {order.order_items.some(i => i.notes) && (
                        <div className="pt-2">
                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <p className="text-xs text-amber-400 font-medium flex items-start gap-2">
                                    <span className="mt-0.5">⚠️</span>
                                    {order.order_items.map(i => i.notes).filter(Boolean).join(", ")}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

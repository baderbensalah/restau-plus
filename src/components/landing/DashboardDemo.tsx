"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { ShoppingBag, Users, DollarSign, TrendingUp, Bell, Search, Menu, ChefHat, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Fake Data
const chartData = [
    { name: "10am", value: 400 },
    { name: "11am", value: 300 },
    { name: "12pm", value: 900 },
    { name: "1pm", value: 1200 },
    { name: "2pm", value: 800 },
    { name: "3pm", value: 600 },
    { name: "4pm", value: 1100 },
];

const liveOrders = [
    { id: 1, item: "Truffle Burger", table: "T-04", status: "Cooking", time: "2m ago", price: "$24" },
    { id: 2, item: "Assorted Sushi", table: "T-08", status: "Ready", time: "5m ago", price: "$42" },
    { id: 3, item: "Wagyu Steak", table: "VIP-1", status: "Served", time: "12m ago", price: "$85" },
];

export function DashboardDemo() {
    const [orders, setOrders] = useState(liveOrders);
    const [activeTab, setActiveTab] = useState("overview");

    // Simulate "Real-time" updates
    useEffect(() => {
        const interval = setInterval(() => {
            const newItem = {
                id: Date.now(),
                item: ["Lobster Pasta", "Spicy Ramen", "Vegan Bowl", "Oysters"][Math.floor(Math.random() * 4)],
                table: `T-${Math.floor(Math.random() * 20)}`,
                status: "Just In",
                time: "Now",
                price: `$${Math.floor(Math.random() * 50) + 20}`
            };

            setOrders(prev => [newItem, ...prev.slice(0, 3)]);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden bg-black selection:bg-teal-500/30">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000" />

            <div className="container mx-auto px-4 z-10 flex flex-col items-center gap-12">

                {/* Header Text */}
                <div className="text-center space-y-6 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-teal-400 text-xs font-bold tracking-widest uppercase mb-4"
                    >
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" /> Live Demo
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight text-white"
                    >
                        The Future of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Restaurant Management</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
                    >
                        Experience total control. A powerful, real-time dashboard that puts your entire restaurant operation at your fingertips.
                    </motion.p>
                </div>

                {/* THE TABLET / DASHBOARD DEMO */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                    className="relative w-full max-w-6xl aspect-[16/10] md:aspect-[21/9] bg-zinc-950 rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_-20px_rgba(20,184,166,0.2)] overflow-hidden ring-1 ring-white/5"
                >
                    {/* Tablet Glare/Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none rounded-[2.5rem] z-50" />

                    {/* Dashboard Interface */}
                    <div className="absolute inset-0 flex flex-col md:flex-row bg-[#0c0c0e]">

                        {/* Sidebar */}
                        <div className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#0c0c0e] p-6 gap-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-black">R</div>
                                <span className="font-bold text-white tracking-wide">RESTAU+</span>
                            </div>

                            <nav className="flex flex-col gap-2">
                                <MenuItem icon={TrendingUp} label="Overview" active />
                                <MenuItem icon={ShoppingBag} label="Orders" badge="4" />
                                <MenuItem icon={Menu} label="Menu" />
                                <MenuItem icon={Users} label="Customers" />
                                <MenuItem icon={ChefHat} label="Kitchen" />
                            </nav>

                            <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/20">
                                <p className="text-white font-bold text-sm mb-1">Pro Plan</p>
                                <p className="text-zinc-400 text-xs mb-3">Your trial ends in 12 days</p>
                                <button className="w-full py-2 rounded-lg bg-teal-500 text-black text-xs font-bold hover:bg-teal-400">Upgrade</button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col min-w-0">
                            {/* Top Bar */}
                            <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0c0c0e]/50 backdrop-blur-md">
                                <div className="flex items-center gap-4 text-zinc-400 text-sm">
                                    <span className="text-white font-medium">Dashboard</span>
                                    <span>/</span>
                                    <span>Overview</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Bell className="w-5 h-5 text-zinc-400 hover:text-white transition-colors cursor-pointer" />
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-white/10" />
                                </div>
                            </header>

                            {/* Dashboard Grid */}
                            <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">

                                {/* Chart Section */}
                                <div className="md:col-span-2 flex flex-col gap-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <MetricCard title="Total Revenue" value="$4,289" change="+12%" icon={DollarSign} />
                                        <MetricCard title="Active Orders" value="23" change="+5" icon={ShoppingBag} active />
                                        <MetricCard title="Customers" value="142" change="+8%" icon={Users} />
                                    </div>

                                    <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-6 min-h-[300px]">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-white font-bold">Revenue Flow</h3>
                                            <div className="flex gap-2">
                                                <span className="px-3 py-1 rounded-full bg-white/5 text-zinc-400 text-xs">Day</span>
                                                <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-xs font-medium">Week</span>
                                            </div>
                                        </div>
                                        <div className="h-[240px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData}>
                                                    <defs>
                                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Orders Feed */}
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-white font-bold">Live Orders</h3>
                                        <span className="flex h-2 w-2 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                    </div>

                                    <div className="space-y-4 overflow-hidden">
                                        <AnimatePresence mode="popLayout">
                                            {orders.map((order) => (
                                                <motion.div
                                                    key={order.id}
                                                    layout
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-bold text-white text-sm">{order.item}</span>
                                                        <span className="text-teal-400 font-bold text-sm">{order.price}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-zinc-500">
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">{order.table}</span>
                                                            <span>{order.time}</span>
                                                        </div>
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full font-medium",
                                                            order.status === "Cooking" ? "bg-amber-500/10 text-amber-500" :
                                                                order.status === "Ready" ? "bg-emerald-500/10 text-emerald-500" :
                                                                    "bg-blue-500/10 text-blue-500"
                                                        )}>{order.status}</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// Sub-components for cleaner code
function MenuItem({ icon: Icon, label, active, badge }: any) {
    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all",
            active ? "bg-teal-500/10 text-teal-400" : "text-zinc-500 hover:text-white hover:bg-white/5"
        )}>
            <Icon className="w-5 h-5" />
            <span className="font-medium text-sm flex-1">{label}</span>
            {badge && <span className="bg-teal-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-md">{badge}</span>}
        </div>
    );
}

function MetricCard({ title, value, change, icon: Icon, active }: any) {
    return (
        <div className={cn(
            "p-5 rounded-2xl border transition-all",
            active ? "bg-teal-500/10 border-teal-500/20" : "bg-white/5 border-white/5"
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className={cn(
                    "p-2 rounded-lg",
                    active ? "bg-teal-500/20 text-teal-400" : "bg-white/10 text-zinc-400"
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    active ? "bg-teal-500/20 text-teal-400" : "bg-white/10 text-zinc-400"
                )}>{change}</span>
            </div>
            <div>
                <span className="block text-zinc-400 text-xs mb-1">{title}</span>
                <span className="block text-2xl font-bold text-white">{value}</span>
            </div>
        </div>
    );
}

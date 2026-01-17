
"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, Utensils, Users, ShoppingBag, Clock, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

interface DashboardStats {
    totalRevenue: number;
    activeOrders: number;
    activeTables: number;
    totalOrdersToday: number;
    chartData: any[];
    recentActivity: any[];
    topSelling: any[];
}

export function DashboardUI({ stats }: { stats: DashboardStats }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Custom Tooltip for Chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background/80 backdrop-blur-md border border-border/50 p-4 rounded-xl shadow-xl">
                    <p className="text-sm font-medium mb-2">{label}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm text-muted-foreground">Revenue:</span>
                        <span className="text-sm font-bold text-foreground">
                            ${payload[0].value.toLocaleString()}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6 pt-4"
        >
            {/* Header omitted as sidebar handles brand */}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Primary Card - Berry Style Teal */}
                <motion.div variants={item} className="md:col-span-1 lg:col-span-1">
                    <StatCard
                        title="Total Revenue"
                        value={`$${stats.totalRevenue.toLocaleString()}`}
                        icon={DollarSign}
                        trend="vs last month"
                        trendUp={stats.totalRevenue > 0}
                        variant="primary"
                        className="h-full"
                    />
                </motion.div>

                {/* Secondary Cards - Dark Blue/Grey */}
                <motion.div variants={item}>
                    <StatCard
                        title="Active Orders"
                        value={stats.activeOrders}
                        icon={ShoppingBag}
                        trend="Orders in kitchen"
                        trendUp={true}
                    />
                </motion.div>
                <motion.div variants={item}>
                    <StatCard
                        title="Live Tables"
                        value={stats.activeTables}
                        icon={Users}
                        trend="Currently seated"
                        trendUp={true}
                    />
                </motion.div>
                <motion.div variants={item}>
                    <StatCard
                        title="Total Orders"
                        value={stats.totalOrdersToday}
                        icon={Utensils}
                        trend="Daily volume"
                        trendUp={true}
                    />
                </motion.div>
            </div>

            <div className="grid gap-6 md:grid-cols-7 h-[500px]">
                {/* Main Chart - Matching Berry's dark theme with Teal/Purple lines */}
                <motion.div variants={item} className="col-span-4 lg:col-span-5 h-full">
                    <Card className="h-full border-none bg-zinc-900 shadow-lg text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="text-2xl font-bold">$2,324.00</span>
                                    <span className="text-sm font-medium text-zinc-400">Total Growth</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" className="text-teal-400 hover:text-teal-300 hover:bg-teal-950/30">Month</Button>
                                    <Button size="sm" variant="ghost" className="text-zinc-500 hover:text-white">Year</Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[80%] pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#71717a"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#71717a"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                        itemStyle={{ color: '#14b8a6' }}
                                        cursor={{ stroke: '#14b8a6', strokeWidth: 1 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#14b8a6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Popular Stocks / Items - Matching Berry's sidebar card style */}
                <motion.div variants={item} className="col-span-3 lg:col-span-2 flex flex-col gap-6">
                    <Card className="h-full border-none bg-zinc-900 shadow-lg text-white flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Popular Items</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto pr-2">
                            <div className="space-y-6">
                                {stats.topSelling?.map((item, i) => (
                                    <div key={i} className="flex flex-col gap-2 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-zinc-200">{item.name}</span>
                                            <span className="font-bold text-teal-400">${(item.count * 12).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-medium"
                                            )}>
                                                {item.count} orders
                                            </span>
                                            <span className="text-zinc-500">In stock</span>
                                        </div>
                                        <div className="h-1 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (item.count / (stats.topSelling[0].count || 1)) * 100)}%` }}
                                                className="h-full bg-teal-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(!stats.topSelling || stats.topSelling.length === 0) && (
                                    <div className="flex flex-col items-center justify-center h-full opacity-40 text-sm text-zinc-500">
                                        <p>No sales data yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Buy Now / Action Button at bottom like styling */}
                            <div className="mt-auto pt-4">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11 rounded-lg shadow-lg shadow-indigo-500/20">
                                    View Full Menu
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}


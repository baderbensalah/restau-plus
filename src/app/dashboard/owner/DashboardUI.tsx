
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
            className="space-y-8 p-1"
        >
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight glow-text text-foreground mb-2">Dashboard</h2>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {mounted ? new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : <span className="opacity-0">Loading...</span>}
                    </div>
                </div>
                <Button variant="outline" className="hidden sm:flex">
                    Download Report
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <motion.div variants={item}>
                    <StatCard
                        title="Total Revenue"
                        value={`$${stats.totalRevenue.toLocaleString()}`}
                        icon={DollarSign}
                        trend="12% vs last week"
                        trendUp={true}
                        gradient="from-emerald-500/20 to-teal-500/20"
                    />
                </motion.div>
                <motion.div variants={item}>
                    <StatCard
                        title="Active Orders"
                        value={stats.activeOrders}
                        icon={ShoppingBag}
                        trend="Processing"
                        description="Orders in kitchen"
                        gradient="from-blue-500/20 to-indigo-500/20"
                    />
                </motion.div>
                <motion.div variants={item}>
                    <StatCard
                        title="Live Tables"
                        value={stats.activeTables}
                        icon={Users}
                        trend="Occupancy"
                        description="Currently seated"
                        gradient="from-purple-500/20 to-pink-500/20"
                    />
                </motion.div>
                <motion.div variants={item}>
                    <StatCard
                        title="Total Orders"
                        value={stats.totalOrdersToday}
                        icon={Utensils}
                        trend="Daily Volume"
                        trendUp={true}
                        gradient="from-orange-500/20 to-red-500/20"
                    />
                </motion.div>
            </div>

            <div className="grid gap-6 md:grid-cols-7 h-[500px]">
                <motion.div variants={item} className="col-span-4 lg:col-span-5 h-full">
                    <Card className="h-full border-muted/40 bg-card/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Revenue Analytics
                            </CardTitle>
                            <CardDescription>Weekly performance overview</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0 h-[85%]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                        dx={-10}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '5 5' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item} className="col-span-3 lg:col-span-2 flex flex-col gap-6">
                    {/* Recent Activity */}
                    <Card className="flex-1 border-muted/40 bg-card/40 backdrop-blur-sm flex flex-col min-h-[300px]">
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto pr-2">
                            <div className="space-y-6">
                                {stats.recentActivity?.length > 0 ? (
                                    stats.recentActivity.map((activity: any, i: number) => (
                                        <div key={i} className="flex items-start gap-4 group">
                                            <div className="relative mt-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors ring-4 ring-primary/10" />
                                                {i !== stats.recentActivity.length - 1 && <div className="absolute top-2.5 left-1.2 w-[1px] h-12 bg-border/50" />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold leading-none text-white tracking-tight">{activity.title}</p>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">{activity.subtitle}</p>
                                                <p className="text-[10px] font-medium text-primary/80">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full opacity-30 italic">
                                        <p>No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Popular Creations */}
                    <Card className="border-muted/40 bg-card/40 backdrop-blur-sm p-6">
                        <CardTitle className="text-lg mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Popular Creations
                        </CardTitle>
                        <div className="space-y-4">
                            {stats.topSelling?.map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-white/80">{item.name}</span>
                                        <span className="font-black text-primary">{item.count} sold</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (item.count / (stats.topSelling[0].count || 1)) * 100)}%` }}
                                            className="h-full bg-primary shadow-[0_0_8px_var(--primary)]"
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!stats.topSelling || stats.topSelling.length === 0) && (
                                <p className="text-xs text-muted-foreground italic text-center py-4">Waiting for sales data...</p>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}

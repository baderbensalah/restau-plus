import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    description?: string;
    className?: string;
    variant?: "default" | "primary" | "secondary";
}

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    description,
    className,
    variant = "default"
}: StatCardProps) {
    const isPrimary = variant === "primary";
    const isEmpty = value === 0 || value === "0" || value === "$0";

    return (
        <Card className={cn(
            "relative overflow-hidden transition-all duration-300 border-none shadow-lg",
            isPrimary
                ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white"
                : "bg-zinc-900 text-white hover:bg-zinc-800", // Flat dark for others
            className
        )}>
            {/* Background Decorator for Primary Only */}
            {isPrimary && (
                <>
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/20 blur-xl pointer-events-none" />
                    <div className="absolute right-10 bottom-10 w-32 h-32 rounded-full bg-teal-400/30 blur-2xl pointer-events-none" />
                </>
            )}

            <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                        "p-2.5 rounded-lg flex items-center justify-center transition-transform duration-300",
                        isPrimary ? "bg-white/20 text-white" : "bg-zinc-800 text-teal-400"
                    )}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className={cn(
                        "font-bold tracking-tight transition-opacity",
                        isPrimary ? "text-4xl" : "text-3xl", // Larger font for Revenue
                        isEmpty && !isPrimary ? "opacity-50" : "opacity-100"
                    )}>
                        {value}
                    </div>
                    <div className={cn(
                        "text-sm font-medium",
                        isPrimary ? "text-teal-50" : "text-zinc-400"
                    )}>
                        {title}
                    </div>
                </div>

                {/* Empty State or Trend */}
                <div className="mt-4 pt-4 border-t border-white/5 h-8 flex items-center">
                    {isEmpty ? (
                        <span className="text-xs text-zinc-500 font-medium italic">
                            No data recorded yet
                        </span>
                    ) : (trend || description) ? (
                        <div className="flex items-center gap-2">
                            {trend && (
                                <div className="flex items-center gap-1.5">
                                    <span className={cn(
                                        "flex items-center justify-center w-4 h-4 rounded-full text-[10px]",
                                        trendUp
                                            ? "bg-emerald-500/20 text-emerald-400" // Always green for up
                                            : "bg-red-500/20 text-red-400"
                                    )}>
                                        {trendUp ? "↗" : "↘"}
                                    </span>
                                    <span className={cn(
                                        "text-xs font-medium",
                                        isPrimary ? "text-teal-50" : "text-zinc-400"
                                    )}>{trend}</span>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

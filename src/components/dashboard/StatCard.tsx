
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
    gradient?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    description,
    className,
    gradient = "from-blue-500/20 to-purple-500/20"
}: StatCardProps) {
    return (
        <Card className={cn("overflow-hidden border-muted/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 group", className)}>
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br", gradient)} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {title}
                </CardTitle>
                <div className={cn("p-2 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300")}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-2">
                <div className="text-4xl font-black tracking-tighter text-white text-glow-primary">
                    {value}
                </div>
                {(trend || description) && (
                    <div className="flex items-center gap-2 mt-1">
                        {trend && (
                            <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center",
                                trendUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                            )}>
                                {trendUp ? "↑" : "↓"} {trend}
                            </span>
                        )}
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

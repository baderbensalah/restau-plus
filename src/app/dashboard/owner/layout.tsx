import { Sidebar } from "@/components/dashboard/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { AccessGuard } from "@/components/dashboard/AccessGuard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-950 flex text-zinc-100">
            {/* Desktop Sidebar */}
            <Sidebar />

            <main className="flex-1 md:ml-64 lg:ml-72 min-h-screen flex flex-col relative z-0">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center p-4 border-b border-zinc-800 bg-zinc-950 text-white sticky top-0 z-30">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72 border-none bg-zinc-950">
                            <div className="h-full relative">
                                <Sidebar className="w-full static border-r-0" mobile />
                            </div>
                        </SheetContent>
                    </Sheet>
                    <span className="font-bold ml-4 text-lg">RESTAU+</span>
                </div>

                <div className="container mx-auto p-4 md:p-8 pt-6 flex-1 relative">
                    <AccessGuard>
                        {children}
                    </AccessGuard>
                </div>
            </main>
        </div>
    );
}

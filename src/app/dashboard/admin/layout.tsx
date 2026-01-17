import { AdminSidebar } from "@/components/dashboard/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black flex">
            {/* Admin Sidebar */}
            <AdminSidebar />

            <main className="flex-1 md:ml-72 min-h-screen flex flex-col relative z-0">
                {children}
            </main>
        </div>
    );
}

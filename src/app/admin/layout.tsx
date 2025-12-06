import AdminSidebar from "@/components/admin/Sidebar";
import { SidebarProvider } from "@/components/providers/SidebarContext";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                <AdminSidebar />
                <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
            </div>
        </SidebarProvider>
    );
}

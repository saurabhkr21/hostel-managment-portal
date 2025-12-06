import StaffSidebar from "@/components/staff/Sidebar";
import { SidebarProvider } from "@/components/providers/SidebarContext";
import StaffLayoutWrapper from "@/components/staff/StaffLayoutWrapper";

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                <StaffSidebar />
                <StaffLayoutWrapper>{children}</StaffLayoutWrapper>
            </div>
        </SidebarProvider>
    );
}

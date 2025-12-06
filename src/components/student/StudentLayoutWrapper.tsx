"use client";

import StudentSidebar from "./Sidebar";
import { useSidebar } from "@/components/providers/SidebarContext";

export default function StudentLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isCollapsed, setSidebarState, isMobile } = useSidebar();

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <StudentSidebar />
            <main
                onClick={() => {
                    if (!isCollapsed && isMobile) setSidebarState(true);
                }}
                className={`flex-1 transition-all duration-150 ease-in-out ${isMobile ? 'ml-0' : (isCollapsed ? 'ml-[80px]' : 'ml-[280px]')
                    }`}
            >
                {children}
            </main>
        </div>
    );
}

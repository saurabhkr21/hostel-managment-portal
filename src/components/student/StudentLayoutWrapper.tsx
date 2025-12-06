"use client";

import StudentSidebar from "./Sidebar";
import { useSidebar } from "@/components/providers/SidebarContext";

export default function StudentLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isCollapsed, setSidebarState } = useSidebar();

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <StudentSidebar />
            <main
                onClick={() => {
                    if (!isCollapsed) setSidebarState(true);
                }}
                className={`flex-1 p-8 transition-all duration-150 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-64'
                    }`}
            >
                {children}
            </main>
        </div>
    );
}

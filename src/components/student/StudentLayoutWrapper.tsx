"use client";

import StudentSidebar from "./Sidebar";
import { useSidebar } from "@/components/providers/SidebarContext";

export default function StudentLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="flex min-h-screen bg-slate-50">
            <StudentSidebar />
            <main
                className={`flex-1 p-8 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-64'
                    }`}
            >
                {children}
            </main>
        </div>
    );
}

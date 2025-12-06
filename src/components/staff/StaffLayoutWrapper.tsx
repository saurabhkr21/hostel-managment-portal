"use client";

import { useSidebar } from "@/components/providers/SidebarContext";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function StaffLayoutWrapper({ children }: { children: ReactNode }) {
    const { isCollapsed, setSidebarState, isMobile } = useSidebar();

    return (
        <motion.main
            initial={false}
            animate={{ marginLeft: isMobile ? 0 : (isCollapsed ? 80 : 288) }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="flex-1 overflow-y-auto min-h-screen bg-slate-50 dark:bg-slate-900"
            onClick={() => {
                if (!isCollapsed && isMobile) setSidebarState(true);
            }}
        >
            {children}
        </motion.main>
    );
}

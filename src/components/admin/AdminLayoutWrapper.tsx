"use client";

import { useSidebar } from "@/components/providers/SidebarContext";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function AdminLayoutWrapper({ children }: { children: ReactNode }) {
    const { isCollapsed, setSidebarState } = useSidebar();

    return (
        <motion.main
            initial={false}
            animate={{ marginLeft: isCollapsed ? 80 : 288 }} // 288px = w-72
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="flex-1 p-8 overflow-y-auto min-h-screen"
            onClick={() => {
                if (!isCollapsed) setSidebarState(true);
            }}
        >
            {children}
        </motion.main>
    );
}

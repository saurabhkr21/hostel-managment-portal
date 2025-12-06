"use client";

import { useSidebar } from "@/components/providers/SidebarContext";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function AdminLayoutWrapper({ children }: { children: ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <motion.main
            initial={false}
            animate={{ marginLeft: isCollapsed ? 80 : 288 }} // 288px = w-72
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 p-8 overflow-y-auto min-h-screen transition-all"
        >
            {children}
        </motion.main>
    );
}

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    setSidebarState: (state: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const toggleSidebar = () => {
        setIsCollapsed((prev) => !prev);
    };

    const setSidebarState = (state: boolean) => {
        setIsCollapsed(state);
    };

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setSidebarState }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}

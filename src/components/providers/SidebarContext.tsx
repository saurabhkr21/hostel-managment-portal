"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextType {
    isCollapsed: boolean;
    isMobile: boolean;
    toggleSidebar: () => void;
    setSidebarState: (state: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsCollapsed(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed((prev) => !prev);
    };

    const setSidebarState = (state: boolean) => {
        setIsCollapsed(state);
    };

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setSidebarState, isMobile }}>
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

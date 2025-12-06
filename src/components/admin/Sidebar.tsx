"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUsers, FaBed, FaSignOutAlt, FaFileAlt, FaCog, FaSun, FaMoon, FaUserCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/components/providers/SidebarContext";

export default function AdminSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Icons need to be explicitly accessed
    const { isCollapsed, toggleSidebar } = useSidebar();

    const links = [
        { href: "/admin", label: "Dashboard", icon: FaHome },
        { href: "/admin/users", label: "Users", icon: FaUsers },
        { href: "/admin/rooms", label: "Rooms", icon: FaBed },
        { href: "/admin/reports", label: "Reports", icon: FaFileAlt },
        { href: "/admin/settings", label: "Settings", icon: FaCog },
    ];

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 80 : 288 }}
            className="bg-slate-900 border-r border-slate-800 text-white min-h-screen flex flex-col shadow-2xl fixed left-0 top-0 z-50 overflow-hidden transition-all duration-300"
        >
            {/* Background Gradient Blob */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-20%] w-64 h-64 bg-violet-600 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-20%] w-64 h-64 bg-indigo-600 rounded-full blur-3xl"></div>
            </div>

            <div className="p-4 z-10 flex flex-col h-full">
                {/* Brand & Toggle */}
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-8 px-2`}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-xl font-bold text-white">H</span>
                            </div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                Admin
                            </h1>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg cursor-pointer" onClick={toggleSidebar}>
                            <span className="text-xl font-bold text-white">H</span>
                        </div>
                    )}

                    {!isCollapsed && (
                        <button onClick={toggleSidebar} className="p-2 text-slate-400 hover:text-white transition-colors">
                            <FaChevronLeft />
                        </button>
                    )}
                </div>

                {isCollapsed && (
                    <div className="flex justify-center mb-6">
                        <button onClick={toggleSidebar} className="p-2 text-slate-400 hover:text-white transition-colors">
                            <FaChevronRight />
                        </button>
                    </div>
                )}

                {/* User Profile Snippet */}
                {/* User Profile Snippet */}
                <div className={`mb-8 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center gap-3 backdrop-blur-sm ${isCollapsed ? 'justify-center mx-2' : ''}`}>
                    <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-md">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt="User" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <FaUserCircle size={24} />
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="font-semibold text-sm truncate">{session?.user?.name || "Admin User"}</p>
                            <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
                        </div>
                    )}
                </div>

                <nav className="space-y-2 flex-1 px-2 mt-4">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${isActive
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    } ${isCollapsed ? 'justify-center px-0 w-full' : 'gap-4'}`}
                                title={isCollapsed ? link.label : ""}
                            >
                                <div className={`relative z-10 flex items-center justify-center ${isCollapsed ? '' : 'w-6'}`}>
                                    <Icon className={`text-xl transition-transform group-hover:scale-110 ${isActive ? "text-white" : "currentColor"}`} />
                                </div>
                                {!isCollapsed && <span className="font-medium relative z-10 whitespace-nowrap">{link.label}</span>}
                                {isActive && !isCollapsed && (
                                    <motion.div
                                        layoutId="adminSidebarActive"
                                        className="absolute left-0 w-1 h-8 bg-violet-400 rounded-r-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Actions - Fixed at Bottom */}
                <div className="absolute bottom-6 left-0 w-full px-4 space-y-2 bg-slate-900 pt-4">
                    {/* Theme Toggle */}
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className={`flex items-center gap-3 px-4 py-3 w-full text-left text-slate-400 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : ''}`}
                            title="Toggle Theme"
                        >
                            {theme === "dark" ? <FaSun className="text-amber-400 text-xl" /> : <FaMoon className="text-xl" />}
                            {!isCollapsed && (
                                <span className="font-medium">
                                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                                </span>
                            )}
                        </button>
                    )}

                    <button
                        onClick={() => signOut()}
                        className={`flex items-center gap-3 px-4 py-3 w-full text-left text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all duration-300 group ${isCollapsed ? 'justify-center px-0' : ''}`}
                        title="Sign Out"
                    >
                        <FaSignOutAlt className="group-hover:translate-x-1 transition-transform text-xl" />
                        {!isCollapsed && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

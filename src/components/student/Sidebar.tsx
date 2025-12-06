"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaExclamationCircle, FaSignOutAlt, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaMoon, FaSun, FaUserCircle } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/components/providers/SidebarContext";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function StudentSidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const links = [
        { href: "/student", label: "Dashboard", icon: FaHome },
        { href: "/student/leaves", label: "Leave/Out Pass", icon: FaExclamationCircle },
        { href: "/student/attendance", label: "Attendance", icon: FaCalendarAlt },
        { href: "/student/complaints", label: "Complaints", icon: FaExclamationCircle },
    ];

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen flex flex-col fixed left-0 top-0 z-50 shadow-xl transition-all duration-300"
        >
            <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && (
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/30">
                            H
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white whitespace-nowrap">
                            HostelApp
                        </h1>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/30">
                        H
                    </div>
                )}

                {!isCollapsed && (
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <FaChevronLeft />
                    </button>
                )}
            </div>

            {/* Collapsed Toggle Button */}
            {isCollapsed && (
                <div className="flex justify-center py-4 border-b border-transparent">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            )}

            {/* User Profile Snippet (Only when expanded) */}
            {!isCollapsed && (
                <div className="mx-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 flex items-center justify-center font-bold text-lg">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt="User" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <FaUserCircle size={24} />
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{session?.user?.name || "Student"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session?.user?.email}</p>
                    </div>
                </div>
            )}

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive
                                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                            title={isCollapsed ? link.label : ""}
                        >
                            <link.icon className={`text-xl relative z-10 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                            {!isCollapsed && (
                                <span className="font-medium whitespace-nowrap relative z-10">{link.label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {/* Theme Toggle */}
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors font-medium ${isCollapsed ? 'justify-center' : ''}`}
                        title="Toggle Theme"
                    >
                        {theme === "dark" ? <FaSun className="text-amber-400 text-xl" /> : <FaMoon className="text-xl" />}
                        {!isCollapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
                    </button>
                )}

                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-colors font-medium ${isCollapsed ? 'justify-center' : ''}`}
                    title="Sign Out"
                >
                    <FaSignOutAlt className="text-xl" />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </motion.div>
    );
}

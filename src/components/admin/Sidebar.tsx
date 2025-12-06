"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUsers, FaBed, FaSignOutAlt, FaFileAlt, FaCog, FaSun, FaMoon, FaUserCircle, FaChevronLeft, FaChevronRight, FaMoneyBillWave, FaCalendarAlt, FaBullhorn, FaBars } from "react-icons/fa";
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
    const [profileImage, setProfileImage] = useState<string | null>(null);

    // Icons need to be explicitly accessed
    const { isCollapsed, toggleSidebar, isMobile, setSidebarState } = useSidebar();

    useEffect(() => {
        setMounted(true);
        if (session?.user) {
            fetch("/api/me")
                .then(res => res.json())
                .then(data => {
                    if (data?.profile?.profileImage) {
                        setProfileImage(data.profile.profileImage);
                    }
                })
                .catch(err => console.error("Failed to fetch profile", err));
        }
    }, [session]);

    const links = [
        { href: "/admin", label: "Dashboard", icon: FaHome },
        { href: "/admin/users", label: "Users", icon: FaUsers },
        { href: "/admin/attendance", label: "Attendance", icon: FaCalendarAlt },
        { href: "/admin/rooms", label: "Rooms", icon: FaBed },
        { href: "/admin/fees", label: "Fees", icon: FaMoneyBillWave },
        { href: "/admin/notifications", label: "Notifications", icon: FaBullhorn },
        { href: "/admin/reports", label: "Reports", icon: FaFileAlt },
        { href: "/admin/settings", label: "Settings", icon: FaCog },
    ];

    // Mobile Overlay
    const MobileOverlay = () => (
        isMobile && !isCollapsed ? (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarState(true)}
                className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            />
        ) : null
    );

    return (
        <>
            <AnimatePresence>
                <MobileOverlay />
            </AnimatePresence>

            {/* Mobile Header Toggle (Visible only on mobile when sidebar is closed) */}
            {isMobile && isCollapsed && (
                <button
                    onClick={toggleSidebar}
                    className="fixed top-4 left-4 z-50 p-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 md:hidden hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
                >
                    <FaBars size={20} />
                </button>
            )}

            <motion.div
                initial={false}
                animate={{
                    width: isMobile ? 288 : (isCollapsed ? 80 : 288),
                    x: isMobile && isCollapsed ? -288 : 0
                }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white min-h-screen flex flex-col shadow-xl fixed left-0 top-0 z-50 overflow-hidden ${isMobile ? 'w-72' : ''}`}
            >
                {/* Background Gradient Blob */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
                    <div className="absolute top-[-10%] left-[-20%] w-64 h-64 bg-violet-600 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] right-[-20%] w-64 h-64 bg-indigo-600 rounded-full blur-3xl"></div>
                </div>

                <div className="p-4 z-10 flex flex-col h-full">
                    {/* User Profile Header */}
                    <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'} mb-6 px-2`}>
                        <div className={`flex items-center gap-3 ${isCollapsed && !isMobile ? 'justify-center w-full' : ''}`}>
                            <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-md">
                                {profileImage ? (
                                    <img src={profileImage} alt="User" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <FaUserCircle size={24} />
                                )}
                            </div>
                            {(!isCollapsed || isMobile) && (
                                <div className="overflow-hidden">
                                    <p className="font-semibold text-sm truncate text-slate-800 dark:text-white">{session?.user?.name || "Admin User"}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session?.user?.email}</p>
                                </div>
                            )}
                        </div>

                        {(!isCollapsed || isMobile) && (
                            <div className="flex items-center">
                                {/* Close Button for Mobile */}
                                {isMobile && (
                                    <button
                                        onClick={() => setSidebarState(true)}
                                        className="p-2 ml-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                                    >
                                        <FaChevronLeft size={16} />
                                    </button>
                                )}

                                {!isMobile && (
                                    <button onClick={toggleSidebar} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                                        <FaChevronLeft />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {isCollapsed && !isMobile && (
                        <div className="flex justify-center mb-6">
                            <button onClick={toggleSidebar} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                                <FaChevronRight />
                            </button>
                        </div>
                    )}

                    <nav className="space-y-2 flex-1 px-2 mt-4 overflow-y-auto custom-scrollbar">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center px-3 py-2.5 mx-2 rounded-lg transition-all duration-200 group relative ${isActive
                                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                                        } ${isCollapsed && !isMobile ? 'justify-center px-0 mx-2' : 'gap-3'}`}
                                    title={isCollapsed && !isMobile ? link.label : ""}
                                    onClick={() => isMobile && setSidebarState(true)}
                                >
                                    <div className={`relative z-10 flex items-center justify-center ${isCollapsed && !isMobile ? '' : 'w-5'}`}>
                                        <Icon className={`text-lg transition-transform group-hover:scale-105 ${isActive ? "text-white" : "currentColor"}`} />
                                    </div>
                                    {(!isCollapsed || isMobile) && <span className="text-sm font-medium relative z-10 whitespace-nowrap">{link.label}</span>}
                                    {isActive && (!isCollapsed || isMobile) && (
                                        <motion.div
                                            layoutId="adminSidebarActive"
                                            className="absolute left-0 w-1 h-6 bg-white/20 rounded-r-full"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Actions - Fixed at Bottom */}
                    <div className="w-full px-2 pb-6 pt-4 space-y-2 bg-white/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 mt-auto backdrop-blur-sm">
                        <button
                            onClick={() => signOut()}
                            className={`flex items-center gap-3 px-4 py-3 w-full text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 rounded-xl transition-all duration-300 group ${isCollapsed && !isMobile ? 'justify-center px-0' : ''}`}
                            title="Sign Out"
                        >
                            <FaSignOutAlt className="group-hover:translate-x-1 transition-transform text-xl" />
                            {(!isCollapsed || isMobile) && <span className="font-medium">Sign Out</span>}
                        </button>
                    </div>
                </div>
            </motion.div >
        </>
    );
}

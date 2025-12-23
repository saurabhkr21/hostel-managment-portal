"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUsers, FaExclamationCircle, FaSignOutAlt, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaUserCircle, FaBed, FaCog, FaComments, FaSuitcase, FaClipboardList, FaBars, FaBullhorn } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import { useSidebar } from "@/components/providers/SidebarContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function StaffSidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar, isMobile, setSidebarState } = useSidebar();
    const { data: session } = useSession();
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
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
        { href: "/staff", label: "Dashboard", icon: FaHome },
        { href: "/staff/students", label: "Students", icon: FaUsers },
        { href: "/staff/rooms", label: "Rooms", icon: FaBed },
        { href: "/staff/leaves", label: "Leaves", icon: FaSuitcase },
        { href: "/staff/attendance", label: "Attendance", icon: FaCalendarAlt },
        { href: "/staff/complaints", label: "Complaints", icon: FaClipboardList },
        { href: "/staff/notifications", label: "Notifications", icon: FaBullhorn },
        { href: "/staff/settings", label: "Settings", icon: FaCog },
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
                    className="fixed top-4 left-4 z-50 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 md:hidden"
                >
                    <FaBars />
                </button>
            )}

            <motion.div
                initial={false}
                animate={{
                    width: isMobile ? 288 : (isCollapsed ? 80 : 288),
                    x: isMobile && isCollapsed ? -288 : 0
                }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white min-h-screen flex flex-col fixed left-0 top-0 z-50 shadow-xl overflow-hidden ${isMobile ? 'w-72' : ''}`}
            >
                {/* User Profile Header */}
                <div className={`p-6 flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
                    <div className={`flex items-center gap-3 ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 min-w-10 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 flex items-center justify-center font-bold text-lg overflow-hidden border border-violet-200 dark:border-violet-800">
                            {profileImage ? (
                                <img src={profileImage} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <FaUserCircle size={24} />
                            )}
                        </div>
                        {(!isCollapsed || isMobile) && (
                            <div className="overflow-hidden">
                                <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{session?.user?.name || "Staff"}</p>
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
                                    className="p-2 ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <FaChevronLeft size={16} />
                                </button>
                            )}

                            {!isMobile && (
                                <button
                                    onClick={toggleSidebar}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/50 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                                >
                                    <FaChevronLeft size={12} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {isCollapsed && !isMobile && (
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={toggleSidebar}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/50 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                        >
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                )}

                <nav className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center px-3 py-2.5 mx-2 rounded-lg transition-all duration-200 group relative ${isActive
                                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                                    : "text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                    } ${isCollapsed && !isMobile ? 'justify-center px-0 mx-2' : 'gap-3'}`}
                                title={isCollapsed && !isMobile ? link.label : ""}
                                onClick={() => isMobile && setSidebarState(true)}
                            >
                                <Icon className={`text-lg min-w-[20px] transition-transform group-hover:scale-105 ${isActive ? "" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                                {(!isCollapsed || isMobile) && <span className="whitespace-nowrap text-sm font-medium">{link.label}</span>}
                                {isActive && (!isCollapsed || isMobile) && (
                                    <motion.div
                                        layoutId="staffSidebarActive"
                                        className="absolute left-0 w-1 h-6 bg-white/20 rounded-r-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className={`flex items-center px-4 py-3 w-full text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-600 dark:hover:text-rose-300 rounded-xl transition-all duration-200 group ${isCollapsed && !isMobile ? 'justify-center px-0' : 'gap-3'}`}
                        title="Sign Out"
                    >
                        <FaSignOutAlt className="text-xl min-w-[20px] group-hover:translate-x-1 transition-transform" />
                        {(!isCollapsed || isMobile) && <span className="whitespace-nowrap font-medium">Sign Out</span>}
                    </button>
                </div>
            </motion.div>
        </>
    );
}

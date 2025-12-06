"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaExclamationCircle, FaSignOutAlt, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaMoon, FaSun, FaUserCircle, FaCog, FaMoneyBillWave, FaBell, FaSuitcase, FaClipboardList } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/components/providers/SidebarContext";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import NotificationPanel from "./NotificationPanel";

export default function StudentSidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    // Notification State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showHeaderDropdown, setShowHeaderDropdown] = useState(false);
    const [showSidebarPanel, setShowSidebarPanel] = useState(false);

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

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            if (Array.isArray(data)) {
                setNotifications(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: id })
            });
            fetchNotifications(); // Refresh
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Filter out Settings for main list
    const mainLinks = [
        { href: "/student", label: "Dashboard", icon: FaHome },
        { href: "/student/leaves", label: "Leave/Out Pass", icon: FaSuitcase },
        { href: "/student/attendance", label: "Attendance", icon: FaCalendarAlt },
        { href: "/student/fees", label: "Fees & Payments", icon: FaMoneyBillWave },
        { href: "/student/complaints", label: "Complaints", icon: FaClipboardList },
    ];

    const settingsLink = { href: "/student/settings", label: "Settings", icon: FaCog };

    return (
        <>
            <motion.div
                initial={false}
                animate={{ width: isCollapsed ? 80 : 280 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen flex flex-col fixed left-0 top-0 z-50 shadow-xl"
            >
                <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                            {profileImage ? (
                                <img src={profileImage} alt="User" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <FaUserCircle size={24} />
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{session?.user?.name || "Student"}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session?.user?.email}</p>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <div className="flex items-center gap-2">
                            {/* Header Notification Icon */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowHeaderDropdown(!showHeaderDropdown)}
                                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors relative"
                                >
                                    <FaBell />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                                    )}
                                </button>
                                <AnimatePresence>
                                    {showHeaderDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowHeaderDropdown(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
                                            >
                                                <div className="p-3 border-b border-slate-100 dark:border-slate-700 font-bold text-sm text-slate-800 dark:text-white flex justify-between items-center">
                                                    <span>Notifications</span>
                                                    <span className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                                    {notifications.length === 0 ? (
                                                        <div className="p-8 text-center text-slate-400 text-xs">No notifications</div>
                                                    ) : (
                                                        notifications.map((n) => (
                                                            <div
                                                                key={n.id}
                                                                onClick={() => markAsRead(n.id)}
                                                                className={`p-3 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors ${!n.read ? "bg-violet-50/50 dark:bg-violet-900/10" : ""}`}
                                                            >
                                                                <p className={`text-sm ${!n.read ? "font-bold text-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
                                                                    {n.message}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 mt-1">
                                                                    {new Date(n.createdAt).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <FaChevronLeft />
                            </button>
                        </div>
                    )}
                </div>

                {isCollapsed && (
                    <div className="flex justify-center py-4 border-b border-transparent">
                        <button
                            onClick={toggleSidebar}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/50 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                        >
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                )}

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {mainLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center px-3 py-2.5 mx-2 rounded-lg transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                    } ${isCollapsed ? 'justify-center px-0 mx-2' : 'gap-3'}`}
                                title={isCollapsed ? link.label : ""}
                            >
                                <div className={`relative z-10 flex items-center justify-center ${isCollapsed ? '' : 'w-5'}`}>
                                    <link.icon className={`text-lg transition-transform group-hover:scale-105 ${isActive ? "text-white" : "text-slate-400 group-hover:text-violet-500"}`} />
                                </div>
                                {!isCollapsed && (
                                    <span className="font-medium text-sm whitespace-nowrap relative z-10">{link.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section: Notifications & Settings & Sign Out */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 mt-auto border-t border-slate-100 dark:border-slate-800">
                    {/* Sidebar Notification Trigger */}
                    <button
                        onClick={() => setShowSidebarPanel(true)}
                        className={`flex items-center px-3 py-2.5 mx-2 rounded-lg transition-all duration-200 group relative w-full text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white ${isCollapsed ? 'justify-center px-0 mx-2' : 'gap-3'}`}
                        title={isCollapsed ? "Notifications" : ""}
                    >
                        <div className={`relative z-10 flex items-center justify-center ${isCollapsed ? '' : 'w-5'}`}>
                            <FaBell className="text-lg transition-transform group-hover:scale-105 text-slate-400 group-hover:text-violet-500" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-1 justify-between items-center relative z-10">
                                <span className="font-medium text-sm whitespace-nowrap">Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="bg-rose-500 text-white text-[10px] px-1.5 rounded-full font-bold">{unreadCount}</span>
                                )}
                            </div>
                        )}
                    </button>

                    {/* Settings Link (Pinned Bottom) */}
                    <Link
                        href={settingsLink.href}
                        className={`flex items-center px-3 py-2.5 mx-2 rounded-lg transition-all duration-200 group relative overflow-hidden ${pathname === settingsLink.href
                            ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                            } ${isCollapsed ? 'justify-center px-0 mx-2' : 'gap-3'}`}
                        title={isCollapsed ? settingsLink.label : ""}
                    >
                        <div className={`relative z-10 flex items-center justify-center ${isCollapsed ? '' : 'w-5'}`}>
                            <settingsLink.icon className={`text-lg transition-transform group-hover:scale-105 ${pathname === settingsLink.href ? "text-white" : "text-slate-400 group-hover:text-violet-500"}`} />
                        </div>
                        {!isCollapsed && (
                            <span className="font-medium text-sm whitespace-nowrap relative z-10">{settingsLink.label}</span>
                        )}
                    </Link>

                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 text-left hover:text-rose-600 dark:hover:text-rose-300 rounded-xl transition-colors font-medium ${isCollapsed ? 'justify-center px-0' : ''}`}
                        title="Sign Out"
                    >
                        <FaSignOutAlt className="text-xl" />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </motion.div>

            {/* Notification Panel Component */}
            <NotificationPanel
                isOpen={showSidebarPanel}
                onClose={() => setShowSidebarPanel(false)}
                notifications={notifications}
                onMarkRead={markAsRead}
            />
        </>
    );
}

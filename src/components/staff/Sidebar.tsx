"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUsers, FaExclamationCircle, FaSignOutAlt, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaUserCircle } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import { useSidebar } from "@/components/providers/SidebarContext";
import { motion } from "framer-motion";

export default function StaffSidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();
    const { data: session } = useSession();

    const links = [
        { href: "/staff", label: "Dashboard", icon: FaHome },
        { href: "/staff/students", label: "Students", icon: FaUsers },
        { href: "/staff/rooms", label: "Rooms", icon: FaHome }, // FaBed maybe? keeping FaHome as requested or previous
        { href: "/staff/leaves", label: "Leaves", icon: FaExclamationCircle },
        { href: "/staff/attendance", label: "Attendance", icon: FaCalendarAlt },
        { href: "/staff/complaints", label: "Complaints", icon: FaExclamationCircle },
    ];

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 80 : 288 }}
            className="bg-gray-900 text-white min-h-screen flex flex-col fixed left-0 top-0 z-50 shadow-xl overflow-hidden"
        >
            <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && (
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 whitespace-nowrap">
                        Warden Panel
                    </h1>
                )}
                {isCollapsed && (
                    <span className="text-xl font-bold text-violet-400">WP</span>
                )}

                {!isCollapsed && (
                    <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
                        <FaChevronLeft />
                    </button>
                )}
            </div>

            {isCollapsed && (
                <div className="flex justify-center mb-4">
                    <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
                        <FaChevronRight />
                    </button>
                </div>
            )}

            <div className={`mx-3 mb-4 p-3 bg-gray-800 rounded-lg flex items-center gap-3 border border-gray-700 ${isCollapsed ? 'justify-center mx-2' : ''}`}>
                <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-lg overflow-hidden">
                    {session?.user?.image ? (
                        <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <FaUserCircle size={24} />
                    )}
                </div>
                {!isCollapsed && (
                    <div className="overflow-hidden">
                        <p className="font-semibold text-sm text-white truncate">{session?.user?.name || "Staff"}</p>
                        <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-3 space-y-2 mt-4">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                                ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                } ${isCollapsed ? 'justify-center px-0' : 'gap-3'}`}
                            title={isCollapsed ? link.label : ""}
                        >
                            <Icon className="text-xl min-w-[20px]" />
                            {!isCollapsed && <span className="whitespace-nowrap">{link.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={() => signOut()}
                    className={`flex items-center px-4 py-3 w-full text-left text-red-400 hover:bg-gray-800 rounded-lg transition-colors ${isCollapsed ? 'justify-center px-0' : 'gap-3'}`}
                    title="Sign Out"
                >
                    <FaSignOutAlt className="text-xl min-w-[20px]" />
                    {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
                </button>
            </div>
        </motion.div>
    );
}

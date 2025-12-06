"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaUserGraduate, FaChalkboardTeacher, FaBed, FaChartLine, FaUserPlus, FaDoorOpen, FaFileAlt, FaCog, FaHistory, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";
import { AttendancePieChart, OccupancyBarChart, ActivityAreaChart } from "@/components/admin/DashboardCharts";

interface DashboardStats {
    students: number;
    staff: number;
    rooms: number;
    capacity: number;
    occupied: number;
    attendance: { name: string; value: number }[];
    occupancy: { name: string; occupied: number; capacity: number }[];
    activity: { name: string; value: number }[];
}

interface User {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "STAFF" | "STUDENT";
    createdAt: string;
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<DashboardStats>({
        students: 0,
        staff: 0,
        rooms: 0,
        capacity: 0,
        occupied: 0,
        attendance: [],
        occupancy: [],
        activity: [],
    });
    const [recentUsers, setRecentUsers] = useState<User[]>([]);

    useEffect(() => {
        // Fetch Stats
        fetch("/api/admin/stats")
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) setStats(data);
            })
            .catch((err) => console.error(err));

        // Fetch Recent Activity (Users)
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setRecentUsers(data.slice(0, 5)); // Get top 5 most recent
                }
            })
            .catch((err) => console.error(err));
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-3 md:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 mt-12 md:mt-0"
                >
                    <div className="w-full md:w-auto">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-base md:text-lg">Welcome back, <span className="font-semibold text-violet-600 dark:text-violet-400">{session?.user?.name}</span></p>
                    </div>
                    <div className="w-full md:w-auto px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium flex items-center justify-center md:block">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6"
                >
                    {/* Students Card */}
                    <motion.div variants={item} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 dark:bg-blue-900/10 rounded-bl-[3rem] -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-1.5">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <FaUserGraduate size={18} />
                                </div>
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Students</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-0.5">{stats.students}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Total Registered</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Staff Card */}
                    <motion.div variants={item} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-[3rem] -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-1.5">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                    <FaChalkboardTeacher size={18} />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Staff</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-0.5">{stats.staff}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Active Members</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Occupancy Card */}
                    <motion.div variants={item} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-violet-50 dark:bg-violet-900/10 rounded-bl-[3rem] -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-1.5">
                                <div className="p-2 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg">
                                    <FaBed size={18} />
                                </div>
                                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Occupancy</span>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1.5 mb-1.5">
                                    <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">{stats.occupied}</h3>
                                    <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">/ {stats.capacity} Beds</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-violet-500 h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${stats.capacity > 0 ? (stats.occupied / stats.capacity) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Analytics Charts - Top Row */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
                >
                    {/* Attendance */}
                    <motion.div variants={item} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Attendance Overview</h3>
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <FaChartLine />
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <AttendancePieChart data={stats.attendance} />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-700 pt-4">
                            <div>
                                <span className="block font-bold text-slate-700 dark:text-slate-200">
                                    {stats.attendance?.reduce((acc, curr) => acc + curr.value, 0) || 0}
                                </span>
                                <span className="text-xs">Total</span>
                            </div>
                            <div>
                                <span className="block font-bold text-emerald-600 dark:text-emerald-400">
                                    {stats.attendance?.find(a => a.name === "Present")?.value || 0}
                                </span>
                                <span className="text-xs">Present</span>
                            </div>
                            <div>
                                <span className="block font-bold text-rose-500 dark:text-rose-400">
                                    {stats.attendance?.find(a => a.name === "Absent")?.value || 0}
                                </span>
                                <span className="text-xs">Absent</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Occupancy */}
                    <motion.div variants={item} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Room Occupancy</h3>
                            <div className="p-2 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg">
                                <FaBed />
                            </div>
                        </div>
                        <OccupancyBarChart data={stats.occupancy} />
                    </motion.div>
                </motion.div>

                {/* Analytics Charts - Bottom Row (Full Width) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 mb-10"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Activity Trends</h3>
                            <p className="text-slate-400 dark:text-slate-500 text-xs">Weekly login and attendance activity</p>
                        </div>
                        <select className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-violet-500 w-full md:w-auto">
                            <option>This Week</option>
                            <option>Last Week</option>
                            <option>This Month</option>
                        </select>
                    </div>
                    <div className="h-[350px]">
                        <ActivityAreaChart data={stats.activity.length > 0 ? stats.activity : [
                            { name: 'Mon', value: 0 },
                            { name: 'Tue', value: 0 },
                            { name: 'Wed', value: 0 },
                            { name: 'Thu', value: 0 },
                            { name: 'Fri', value: 0 },
                            { name: 'Sat', value: 0 },
                            { name: 'Sun', value: 0 },
                        ]} />
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                                <FaChartLine />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Quick Actions</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/admin/users" className="group">
                                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-300 h-full bg-white dark:bg-slate-800">
                                    <div className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                        <FaUserPlus size={20} />
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm group-hover:text-violet-700 dark:group-hover:text-violet-400">Add User</span>
                                </div>
                            </Link>
                            <Link href="/admin/rooms" className="group">
                                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-300 h-full bg-white dark:bg-slate-800">
                                    <div className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                        <FaDoorOpen size={20} />
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm group-hover:text-violet-700 dark:group-hover:text-violet-400">Manage Rooms</span>
                                </div>
                            </Link>
                            {/* Placeholders for future features */}
                            <button className="group w-full" onClick={() => alert("Reports feature coming soon!")}>
                                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-300 h-full bg-white dark:bg-slate-800">
                                    <div className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                        <FaFileAlt size={20} />
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm group-hover:text-violet-700 dark:group-hover:text-violet-400">Generate Reports</span>
                                </div>
                            </button>
                            <button className="group w-full" onClick={() => alert("Settings feature coming soon!")}>
                                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-300 h-full bg-white dark:bg-slate-800">
                                    <div className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                        <FaCog size={20} />
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm group-hover:text-violet-700 dark:group-hover:text-violet-400">Settings</span>
                                </div>
                            </button>
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                    <FaHistory />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Activity</h2>
                            </div>
                            <Link href="/admin/users" className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1">
                                View All <FaArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentUsers.length > 0 ? (
                                recentUsers.map((user, index) => (
                                    <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                                            ${index % 3 === 0 ? "bg-gradient-to-br from-violet-400 to-violet-600 shadow-violet-500/20" :
                                                index % 3 === 1 ? "bg-gradient-to-br from-pink-400 to-pink-600 shadow-pink-500/20" :
                                                    "bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/20"}`}
                                        >
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">{user.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Joined as {user.role.toLowerCase()}</p>
                                        </div>
                                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                                            {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-4">No recent activity.</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

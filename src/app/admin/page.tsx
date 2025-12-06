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
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-10"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800">Dashboard</h1>
                        <p className="text-slate-500 mt-2 text-lg">Welcome back, <span className="font-semibold text-violet-600">{session?.user?.name}</span></p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 text-sm font-medium">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10"
                >
                    {/* Students Card */}
                    <motion.div variants={item} className="bg-gradient-to-br from-blue-500 to-blue-600 p-1 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="bg-white p-7 rounded-xl h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg shadow-sm">
                                        <FaUserGraduate size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wide">Students</span>
                                </div>
                                <h3 className="text-4xl font-bold text-slate-800 mb-1">{stats.students}</h3>
                                <p className="text-slate-500 text-sm">Total Registered Students</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Staff Card */}
                    <motion.div variants={item} className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-1 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="bg-white p-7 rounded-xl h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg shadow-sm">
                                        <FaChalkboardTeacher size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wide">Staff</span>
                                </div>
                                <h3 className="text-4xl font-bold text-slate-800 mb-1">{stats.staff}</h3>
                                <p className="text-slate-500 text-sm">Total Active Staff</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Occupancy Card */}
                    <motion.div variants={item} className="bg-gradient-to-br from-violet-500 to-violet-600 p-1 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="bg-white p-7 rounded-xl h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-violet-100 text-violet-600 rounded-lg shadow-sm">
                                        <FaBed size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-full uppercase tracking-wide">Occupancy</span>
                                </div>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <h3 className="text-4xl font-bold text-slate-800">{stats.occupied}</h3>
                                    <span className="text-slate-400 font-medium">/ {stats.capacity}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
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
                    <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Attendance Overview</h3>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <FaChartLine />
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <AttendancePieChart data={[
                                { name: 'Present', value: 45 },
                                { name: 'Absent', value: 10 },
                                { name: 'Leave', value: 5 },
                            ]} />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm text-slate-500 border-t border-slate-50 pt-4">
                            <div>
                                <span className="block font-bold text-slate-700">60</span>
                                <span className="text-xs">Total</span>
                            </div>
                            <div>
                                <span className="block font-bold text-emerald-600">75%</span>
                                <span className="text-xs">Present</span>
                            </div>
                            <div>
                                <span className="block font-bold text-rose-500">25%</span>
                                <span className="text-xs">Absent</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Occupancy */}
                    <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Room Occupancy</h3>
                            <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                                <FaBed />
                            </div>
                        </div>
                        <OccupancyBarChart data={[
                            { name: 'Block A', occupied: 80, capacity: 100 },
                            { name: 'Block B', occupied: 45, capacity: 60 },
                            { name: 'Block C', occupied: 90, capacity: 120 },
                            { name: 'Block D', occupied: 20, capacity: 50 },
                        ]} />
                    </motion.div>
                </motion.div>

                {/* Analytics Charts - Bottom Row (Full Width) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 mb-10"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Activity Trends</h3>
                            <p className="text-slate-400 text-xs">Weekly login and attendance activity</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-violet-500 w-full md:w-auto">
                            <option>This Week</option>
                            <option>Last Week</option>
                            <option>This Month</option>
                        </select>
                    </div>
                    <div className="h-[350px]">
                        <ActivityAreaChart data={[
                            { name: 'Mon', value: 20 },
                            { name: 'Tue', value: 35 },
                            { name: 'Wed', value: 50 },
                            { name: 'Thu', value: 45 },
                            { name: 'Fri', value: 60 },
                            { name: 'Sat', value: 30 },
                            { name: 'Sun', value: 25 },
                        ]} />
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-100 p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <FaChartLine />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/admin/users" className="group">
                                <div className="p-4 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-violet-500 hover:bg-violet-50 transition-all duration-300 h-full">
                                    <div className="p-3 bg-slate-100 text-slate-600 rounded-full group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                                        <FaUserPlus size={20} />
                                    </div>
                                    <span className="font-semibold text-slate-700 text-sm group-hover:text-violet-700">Add User</span>
                                </div>
                            </Link>
                            <Link href="/admin/rooms" className="group">
                                <div className="p-4 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-violet-500 hover:bg-violet-50 transition-all duration-300 h-full">
                                    <div className="p-3 bg-slate-100 text-slate-600 rounded-full group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                                        <FaDoorOpen size={20} />
                                    </div>
                                    <span className="font-semibold text-slate-700 text-sm group-hover:text-violet-700">Manage Rooms</span>
                                </div>
                            </Link>
                            {/* Placeholders for future features */}
                            <button className="group" onClick={() => alert("Reports feature coming soon!")}>
                                <div className="p-4 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-violet-500 hover:bg-violet-50 transition-all duration-300 h-full">
                                    <div className="p-3 bg-slate-100 text-slate-600 rounded-full group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                                        <FaFileAlt size={20} />
                                    </div>
                                    <span className="font-semibold text-slate-700 text-sm group-hover:text-violet-700">Generate Reports</span>
                                </div>
                            </button>
                            <button className="group" onClick={() => alert("Settings feature coming soon!")}>
                                <div className="p-4 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-violet-500 hover:bg-violet-50 transition-all duration-300 h-full">
                                    <div className="p-3 bg-slate-100 text-slate-600 rounded-full group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                                        <FaCog size={20} />
                                    </div>
                                    <span className="font-semibold text-slate-700 text-sm group-hover:text-violet-700">Settings</span>
                                </div>
                            </button>
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <FaHistory />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
                            </div>
                            <Link href="/admin/users" className="text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1">
                                View All <FaArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentUsers.length > 0 ? (
                                recentUsers.map((user, index) => (
                                    <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                                            ${index % 3 === 0 ? "bg-gradient-to-br from-violet-400 to-violet-600" :
                                                index % 3 === 1 ? "bg-gradient-to-br from-pink-400 to-pink-600" :
                                                    "bg-gradient-to-br from-blue-400 to-blue-600"}`}
                                        >
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-800 text-sm truncate">{user.name}</p>
                                            <p className="text-xs text-slate-500 truncate">Joined as {user.role.toLowerCase()}</p>
                                        </div>
                                        <span className="text-xs font-medium text-slate-400">
                                            {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm text-center py-4">No recent activity.</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

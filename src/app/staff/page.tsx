"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaUserGraduate, FaExclamationCircle, FaClock } from "react-icons/fa";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { OccupancyBarChart } from "@/components/admin/DashboardCharts";
import StaffLoading from "./loading";

interface DashboardStats {
    students: number;
    complaints: { pending: number; resolved: number; total: number };
    leaves: { pending: number; approved: number; rejected: number; total: number };
    recentActivity: {
        complaints: { id: string; title: string; createdAt: string; type: string; student: { name: string; profile: { profileImage: string } } }[];
        leaves: { id: string; reason: string; fromDate: string; student: { name: string; profile: { profileImage: string } } }[];
    };
    occupancy?: { name: string; occupied: number; capacity: number }[];
}

export default function StaffDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<DashboardStats>({
        students: 0,
        complaints: { pending: 0, resolved: 0, total: 0 },
        leaves: { pending: 0, approved: 0, rejected: 0, total: 0 },
        recentActivity: { complaints: [], leaves: [] }
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/staff/stats")
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) setStats(data);
            })
            .catch((err) => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <StaffLoading />;
    }

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const complaintData = [
        { name: "Pending", value: stats.complaints.pending, color: "#f43f5e" },
        { name: "Resolved", value: stats.complaints.resolved, color: "#10b981" },
    ];

    const leaveData = [
        { name: "Pending", value: stats.leaves.pending },
        { name: "Approved", value: stats.leaves.approved },
        { name: "Rejected", value: stats.leaves.rejected },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 p-3 md:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-12 md:mt-0"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                            Dashboard
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Welcome back, {session?.user?.name}
                        </p>
                    </div>
                    <div className="w-full md:w-auto text-left md:text-right bg-white dark:bg-slate-800 md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none border border-slate-100 md:border-none shadow-sm md:shadow-none">
                        <p className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Today's Date</p>
                        <p className="text-xl font-bold text-slate-700 dark:text-slate-200">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                {/* Stats Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-5"
                >
                    <motion.div variants={item} className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl p-4 text-white shadow-lg shadow-violet-200 dark:shadow-none relative overflow-hidden group transform hover:scale-[1.02] hover:shadow-2xl transition-all duration-300">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-1.5">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <FaUserGraduate size={18} />
                                </div>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide">Total</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-0.5">{stats.students}</h3>
                            <p className="text-violet-100 text-xs font-medium">Registered Students</p>
                        </div>
                    </motion.div>

                    <motion.div variants={item} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 relative overflow-hidden group hover:border-rose-100 dark:hover:border-rose-900/50 transform hover:scale-[1.02] hover:shadow-2xl transition-all duration-300">
                        <div className="absolute right-0 top-0 w-20 h-20 bg-rose-50 dark:bg-rose-900/10 rounded-bl-full -mr-4 -mt-4 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/20 transition-colors pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-1.5">
                                <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg">
                                    <FaExclamationCircle size={18} />
                                </div>
                                <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Action Needed</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-0.5">{stats.complaints.pending}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Pending Complaints</p>
                        </div>
                    </motion.div>

                    <motion.div variants={item} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 relative overflow-hidden group hover:border-amber-100 dark:hover:border-amber-900/50 transform hover:scale-[1.02] hover:shadow-2xl transition-all duration-300">
                        <div className="absolute right-0 top-0 w-20 h-20 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -mr-4 -mt-4 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/20 transition-colors pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-1.5">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                                    <FaClock size={18} />
                                </div>
                                <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Review</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-0.5">{stats.leaves.pending}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Leave Requests</p>
                        </div>
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Charts Section */}
                    <div className="space-y-8">
                        {/* Occupancy Chart */}
                        {stats.occupancy && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
                            >
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Room Occupancy (By Block)</h3>
                                <OccupancyBarChart data={stats.occupancy} />
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Complaint Status</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={complaintData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {complaintData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }} itemStyle={{ color: '#1e293b' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Leave Requests</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={leaveData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip cursor={{ fill: '#f1f5f9', opacity: 0.2 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }} itemStyle={{ color: '#1e293b' }} />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                                                {leaveData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={
                                                        entry.name === 'Pending' ? '#fbbf24' :
                                                            entry.name === 'Approved' ? '#34d399' : '#f43f5e'
                                                    } />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Recent Alerts Feed */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
                    >
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Recent Alerts</h3>
                        <div className="space-y-4">
                            {stats.recentActivity.complaints.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Complaints</p>
                                    {stats.recentActivity.complaints.map((c) => (
                                        <div key={c.id} className="flex gap-3 items-start p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:scale-[1.01] transition-all cursor-pointer">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{c.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">by {c.student.name} • {new Date(c.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {stats.recentActivity.leaves.length > 0 && (
                                <div className="space-y-3 mt-6">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Leave Requests</p>
                                    {stats.recentActivity.leaves.map((l) => (
                                        <div key={l.id} className="flex gap-3 items-start p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:scale-[1.01] transition-all cursor-pointer">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{l.reason}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">by {l.student.name} • From: {new Date(l.fromDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {stats.recentActivity.complaints.length === 0 && stats.recentActivity.leaves.length === 0 && (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    No recent alerts to show.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Quick Actions</h2>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                >
                    <a href="/staff/students" className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-700 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FaUserGraduate size={18} />
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Student Directory</span>
                    </a>

                    <a href="/staff/leaves" className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-700 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FaClock size={18} />
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Approve Leaves</span>
                    </a>

                    <a href="/staff/complaints" className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-700 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FaExclamationCircle size={18} />
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">View Complaints</span>
                    </a>
                </motion.div>
            </div>
        </div>
    );
}

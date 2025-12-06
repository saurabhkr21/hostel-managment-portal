"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaUserGraduate, FaExclamationCircle, FaClock } from "react-icons/fa";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function StaffDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        students: 0,
        complaints: { pending: 0, resolved: 0, total: 0 },
        leaves: { pending: 0, approved: 0, rejected: 0, total: 0 },
    });

    useEffect(() => {
        fetch("/api/staff/stats")
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) setStats(data);
            })
            .catch((err) => console.error(err));
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const complaintData = [
        { name: "Pending", value: stats.complaints.pending, color: "#f43f5e" }, // Rose-500
        { name: "Resolved", value: stats.complaints.resolved, color: "#10b981" }, // Emerald-500
    ];

    const leaveData = [
        { name: "Pending", value: stats.leaves.pending },
        { name: "Approved", value: stats.leaves.approved },
        { name: "Rejected", value: stats.leaves.rejected },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                            Warden/Supervisor Dashboard
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Welcome back, <span className="font-bold text-slate-800">{session?.user?.name}</span>
                        </p>
                    </div>
                    <div className="px-5 py-2.5 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
                >
                    <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                <FaUserGraduate size={24} />
                            </div>
                            <p className="text-slate-500 font-medium text-sm">Total Students</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.students}</h3>
                        </div>
                    </motion.div>

                    <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-50 to-rose-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-4">
                                <FaExclamationCircle size={24} />
                            </div>
                            <p className="text-slate-500 font-medium text-sm">Pending Complaints</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.complaints.pending}</h3>
                        </div>
                    </motion.div>

                    <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-50 to-amber-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                                <FaClock size={24} />
                            </div>
                            <p className="text-slate-500 font-medium text-sm">Pending Leaves</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.leaves.pending}</h3>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Charts Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10"
                >
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <FaExclamationCircle className="text-violet-500" />
                            Complaints Resolution
                        </h3>
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
                                    >
                                        {complaintData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <FaClock className="text-amber-500" />
                            Leave Request Status
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={leaveData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40}>
                                        {
                                            leaveData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={
                                                    entry.name === 'Pending' ? '#f59e0b' :
                                                        entry.name === 'Approved' ? '#10b981' :
                                                            '#f43f5e'
                                                } />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>

                <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h2>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <a href="/staff/students" className="p-6 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl shadow-lg shadow-violet-200 text-white hover:scale-[1.02] transition-transform group">
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                            <FaUserGraduate size={24} className="text-white" />
                        </div>
                        <h3 className="text-lg font-bold">Manage Students</h3>
                        <p className="text-white/80 text-sm mt-1">View and edit student profiles</p>
                    </a>

                    <a href="/staff/leaves" className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-violet-200 hover:shadow-md transition-all group">
                        <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-amber-600 group-hover:scale-110 transition-transform">
                            <FaClock size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Leave Requests</h3>
                        <p className="text-slate-500 text-sm mt-1">Approve or reject leaves</p>
                    </a>

                    <a href="/staff/complaints" className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-violet-200 hover:shadow-md transition-all group">
                        <div className="bg-rose-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-rose-600 group-hover:scale-110 transition-transform">
                            <FaExclamationCircle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-rose-600 transition-colors">Complaints</h3>
                        <p className="text-slate-500 text-sm mt-1">Resolve student issues</p>
                    </a>
                </motion.div>
            </div>
        </div>
    );
}

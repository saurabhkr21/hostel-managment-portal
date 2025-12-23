"use client";

import { useState, useEffect } from "react";
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaChartPie } from "react-icons/fa";
import { motion } from "framer-motion";

interface AttendanceRecord {
    id: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LEAVE";
    markedBy: string;
}

export default function StudentAttendancePage() {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ present: 0, absent: 0, leave: 0, total: 0 });

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await fetch("/api/attendance");
            const data = await res.json();
            if (!data.error) {
                setAttendance(data);
                calculateStats(data);
            }
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: AttendanceRecord[]) => {
        const stats = data.reduce(
            (acc, curr) => {
                acc.total++;
                if (curr.status === "PRESENT") acc.present++;
                else if (curr.status === "ABSENT") acc.absent++;
                else if (curr.status === "LEAVE") acc.leave++;
                return acc;
            },
            { present: 0, absent: 0, leave: 0, total: 0 }
        );
        setStats(stats);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PRESENT":
                return <FaCheckCircle className="text-emerald-500" />;
            case "ABSENT":
                return <FaTimesCircle className="text-rose-500" />;
            case "LEAVE":
                return <FaExclamationTriangle className="text-amber-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PRESENT":
                return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
            case "ABSENT":
                return "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800";
            case "LEAVE":
                return "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
            default:
                return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700";
        }
    };

    const StatCard = ({ title, value, color, icon: Icon, delay }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 relative overflow-hidden group`}
        >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110 ${color}`}></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
                    <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('bg-', 'text-').replace('500', '600')} dark:${color.replace('bg-', 'text-').replace('500', '400')}`}>
                        <Icon className={`text-xl ${color.replace('bg-', 'text-').replace('500', '600')} dark:${color.replace('bg-', 'text-').replace('500', '400')}`} />
                    </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
                {stats.total > 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        {((value / stats.total) * 100).toFixed(1)}% of total days
                    </p>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-0.5 md:p-6 m-3 md:m-0 md:pt-6 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="ml-16 md:ml-0 text-2xl font-bold text-slate-800 dark:text-white">Attendance Overview</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your daily attendance performance</p>
                    </div>
                    <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                        Total Days: {stats.total}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Present"
                        value={stats.present}
                        color="bg-emerald-500"
                        icon={FaCheckCircle}
                        delay={0.1}
                    />
                    <StatCard
                        title="Absent"
                        value={stats.absent}
                        color="bg-rose-500"
                        icon={FaTimesCircle}
                        delay={0.2}
                    />
                    <StatCard
                        title="On Leave"
                        value={stats.leave}
                        color="bg-amber-500"
                        icon={FaExclamationTriangle}
                        delay={0.3}
                    />
                </div>

                {/* Attendance List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                        <h2 className="font-bold text-slate-700 dark:text-slate-200 text-lg flex items-center gap-2">
                            <FaCalendarAlt className="text-violet-500" />
                            Attendance History
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Day</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Marked By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {attendance.map((record, index) => (
                                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                                            {new Date(record.date).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">
                                            {new Date(record.date).toLocaleDateString(undefined, { weekday: "long" })}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(record.status)}`}>
                                                {getStatusIcon(record.status)}
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500 dark:text-slate-500 text-sm">
                                            {record.markedBy}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {attendance.length === 0 && !loading && (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                                    <FaCalendarAlt size={24} />
                                </div>
                                <h3 className="text-slate-800 dark:text-white font-medium mb-1">No attendance records found</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Your attendance history will appear here once marked.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

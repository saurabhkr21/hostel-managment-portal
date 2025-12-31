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
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

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

    const filteredAttendance = attendance.filter(record => {
        const d = new Date(record.date);
        return d.getMonth() + 1 === Number(selectedMonth) && d.getFullYear() === Number(selectedYear);
    });

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

    const StatCard = ({ title, value, color, icon: Icon, delay }: any) => {
        const percentage = stats.total > 0 ? ((value / stats.total) * 100).toFixed(1) : "0.0";
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group h-full"
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-slate-100 to-transparent dark:from-slate-700/30 opacity-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />

                <div className="flex items-center justify-between gap-3 relative z-10 w-full h-full">
                    <div className="flex flex-col justify-between h-full py-0.5">
                        <div>
                            <p className="text-[11px] md:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">{title}</p>
                            <h3 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">{value}</h3>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 dark:bg-slate-700/50 rounded-full w-fit border border-slate-100 dark:border-slate-600">
                            <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                            <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400">
                                {percentage}%
                            </span>
                        </div>
                    </div>
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center ${color} bg-opacity-10 dark:bg-opacity-20 shrink-0 transition-transform group-hover:rotate-12 duration-300`}>
                        <Icon className={`text-2xl md:text-3xl ${color.replace('bg-', 'text-')}`} />
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 pt-16 pb-4 px-2 md:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center md:mt-0"
                >
                    <div>
                        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                            Attendance
                        </h1>
                        <p className="hidden md:block text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">
                            Track your presence and attendance history
                        </p>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 md:gap-6">
                    <StatCard
                        title="Present"
                        value={stats.present}
                        color="bg-emerald-300"
                        icon={FaCheckCircle}
                        delay={0.1}
                    />
                    <StatCard
                        title="Absent"
                        value={stats.absent}
                        color="bg-rose-300"
                        icon={FaTimesCircle}
                        delay={0.2}
                    />
                    <StatCard
                        title="Leave"
                        value={stats.leave}
                        color="bg-amber-300"
                        icon={FaExclamationTriangle}
                        delay={0.3}
                    />
                </div>

                {/* Month Register & Attendance History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                    <div className="bg-[#7BB031] p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <FaCalendarAlt className="text-white opacity-60" />
                            <span className="text-white font-bold text-base md:text-lg tracking-tight">Register</span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs md:text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md transition-all font-bold min-w-[100px] outline-none hover:cursor-pointer"
                            >
                                {months.map((m, i) => (
                                    <option key={m} value={i + 1} className="text-slate-800">{m}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs md:text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md transition-all font-bold min-w-[80px] outline-none hover:cursor-pointer"
                            >
                                {years.map(y => (
                                    <option key={y} value={y} className="text-slate-800">{y}</option>
                                ))}
                            </select>
                            <button className="flex-1 sm:flex-none bg-white text-[#7BB031] px-5 py-2 rounded-xl text-xs md:text-sm font-black hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                                View
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-3 flex justify-around md:justify-end md:gap-8 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#008000] shadow-sm shadow-green-200 dark:shadow-none" />
                            <span className="text-[11px] md:text-sm font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">Present</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FF0000] shadow-sm shadow-red-200 dark:shadow-none" />
                            <span className="text-[11px] md:text-sm font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">Absent</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FFA500] shadow-sm shadow-orange-200 dark:shadow-none" />
                            <span className="text-[11px] md:text-sm font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">Leave</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-700">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="p-2 md:p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="p-2 md:p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Day</th>
                                    <th className="p-2 md:p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="hidden md:table-cell p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Marked By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredAttendance.length > 0 ? (
                                    filteredAttendance.map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="p-3 md:p-4 font-bold text-slate-800 dark:text-slate-300 text-xs md:text-sm">
                                                {new Date(record.date).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </td>
                                            <td className="p-3 md:p-4 text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium capitalize">
                                                {new Date(record.date).toLocaleDateString(undefined, { weekday: "short" })}
                                            </td>
                                            <td className="p-3 md:p-4 text-center md:text-left">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1 rounded-full text-[11px] md:text-xs font-bold border ${getStatusColor(record.status)}`}>
                                                    {getStatusIcon(record.status)}
                                                    <span className="hidden md:inline">{record.status}</span>
                                                </span>
                                            </td>
                                            <td className="hidden md:table-cell p-4 text-slate-500 dark:text-slate-500 text-sm">
                                                {record.markedBy}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                                                <FaCalendarAlt size={24} />
                                            </div>
                                            <h3 className="text-slate-800 dark:text-white font-medium mb-1">No attendance records for {months[selectedMonth - 1]} {selectedYear}</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">Try selecting a different month or year.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}

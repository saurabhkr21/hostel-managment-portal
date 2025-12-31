"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaGraduationCap, FaHome, FaAward, FaChalkboardTeacher, FaExclamationCircle, FaChartLine, FaPhone, FaEnvelope, FaCalendarAlt, FaUniversity, FaLaptopCode, FaLayerGroup, FaIdCard, FaSchool, FaBook, FaUserGraduate, FaUserShield, FaMapMarkerAlt, FaTint, FaDoorOpen } from "react-icons/fa";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the chart to optimize initial bundle size
const ActivityAreaChart = dynamic(() => import("@/components/admin/DashboardCharts").then(mod => mod.ActivityAreaChart), {
    loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />,
    ssr: false
});

interface StudentInfo {
    name: string;
    email: string;
    createdAt: string;
    profile: {
        profileImage?: string;
        phone?: string;
        address?: string;
        guardianName?: string;
        guardianPhone?: string;
        fatherName?: string;
        motherName?: string;
        gender?: string;
        dob?: string;
        bloodGroup?: string;
        category?: string;
        college?: string;
        course?: string;
        branch?: string;
        yearSem?: string;
        section?: string;
        rollNo?: string;
        enrollNo?: string;
        studentType?: string;
        highSchoolPercentage?: number;
        intermediatePercentage?: number;
        graduationPercentage?: number;
    };
    room?: {
        roomNumber: string;
    };
}

export default function StudentDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("program");
    const [stats, setStats] = useState({ present: 0, absent: 0, leave: 0, total: 0 });
    const [chartData, setChartData] = useState<any[]>([]);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: info, error: infoError, isLoading } = useSWR<StudentInfo>("/api/student/info", fetcher);
    const { data: attendanceData } = useSWR("/api/attendance", fetcher);

    useEffect(() => {
        if (attendanceData) {
            const newStats = attendanceData.reduce(
                (acc: any, curr: any) => {
                    acc.total++;
                    if (curr.status === "PRESENT") acc.present++;
                    else if (curr.status === "ABSENT") acc.absent++;
                    else if (curr.status === "LEAVE") acc.leave++;
                    return acc;
                },
                { present: 0, absent: 0, leave: 0, total: 0 }
            );
            setStats(newStats);

            const weeks: { [key: string]: { present: number, total: number } } = {};
            attendanceData.forEach((record: any) => {
                const date = new Date(record.date);
                const weekNum = Math.ceil(date.getDate() / 7);
                const week = `Week ${weekNum}`;
                if (!weeks[week]) weeks[week] = { present: 0, total: 0 };
                weeks[week].total++;
                if (record.status === "PRESENT") weeks[week].present++;
            });

            const newChartData = Object.keys(weeks).sort().map(w => ({
                name: w,
                value: Math.round((weeks[w].present / weeks[w].total) * 100)
            }));
            setChartData(newChartData.length > 0 ? newChartData : [
                { name: 'Week 1', value: 0 },
                { name: 'Week 2', value: 0 },
                { name: 'Week 3', value: 0 },
                { name: 'Week 4', value: 0 },
            ]);
        }
    }, [attendanceData]);

    const presentPercent = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    const absentPercent = stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0;
    const leavePercent = stats.total > 0 ? Math.round((stats.leave / stats.total) * 100) : 0;

    const tabs = [
        { id: "program", label: "Program & Education", icon: FaGraduationCap },
        { id: "family", label: "Family & Address", icon: FaHome },
        { id: "facility", label: "Facility & Awards", icon: FaAward },
        { id: "attendance", label: "Attendance", icon: FaChartLine },
    ];

    if (isLoading || !info) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans transition-colors duration-300">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-6 w-48" />
                        </div>
                        <Skeleton className="h-12 w-48 rounded-xl" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4">
                            <Skeleton className="h-[500px] w-full rounded-2xl" />
                        </div>
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex gap-3">
                                <Skeleton className="h-12 w-32 rounded-lg" />
                                <Skeleton className="h-12 w-32 rounded-lg" />
                                <Skeleton className="h-12 w-32 rounded-lg" />
                            </div>
                            <Skeleton className="h-[400px] w-full rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-8 px-4 md:p-8 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:mt-0"
                >
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                            My Dashboard
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                            Welcome back, <span className="font-semibold text-violet-600 dark:text-violet-400">{session?.user?.name}</span>
                        </p>
                    </div>
                    <div className="hidden md:flex w-full md:w-auto px-5 py-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium items-center justify-center md:justify-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Profile Card (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-100 dark:border-slate-700 group"
                        >
                            {/* Card Header with Glassmorphism feel */}
                            <div className="relative h-32 bg-linear-to-tr from-violet-600 to-indigo-600 overflow-hidden">
                                {/* Optimized: CSS Pattern instead of blocking image */}
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
                            </div>

                            <div className="px-6 relative pb-6">
                                {/* Profile Image */}
                                <div className="flex justify-center -mt-16 mb-6 relative z-10">
                                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                                        {info.profile.profileImage ? (
                                            <img src={info.profile.profileImage} alt={info.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <FaUser size={50} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{info.name}</h2>
                                    <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                        <FaEnvelope className="text-violet-400" />
                                        <span>{info.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                        <FaPhone className="text-violet-400" />
                                        <span>{info.profile.phone || "No Phone"}</span>
                                    </div>
                                    <div className="pt-4 flex justify-center gap-3">
                                        <span className="px-3 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full text-xs font-semibold uppercase tracking-wide border border-violet-100 dark:border-violet-800">
                                            {info.profile.studentType || "Student"}
                                        </span>
                                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wide border border-indigo-100 dark:border-indigo-800">
                                            {info.profile.rollNo || "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-slate-100 dark:bg-slate-700 mx-6"></div>

                            {/* Essential Details Grid */}
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <FaCalendarAlt size={14} className="opacity-70" />
                                        <span className="font-medium">Joined Date</span>
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-200 font-bold">{new Date(info.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <FaIdCard size={14} className="opacity-70" />
                                        <span className="font-medium">Student ID</span>
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-200 font-bold">{info.profile.enrollNo || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <FaDoorOpen size={14} className="opacity-70" />
                                        <span className="font-medium">Room No</span>
                                    </div>
                                    <span className="px-3 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-black ring-1 ring-green-200 dark:ring-green-900/50">
                                        {info.room?.roomNumber || "Unassigned"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <FaTint size={14} className="text-rose-500 opacity-70" />
                                        <span className="font-medium">Blood Group</span>
                                    </div>
                                    <span className="text-rose-600 dark:text-rose-400 font-black">{info.profile.bloodGroup || "N/A"}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Content Tabs (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Custom Tab Navigation */}
                        <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center w-full overflow-hidden">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 py-2.5 md:py-3.5 px-2 md:px-4 rounded-xl text-[10px] md:text-sm font-black transition-all duration-500 relative overflow-hidden group/tab
                                        ${activeTab === tab.id
                                            ? "bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-none"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"}
                                    `}
                                >
                                    <tab.icon className={`text-sm md:text-lg transition-transform duration-300 group-hover/tab:scale-110 ${activeTab === tab.id ? "text-white" : "text-slate-400"}`} />
                                    <span className="whitespace-nowrap uppercase tracking-tighter md:tracking-normal">{tab.label.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tab Panels */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 min-h-[500px] overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                {activeTab === "program" && (
                                    <motion.div
                                        key="program"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-6 md:p-8 space-y-8"
                                    >
                                        {/* Program Section */}
                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg">
                                                    <FaGraduationCap size={24} />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Academic Information</h3>
                                            </div>


                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {[
                                                    { label: "University", value: info.profile.college || "Quantum University", icon: FaUniversity, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
                                                    { label: "Course", value: info.profile.course, icon: FaGraduationCap, color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20" },
                                                    { label: "Branch", value: info.profile.branch, icon: FaLaptopCode, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
                                                    { label: "Current Year/Sem", value: info.profile.yearSem, icon: FaCalendarAlt, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
                                                    { label: "Section", value: info.profile.section, icon: FaLayerGroup, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" },
                                                    { label: "Student Type", value: info.profile.studentType || "Regular", icon: FaIdCard, color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20" },
                                                ].map((item, idx) => (
                                                    <div key={idx} className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 group hover:ring-2 hover:ring-violet-500/20 transition-all duration-300">
                                                        <div className={`p-3 rounded-xl ${item.color} shrink-0 transition-transform group-hover:scale-110 duration-300`}>
                                                            <item.icon size={20} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{item.label}</span>
                                                            <span className="text-slate-800 dark:text-slate-200 font-bold text-base md:text-lg truncate block leading-tight">{item.value || "N/A"}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        <div className="border-t border-slate-100 dark:border-slate-700"></div>

                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                                                    <FaAward size={24} />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Prior Education</h3>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {[
                                                    { label: "High School", value: info.profile.highSchoolPercentage, suffix: "%", icon: FaSchool, color: "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400" },
                                                    { label: "Intermediate", value: info.profile.intermediatePercentage, suffix: "%", icon: FaBook, color: "border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400" },
                                                    { label: "Graduation", value: info.profile.graduationPercentage, suffix: " CGPA", icon: FaUserGraduate, color: "border-violet-400 bg-violet-50/50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400" },
                                                ].map((edu, idx) => (
                                                    <div key={idx} className={`p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 duration-300 border-l-4 group flex flex-col gap-3 ${edu.color}`}>
                                                        <div className="flex items-center justify-between">
                                                            <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{edu.label}</span>
                                                            <edu.icon className="opacity-40 group-hover:scale-110 transition-transform" />
                                                        </div>
                                                        <span className="text-3xl font-extrabold text-slate-800 dark:text-white leading-none">
                                                            {edu.value ? `${edu.value}${edu.suffix}` : "N/A"}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </motion.div>
                                )}

                                {activeTab === "family" && (
                                    <motion.div
                                        key="family"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-6 md:p-8 space-y-8"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-rose-100 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 rounded-md">
                                                        <FaHome size={20} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Permanent Address</h3>
                                                </div>

                                                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex gap-4 ring-1 ring-slate-100 dark:ring-slate-700">
                                                    <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl h-fit">
                                                        <FaMapMarkerAlt className="text-rose-500 dark:text-rose-400" size={20} />
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">
                                                        {info.profile.address || "No address details available."}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-md">
                                                        <FaUser size={20} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Parent/Guardian</h3>
                                                </div>
                                                <div className="bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg">
                                                            <FaUser size={16} />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Father's Name</span>
                                                            <p className="font-bold text-slate-800 dark:text-slate-200">{info.profile.fatherName || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg">
                                                            <FaUser size={16} />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Mother's Name</span>
                                                            <p className="font-bold text-slate-800 dark:text-slate-200">{info.profile.motherName || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-lg">
                                                                <FaUserShield size={16} />
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Guardian Contact</span>
                                                                <p className="font-bold text-slate-800 dark:text-slate-200">{info.profile.guardianName || "N/A"}</p>
                                                            </div>
                                                        </div>
                                                        <div className="ml-11">
                                                            <span className="inline-flex items-center gap-2 text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                                                <FaPhone size={12} />
                                                                {info.profile.guardianPhone || "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "facility" && (
                                    <motion.div
                                        key="placeholder"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        className="flex flex-col items-center justify-center h-[500px] text-slate-400 dark:text-slate-500"
                                    >

                                        <div className="p-6 bg-slate-50 dark:bg-slate-700 rounded-full mb-4 animate-bounce">
                                            <FaExclamationCircle className="text-4xl text-slate-300 dark:text-slate-500" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">No Information Available</h3>
                                        <p className="text-sm">There are no details to show for this section yet.</p>
                                    </motion.div>
                                )}

                                {activeTab === "attendance" && (
                                    <motion.div
                                        key="attendance"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-6 md:p-8 space-y-6"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Attendance Stats</h3>
                                            <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full text-sm font-semibold">Current Semester</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden flex justify-between items-start">
                                                <div className="space-y-4">
                                                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Present</p>
                                                    <h3 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{presentPercent}%</h3>
                                                    <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">{stats.present} days total</p>
                                                </div>
                                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                                                    <div className="text-2xl text-emerald-600 dark:text-emerald-400">✓</div>
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden flex justify-between items-start">
                                                <div className="space-y-4">
                                                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Absent</p>
                                                    <h3 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{absentPercent}%</h3>
                                                    <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">{stats.absent} days total</p>
                                                </div>
                                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-rose-100 dark:bg-rose-900/30">
                                                    <div className="text-2xl text-rose-600 dark:text-rose-400">×</div>
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden flex justify-between items-start">
                                                <div className="space-y-4">
                                                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Leave</p>
                                                    <h3 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{leavePercent}%</h3>
                                                    <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">{stats.leave} days total</p>
                                                </div>
                                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
                                                    <div className="text-2xl text-amber-600 dark:text-amber-400">!</div>
                                                </div>
                                            </div>
                                        </div>


                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="h-[300px] w-full">
                                                <ActivityAreaChart data={chartData} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

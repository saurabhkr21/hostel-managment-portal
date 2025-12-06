"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaGraduationCap, FaHome, FaAward, FaChalkboardTeacher, FaExclamationCircle, FaChartLine } from "react-icons/fa";
import { ActivityAreaChart } from "@/components/admin/DashboardCharts";

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
    const [info, setInfo] = useState<StudentInfo | null>(null);
    const [activeTab, setActiveTab] = useState("program");

    useEffect(() => {
        fetch("/api/student/info")
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) setInfo(data);
            })
            .catch((err) => console.error(err));
    }, []);

    const tabs = [
        { id: "program", label: "Program and Education", color: "bg-sky-500", icon: FaGraduationCap },
        { id: "family", label: "Family And Address", color: "bg-rose-500", icon: FaHome },
        { id: "facility", label: "Facility And Award", color: "bg-amber-500", icon: FaAward },
        { id: "facility", label: "Facility And Award", color: "bg-amber-500", icon: FaAward },
        { id: "mentor", label: "Mentor And Minor/GE Details", color: "bg-emerald-500", icon: FaChalkboardTeacher },
        { id: "attendance", label: "My Attendance", color: "bg-indigo-500", icon: FaChartLine },
    ];

    if (!info) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">My Dashboard</h1>
                        <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-violet-600">{session?.user?.name}</span></p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 text-sm font-medium hidden md:block">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Column: Profile Card */}
                    <div className="lg:w-1/4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#8ac946] rounded-t-lg overflow-hidden shadow-lg"
                        >
                            <div className="p-8 flex flex-col items-center text-center">
                                <div className="w-32 h-32 rounded-full border-4 border-white/30 overflow-hidden mb-4 shadow-xl">
                                    {info.profile.profileImage ? (
                                        <img src={info.profile.profileImage} alt={info.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                                            <FaUser size={64} />
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider">{info.name}</h2>
                                <p className="text-white/80 text-sm mt-1">{info.profile.phone}</p>
                                <p className="text-white/80 text-sm">{info.email}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white shadow-lg rounded-b-lg p-6 space-y-4 text-sm"
                        >
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="font-semibold text-slate-700">Regis.Date :</span>
                                <span className="text-slate-600">{new Date(info.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="font-semibold text-slate-700">Student ID :</span>
                                <span className="text-slate-600">{info.profile.enrollNo || "N/A"}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="font-semibold text-slate-700">Roll No :</span>
                                <span className="text-slate-600 font-bold">{info.profile.rollNo || "N/A"}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="font-semibold text-slate-700">Father :</span>
                                <span className="text-slate-600 uppercase">{info.profile.fatherName || "N/A"}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="font-semibold text-slate-700">Mother :</span>
                                <span className="text-slate-600 uppercase">{info.profile.motherName || "N/A"}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="font-semibold text-slate-700">DOB :</span>
                                <span className="text-slate-600">{info.profile.dob ? new Date(info.profile.dob).toLocaleDateString() : "N/A"}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="font-semibold text-slate-700">Blood Group :</span>
                                <span className="text-slate-600">{info.profile.bloodGroup || "N/A"}</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Details Tabs */}
                    <div className="lg:w-3/4">
                        {/* Tabs Header */}
                        <div className="flex flex-wrap shadow-sm rounded-t-lg overflow-hidden">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-4 px-4 text-sm font-medium text-white transition-all duration-200 
                                        ${activeTab === tab.id ? tab.color : "bg-slate-400 hover:bg-slate-500"}
                                        ${activeTab === tab.id ? "shadow-inner" : ""}
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white shadow-lg p-6 min-h-[500px]">
                            <AnimatePresence mode="wait">
                                {activeTab === "program" && (
                                    <motion.div
                                        key="program"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        {/* Program Info Section */}
                                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                                            <div className="bg-[#8ac946] px-4 py-3 border-b border-white/20">
                                                <h3 className="text-white font-bold flex items-center gap-2">
                                                    <FaGraduationCap /> Program Information
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-white divide-y md:divide-y-0 text-sm">

                                                <div className="p-3 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                                                    <span className="block font-bold text-slate-700 mb-1">Student Type :</span>
                                                    <span className="text-slate-600">{info.profile.studentType || "Regular"}</span>
                                                </div>
                                                <div className="p-3 border-b md:border-b-0 md:border-r border-slate-100">
                                                    <span className="block font-bold text-slate-700 mb-1">University :</span>
                                                    <span className="text-slate-600">{info.profile.college || "Quantum University"}</span>
                                                </div>
                                                <div className="p-3 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                                                    <span className="block font-bold text-slate-700 mb-1">College :</span>
                                                    <span className="text-slate-600">{info.profile.college || "Quantum School of Technology"}</span>
                                                </div>
                                                <div className="p-3">
                                                    {/* Empty cell for layout balance */}
                                                </div>

                                                {/* Row 2 */}
                                                <div className="p-3 border-t border-r border-slate-100 bg-emerald-50/30">
                                                    <span className="block font-bold text-slate-700 mb-1">CourseType :</span>
                                                    <span className="text-slate-600">Engineering</span>
                                                </div>
                                                <div className="p-3 border-t border-r border-slate-100 bg-emerald-50/30">
                                                    <span className="block font-bold text-slate-700 mb-1">Course :</span>
                                                    <span className="text-slate-600 text-xs">{info.profile.course || "N/A"}</span>
                                                </div>
                                                <div className="p-3 border-t border-r border-slate-100 bg-emerald-50/30">
                                                    <span className="block font-bold text-slate-700 mb-1">Current Year/Sem :</span>
                                                    <span className="text-slate-600">{info.profile.yearSem || "N/A"}</span>
                                                </div>
                                                <div className="p-3 border-t border-slate-100 bg-emerald-50/30">
                                                    {/* Empty */}
                                                </div>

                                                {/* Row 3 */}
                                                <div className="p-3 border-t border-r border-slate-100">
                                                    <span className="block font-bold text-slate-700 mb-1">Branch :</span>
                                                    <span className="text-slate-600 text-xs">{info.profile.branch || "N/A"}</span>
                                                </div>
                                                <div className="p-3 border-t border-r border-slate-100">
                                                    <span className="block font-bold text-slate-700 mb-1">Section :</span>
                                                    <span className="text-slate-600">{info.profile.section || "N/A"}</span>
                                                </div>
                                                <div className="p-3 border-t border-r border-slate-100">
                                                    <span className="block font-bold text-slate-700 mb-1">SetAssign :</span>
                                                    <span className="text-slate-600">-</span>
                                                </div>
                                                <div className="p-3 border-t border-slate-100">
                                                </div>
                                            </div>
                                        </div>

                                        {/* Educational Info Section */}
                                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                                            <div className="bg-[#d97020] px-4 py-3 border-b border-white/20">
                                                <h3 className="text-white font-bold flex items-center gap-2">
                                                    <FaAward /> Educational Information
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 bg-white divide-x border-b border-slate-100">
                                                <div className="p-4">
                                                    <span className="block font-bold text-slate-700 mb-2">High School % :</span>
                                                    <span className="text-slate-600 font-medium">{info.profile.highSchoolPercentage ? `${info.profile.highSchoolPercentage}%` : "N/A"}</span>
                                                </div>
                                                <div className="p-4">
                                                    <span className="block font-bold text-slate-700 mb-2">Intermediate % :</span>
                                                    <span className="text-slate-600 font-medium">{info.profile.intermediatePercentage ? `${info.profile.intermediatePercentage}%` : "N/A"}</span>
                                                </div>
                                                <div className="p-4">
                                                    <span className="block font-bold text-slate-700 mb-2">Graduation % :</span>
                                                    <span className="text-slate-600 font-medium">{info.profile.graduationPercentage ? `${info.profile.graduationPercentage}%` : "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "family" && (
                                    <motion.div
                                        key="family"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                                            <div className="bg-rose-500 px-4 py-3">
                                                <h3 className="text-white font-bold flex items-center gap-2"><FaHome /> Permanent Address</h3>
                                            </div>
                                            <div className="p-6 bg-white">
                                                <p className="text-slate-600">{info.profile.address || "No address details available."}</p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                                            <div className="bg-rose-500 px-4 py-3">
                                                <h3 className="text-white font-bold flex items-center gap-2"><FaUser /> Guardian Details</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white">
                                                <div>
                                                    <span className="block text-xs font-bold text-slate-500 uppercase">Guardian Name</span>
                                                    <span className="text-slate-700 font-medium">{info.profile.guardianName || "N/A"}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-bold text-slate-500 uppercase">Guardian Phone</span>
                                                    <span className="text-slate-700 font-medium">{info.profile.guardianPhone || "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Placeholders for other tabs */}
                                {(activeTab === "facility" || activeTab === "mentor") && (
                                    <motion.div
                                        key="other"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex items-center justify-center h-64 text-slate-400"
                                    >
                                        <div className="text-center">
                                            <FaExclamationCircle className="mx-auto text-4xl mb-2 opacity-50" />
                                            <p>No details available for this section.</p>
                                        </div>
                                    </motion.div>
                                )}


                                {activeTab === "attendance" && (
                                    <motion.div
                                        key="attendance"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-white p-6 rounded-lg border border-slate-200">
                                            <h3 className="text-lg font-bold text-slate-800 mb-4">Monthly Attendance Trend</h3>
                                            <ActivityAreaChart data={[
                                                { name: 'Week 1', value: 90 },
                                                { name: 'Week 2', value: 85 },
                                                { name: 'Week 3', value: 95 },
                                                { name: 'Week 4', value: 100 },
                                            ]} />
                                            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                                <div className="p-3 bg-emerald-50 rounded-lg">
                                                    <span className="block text-2xl font-bold text-emerald-600">92%</span>
                                                    <span className="text-xs text-slate-500">Present</span>
                                                </div>
                                                <div className="p-3 bg-rose-50 rounded-lg">
                                                    <span className="block text-2xl font-bold text-rose-600">5%</span>
                                                    <span className="text-xs text-slate-500">Absent</span>
                                                </div>
                                                <div className="p-3 bg-amber-50 rounded-lg">
                                                    <span className="block text-2xl font-bold text-amber-600">3%</span>
                                                    <span className="text-xs text-slate-500">Leave</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

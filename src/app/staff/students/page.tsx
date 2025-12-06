"use client";

import { useState } from "react";
import { FaSearch, FaUserGraduate, FaBed, FaEye, FaIdCard, FaBuilding } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface Student {
    id: string;
    name: string | null;
    email: string;
    room: {
        roomNumber: string;
    } | null;
    profile?: {
        phone: string | null;
        profileImage?: string | null;
    } | null;
}

export default function StaffStudentsPage() {
    const [search, setSearch] = useState("");
    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: students, error, isLoading } = useSWR<Student[]>("/api/staff/students", fetcher);

    // Fallback empty array if undefined
    const safeStudents = students || [];

    const filteredStudents = safeStudents.filter(
        (student) =>
            student.email.toLowerCase().includes(search.toLowerCase()) ||
            (student.name || "").toLowerCase().includes(search.toLowerCase()) ||
            student.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Student Directory</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">View all registered students and their room assignments</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="relative max-w-md">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all dark:text-white dark:placeholder-slate-400"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-left">Student Info</th>
                                    <th className="px-6 py-4 text-left">Contact</th>
                                    <th className="px-6 py-4 text-left">Room Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                {isLoading ? (
                                    // Skeleton Loading State
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <Skeleton className="w-10 h-10 rounded-full" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-3 w-20" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-40" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Skeleton className="h-8 w-24 rounded-lg" />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Skeleton className="h-9 w-28 rounded-xl ml-auto" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <AnimatePresence>
                                        {filteredStudents.map((student) => (
                                            <motion.tr
                                                key={student.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-white dark:hover:bg-slate-700/50 hover:shadow-lg hover:z-10 relative transition-all duration-300 group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm overflow-hidden border border-emerald-200 dark:border-emerald-800">
                                                            {student.profile?.profileImage ? (
                                                                <img src={student.profile.profileImage} alt={student.name || "Student"} className="w-full h-full object-cover" />
                                                            ) : (
                                                                student.name ? student.name.charAt(0).toUpperCase() : <FaUserGraduate />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-slate-800 dark:text-white">{student.name || "Unknown Name"}</h3>
                                                            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded w-fit mt-1">
                                                                <FaIdCard size={8} />
                                                                {student.id.slice(0, 8)}...
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm text-slate-600 dark:text-slate-300">{student.email}</span>
                                                        {student.profile?.phone && (
                                                            <span className="text-xs text-slate-400 dark:text-slate-500">{student.profile.phone}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {student.room ? (
                                                        <span className="flex items-center gap-2 text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 px-3 py-1.5 rounded-lg w-fit text-sm font-medium">
                                                            <FaBed size={14} />
                                                            Room {student.room.roomNumber}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg w-fit text-xs italic">
                                                            <FaBuilding size={12} />
                                                            Unassigned
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={`/staff/students/${student.id}`}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 text-slate-600 dark:text-slate-300 rounded-xl transition-all text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                                    >
                                                        <FaEye /> View Profile
                                                    </Link>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

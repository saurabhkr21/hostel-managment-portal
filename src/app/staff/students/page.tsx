"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaUserGraduate, FaBed, FaEye, FaIdCard, FaBuilding } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
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
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/staff/students");
            const data = await res.json();
            if (!data.error) setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(
        (student) =>
            student.email.toLowerCase().includes(search.toLowerCase()) ||
            (student.name || "").toLowerCase().includes(search.toLowerCase()) ||
            student.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Student Directory</h1>
                        <p className="text-slate-500 mt-1">View all registered students and their room assignments</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative max-w-md">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left">Student Info</th>
                                    <th className="px-6 py-4 text-left">Contact</th>
                                    <th className="px-6 py-4 text-left">Room Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence>
                                    {filteredStudents.map((student) => (
                                        <motion.tr
                                            key={student.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm overflow-hidden border border-emerald-200">
                                                        {student.profile?.profileImage ? (
                                                            <img src={student.profile.profileImage} alt={student.name || "Student"} className="w-full h-full object-cover" />
                                                        ) : (
                                                            student.name ? student.name.charAt(0).toUpperCase() : <FaUserGraduate />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-800">{student.name || "Unknown Name"}</h3>
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-1">
                                                            <FaIdCard size={8} />
                                                            {student.id.slice(0, 8)}...
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm text-slate-600">{student.email}</span>
                                                    {student.profile?.phone && (
                                                        <span className="text-xs text-slate-400">{student.profile.phone}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.room ? (
                                                    <span className="flex items-center gap-2 text-violet-700 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-lg w-fit text-sm font-medium">
                                                        <FaBed size={14} />
                                                        Room {student.room.roomNumber}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg w-fit text-xs italic">
                                                        <FaBuilding size={12} />
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/staff/students/${student.id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 text-slate-600 rounded-xl transition-all text-sm font-medium shadow-sm"
                                                >
                                                    <FaEye /> View Profile
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

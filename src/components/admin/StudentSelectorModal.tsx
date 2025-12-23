"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaSearch, FaUser, FaIdCard, FaBuilding } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Student {
    id: string;
    name: string;
    email: string;
    profile: {
        rollNo: string | null;
    } | null;
    room: {
        roomNumber: string;
    } | null;
}

interface StudentSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (email: string) => void;
}

export default function StudentSelectorModal({ isOpen, onClose, onSelect }: StudentSelectorModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen) {
                fetchStudents();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, isOpen]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("role", "STUDENT");
            if (searchQuery) params.append("search", searchQuery);

            const res = await fetch(`/api/users?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            }
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                            Find Student
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, roll no, or room..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-800 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <p>No students found.</p>
                            </div>
                        ) : (
                            students.map((student) => (
                                <button
                                    key={student.id}
                                    onClick={() => onSelect(student.email)}
                                    className="w-full text-left p-3 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/10 border border-transparent hover:border-violet-200 dark:hover:border-violet-800 transition-all group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-violet-700 dark:group-hover:text-violet-300">
                                                {student.name}
                                            </h4>
                                            <p className="text-sm text-slate-500 group-hover:text-violet-600/70">
                                                {student.email}
                                            </p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            {student.room && (
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                    <FaBuilding size={10} /> Room: {student.room.roomNumber}
                                                </span>
                                            )}
                                            {student.profile?.rollNo && (
                                                <div className="flex justify-end">
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                        <FaIdCard size={10} /> {student.profile.rollNo}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 text-xs text-center text-slate-400 border-t border-slate-200 dark:border-slate-800">
                        Select a student to fill their email address
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

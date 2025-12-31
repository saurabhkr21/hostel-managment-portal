"use client";

import { useState, useEffect } from "react";
import { FaCalendarAlt, FaSave, FaCheck, FaTimes, FaBed, FaSearch, FaCheckDouble, FaUserTimes, FaInfoCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Student {
    id: string;
    name: string;
    room: {
        roomNumber: string;
    };
}

export default function AdminAttendancePage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [markedDates, setMarkedDates] = useState<string[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    useEffect(() => {
        fetchStudents();
        fetchMarkedDates();
    }, []);

    const fetchMarkedDates = async () => {
        try {
            const res = await fetch("/api/attendance/marked-dates");
            const data = await res.json();
            if (!data.error) {
                setMarkedDates(data.markedDates || []);
            }
        } catch (error) {
            console.error("Error fetching marked dates:", error);
        }
    };

    // Re-fetch leaves and reset attendance when date or students list changes
    useEffect(() => {
        if (students.length > 0) {
            syncAttendanceWithLeaves();
        }
    }, [date, students]);

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/users?role=STUDENT");
            const data = await res.json();
            if (!data.error) {
                setStudents(data);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const syncAttendanceWithLeaves = async () => {
        try {
            setLoading(true);
            // 1. Fetch existing attendance for this date
            const attRes = await fetch(`/api/attendance?date=${date}`);
            const attData = await attRes.json();

            const newAttendance: { [key: string]: string } = {};
            let hasExistingData = false;

            if (Array.isArray(attData) && attData.length > 0) {
                // If we have saved records, use them
                hasExistingData = true;
                attData.forEach((record: any) => {
                    newAttendance[record.studentId] = record.status;
                });

                // Ensure any students NOT in the records (newly added?) get a default
                students.forEach(s => {
                    if (!newAttendance[s.id]) newAttendance[s.id] = "PRESENT";
                });

            } else {
                // 2. No records = New Day. Default everyone to PRESENT
                students.forEach(s => newAttendance[s.id] = "PRESENT");
            }

            // 3. If NO existing data, apply Leaves.
            if (!hasExistingData) {
                const leavesRes = await fetch(`/api/leaves?status=APPROVED&date=${date}`);
                const leaves = await leavesRes.json();

                if (Array.isArray(leaves)) {
                    leaves.forEach((leave: any) => {
                        // Only override if the student exists in our list
                        if (newAttendance[leave.studentId]) {
                            newAttendance[leave.studentId] = "LEAVE";
                        }
                    });
                }
            }

            setAttendance(newAttendance);
        } catch (error) {
            console.error("Error syncing data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceChange = (studentId: string, status: string) => {
        setAttendance((prev) => ({ ...prev, [studentId]: status }));
    };

    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

    useEffect(() => {
        // Clear selection when filtered list changes (optional, but safer to avoid selecting hidden items)
        // actually, keeping selection while searching might be desired. Let's keep it.
    }, [search]);

    const toggleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length && filteredStudents.length > 0) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s.id));
        }
    };

    const toggleStudent = (studentId: string) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const markSelected = (status: string) => {
        setAttendance(prev => {
            const next = { ...prev };
            selectedStudents.forEach(id => {
                next[id] = status;
            });
            return next;
        });
        setSelectedStudents([]); // Clear selection after action
    };

    const markAll = (status: string) => {
        const newAttendance: { [key: string]: string } = {};
        students.forEach(s => newAttendance[s.id] = status);
        setAttendance(newAttendance);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                studentId,
                status,
            }));

            const res = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, records }),
            });

            if (res.ok) {
                alert("Attendance marked successfully!");
                fetchMarkedDates(); // Refresh markers
            } else alert("Failed to mark attendance");
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const stats = {
        present: Object.values(attendance).filter(s => s === "PRESENT").length,
        absent: Object.values(attendance).filter(s => s === "ABSENT").length,
        leave: Object.values(attendance).filter(s => s === "LEAVE").length,
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.room?.roomNumber || "").includes(search)
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-16 pb-8 px-2 md:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center md:items-center gap-2 md:mt-0">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">Attendance (Admin)</h1>
                            {markedDates.includes(date) ? (
                                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                                    Marked
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-200 dark:border-slate-700 shrink-0">
                                    Pending
                                </span>
                            )}
                        </div>
                        <p className="hidden md:block text-slate-500 dark:text-slate-400 mt-1">Mark and save student attendance</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm w-full md:w-auto">
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 flex-1 md:flex-none">
                            <FaCalendarAlt className="text-violet-500 text-xs" />
                            <input
                                type="date"
                                min="2024-01-01"
                                max="2026-12-31"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent font-black text-slate-700 dark:text-white outline-none dark:scheme-dark text-[11px] md:text-sm w-full md:w-32 hover:cursor-pointer"
                            />
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl shadow-lg shadow-violet-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 text-xs md:text-sm flex-1 md:flex-none"
                        >
                            {saving ? <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> : <FaSave />}
                            <span>Save All</span>
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group h-full"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-emerald-400/10 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
                        <div className="flex items-center justify-between gap-4 relative z-10 w-full h-full">
                            <div className="flex flex-col justify-center h-full">
                                <p className="text-[11px] md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none mb-1.5">Present</p>
                                <h3 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">{stats.present}</h3>
                            </div>
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl md:text-3xl shrink-0 transition-transform group-hover:rotate-12 duration-300">
                                <FaCheck />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group h-full"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-rose-400/10 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
                        <div className="flex items-center justify-between gap-4 relative z-10 w-full h-full">
                            <div className="flex flex-col justify-center h-full">
                                <p className="text-[11px] md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none mb-1.5">Absent</p>
                                <h3 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">{stats.absent}</h3>
                            </div>
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl md:text-3xl shrink-0 transition-transform group-hover:rotate-12 duration-300">
                                <FaTimes />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group h-full"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-amber-400/10 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
                        <div className="flex items-center justify-between gap-4 relative z-10 w-full h-full">
                            <div className="flex flex-col justify-center h-full">
                                <p className="text-[11px] md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none mb-1.5">On Leave</p>
                                <h3 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">{stats.leave}</h3>
                            </div>
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl md:text-3xl shrink-0 transition-transform group-hover:rotate-12 duration-300">
                                <FaInfoCircle />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Content Area */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Search Bar & Quick Actions or Bulk Actions */}
                    <div className={`p-3 md:p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-4 transition-colors ${selectedStudents.length > 0 ? 'bg-violet-50 dark:bg-violet-900/10' : 'bg-slate-50/50 dark:bg-slate-900/30'}`}>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs md:text-sm" />
                                <input
                                    type="text"
                                    placeholder="Search name or room..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 pl-9 pr-4 py-2 rounded-xl text-xs md:text-sm border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-violet-500 transition-all font-bold"
                                />
                            </div>
                        </div>
                        {selectedStudents.length > 0 ? (
                            // Bulk Action Bar
                            <div className="w-full flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-bold">
                                        {selectedStudents.length} Selected
                                    </div>
                                    <button onClick={() => setSelectedStudents([])} className="text-slate-500 hover:text-slate-700 text-xs font-medium decoration-dashed underline underline-offset-2">
                                        Clear Selection
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => markSelected("PRESENT")}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors"
                                    >
                                        <FaCheck /> Mark Present
                                    </button>
                                    <button
                                        onClick={() => markSelected("ABSENT")}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors"
                                    >
                                        <FaTimes /> Mark Absent
                                    </button>
                                    <button
                                        onClick={() => markSelected("LEAVE")}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors"
                                    >
                                        <FaBed /> Mark Leave
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Standard Search & Quick Actions
                            <>
                                <div className="flex-1 flex items-center gap-3">
                                    <FaSearch className="text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search students or rooms..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="bg-transparent w-full outline-none text-slate-700 dark:text-white placeholder-slate-400"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => markAll("PRESENT")}
                                        title="Mark All Present"
                                        className="p-2 bg-emerald-100/50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors"
                                    >
                                        <FaCheckDouble size={18} />
                                    </button>
                                    <button
                                        onClick={() => markAll("ABSENT")}
                                        title="Mark All Absent"
                                        className="p-2 bg-rose-100/50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg transition-colors"
                                    >
                                        <FaUserTimes size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-3 py-3 md:px-6 md:py-3 w-8 md:w-10">
                                        <input
                                            type="checkbox"
                                            checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-3 py-3 md:px-6 md:py-3 text-left">Student</th>
                                    <th className="px-3 py-3 md:px-6 md:py-3 text-center">Selection</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                <AnimatePresence>
                                    {filteredStudents.map((student) => (
                                        <motion.tr
                                            key={student.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                                        >
                                            <td className="px-3 py-3 md:px-6 md:py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(student.id)}
                                                    onChange={() => toggleStudent(student.id)}
                                                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-3 py-3 md:px-6 md:py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs md:text-sm font-bold shrink-0">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-800 dark:text-white text-xs md:text-sm truncate">{student.name}</p>
                                                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                                                            <FaBed size={10} className="md:w-2.5 md:h-2.5" /> Room: {student.room?.roomNumber || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 md:px-6 md:py-4">
                                                <div className="flex items-center justify-center w-full max-w-[140px] md:max-w-[280px] mx-auto">
                                                    <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl w-full border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                        {[
                                                            {
                                                                id: "PRESENT",
                                                                label: "Present",
                                                                icon: <FaCheck />,
                                                                active: "bg-emerald-500 text-white shadow-sm",
                                                                idle: "text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                                            },
                                                            {
                                                                id: "ABSENT",
                                                                label: "Absent",
                                                                icon: <FaTimes />,
                                                                active: "bg-rose-500 text-white shadow-sm",
                                                                idle: "text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                                            },
                                                            {
                                                                id: "LEAVE",
                                                                label: "Leave",
                                                                icon: <FaInfoCircle />,
                                                                active: "bg-amber-500 text-white shadow-sm",
                                                                idle: "text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                            },
                                                        ].map((opt) => (
                                                            <button
                                                                key={opt.id}
                                                                onClick={() => handleAttendanceChange(student.id, opt.id)}
                                                                className={`
                                                                    flex-1 flex items-center justify-center gap-1.5 py-1.5 md:py-2 px-1 rounded-lg text-[10px] md:text-xs font-black transition-all duration-300
                                                                    ${attendance[student.id] === opt.id ? opt.active : opt.idle}
                                                                `}
                                                            >
                                                                <span className="text-[11px] md:text-sm">{opt.icon}</span>
                                                                <span className="hidden md:inline">{opt.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        {filteredStudents.length === 0 && (
                            <div className="p-10 text-center text-slate-400">
                                <p>No students found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

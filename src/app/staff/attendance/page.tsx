"use client";

import { useState, useEffect } from "react";
import { FaCalendarAlt, FaSave, FaCheck, FaTimes, FaUserGraduate, FaBed, FaSearch, FaCheckDouble, FaUserTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Student {
    id: string;
    name: string;
    room: {
        roomNumber: string;
    };
}

export default function StaffAttendancePage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchStudents();
    }, []);

    // Re-fetch leaves and reset attendance when date or students list changes
    useEffect(() => {
        if (students.length > 0) {
            syncAttendanceWithLeaves();
        }
    }, [date, students]);

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/staff/students");
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
                // (Optional: depending on business logic, maybe they should be absent? defaulting to present for now to match)
                students.forEach(s => {
                    if (!newAttendance[s.id]) newAttendance[s.id] = "PRESENT";
                });

            } else {
                // 2. No records = New Day. Default everyone to PRESENT
                students.forEach(s => newAttendance[s.id] = "PRESENT");
            }

            // 3. If NO existing data (or if we want to enforce leaves on top of partial data - choosing NO existing data for safety), 
            // apply Leaves.
            // Actually, if we have NO existing data, we definitely need to apply leaves.
            // If we HAVE existing data, we assume the warden might have manually overridden a leave (unlikely/edge case), OR 
            // the leave was approved AFTER attendance was taken. 
            // User request: "if he/she is on leave attendance will be marked automatically". 
            // It's safer to ONLY apply auto-leave if we are filling defaults. If data is saved, trust the save.

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

    // ... existing useEffects ...

    const toggleSelectAll = () => {
        // Only select students who have a room
        const eligibleStudents = filteredStudents.filter(s => s.room);

        if (selectedStudents.length === eligibleStudents.length && eligibleStudents.length > 0) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(eligibleStudents.map(s => s.id));
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
        students.forEach(s => {
            if (s.room) { // Only mark if registered
                newAttendance[s.id] = status;
            }
        });
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

            if (res.ok) alert("Attendance marked successfully!");
            else alert("Failed to mark attendance");
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Daily Attendance</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Mark and save student attendance</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl">
                            <FaCalendarAlt className="text-slate-400 dark:text-slate-500" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent font-medium text-slate-700 dark:text-white outline-none dark:[color-scheme:dark] text-sm"
                            />
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 dark:shadow-violet-900/20 transition-all active:scale-95 disabled:opacity-50 text-sm"
                        >
                            {saving ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <FaSave />}
                            <span>Save Attendance</span>
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-300 opacity-[0.05] rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-500" />
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Present</p>
                                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stats.present}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                                <FaCheck />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-400 to-red-300 opacity-[0.05] rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-500" />
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Absent</p>
                                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stats.absent}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl">
                                <FaTimes />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-300 opacity-[0.05] rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-500" />
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">On Leave</p>
                                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stats.leave}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
                                <FaBed />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* List */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Search Bar & Quick Actions */}
                    {/* Search Bar & Quick Actions or Bulk Actions */}
                    <div className={`p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-colors ${selectedStudents.length > 0 ? 'bg-violet-50 dark:bg-violet-900/10' : 'bg-slate-50/50 dark:bg-slate-900/30'}`}>
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
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 w-10">
                                        <input
                                            type="checkbox"
                                            checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left">Student Details</th>
                                    <th className="px-6 py-3 text-center">Status Selection</th>
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
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(student.id)}
                                                    onChange={() => toggleStudent(student.id)}
                                                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white">{student.name}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                                                            <FaBed size={10} /> Room: {student.room?.roomNumber || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {!student.room ? (
                                                        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs rounded-lg border border-slate-200 dark:border-slate-700">
                                                            Not Registered (No Room)
                                                        </div>
                                                    ) : (
                                                        [
                                                            {
                                                                id: "PRESENT",
                                                                label: "Present",
                                                                color: "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500",
                                                                active: "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                                                            },
                                                            {
                                                                id: "ABSENT",
                                                                label: "Absent",
                                                                color: "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-500 hover:text-rose-500",
                                                                active: "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20"
                                                            },
                                                            {
                                                                id: "LEAVE",
                                                                label: "Leave",
                                                                color: "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-500",
                                                                active: "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20"
                                                            },
                                                        ].map((opt) => (
                                                            <button
                                                                key={opt.id}
                                                                onClick={() => handleAttendanceChange(student.id, opt.id)}
                                                                className={`
                                                                    px-3 py-1.5 rounded-md font-bold text-xs border transition-all duration-200 min-w-[70px]
                                                                    ${attendance[student.id] === opt.id ? opt.active : opt.color}
                                                                `}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))
                                                    )}
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

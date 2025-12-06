"use client";

import { useState, useEffect } from "react";
import { FaCalendarAlt, FaSave, FaCheck, FaTimes, FaUserGraduate, FaBed, FaSearch } from "react-icons/fa";
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
            // 1. Reset everyone to PRESENT
            const newAttendance: { [key: string]: string } = {};
            students.forEach(s => newAttendance[s.id] = "PRESENT");

            // 2. Fetch Approved Leaves for the selected date
            const res = await fetch(`/api/leaves?status=APPROVED&date=${date}`);
            const leaves = await res.json();

            // 3. Update status to LEAVE for students with active approved leaves
            if (Array.isArray(leaves)) {
                leaves.forEach((leave: any) => {
                    // Check if student exists in our list (might be filtered out or old data)
                    if (newAttendance[leave.studentId]) {
                        newAttendance[leave.studentId] = "LEAVE";
                    }
                });
            }

            setAttendance(newAttendance);
        } catch (error) {
            console.error("Error syncing leaves:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceChange = (studentId: string, status: string) => {
        setAttendance((prev) => ({ ...prev, [studentId]: status }));
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
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800">Daily Attendance</h1>
                        <p className="text-slate-500 mt-1">Mark and save student attendance</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                            <FaCalendarAlt className="text-slate-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent font-medium text-slate-700 outline-none"
                            />
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg shadow-md shadow-violet-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <FaSave />}
                            <span>Save Attendance</span>
                        </button>
                    </div>
                </div>

                {/* Stats & Tools */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    {/* Summary Cards */}
                    <div className="lg:col-span-3 grid grid-cols-3 gap-4">
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider">Present</p>
                                <p className="text-2xl font-extrabold text-emerald-700">{stats.present}</p>
                            </div>
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <FaCheck />
                            </div>
                        </div>
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-rose-600 text-sm font-bold uppercase tracking-wider">Absent</p>
                                <p className="text-2xl font-extrabold text-rose-700">{stats.absent}</p>
                            </div>
                            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                                <FaTimes />
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-amber-600 text-sm font-bold uppercase tracking-wider">On Leave</p>
                                <p className="text-2xl font-extrabold text-amber-700">{stats.leave}</p>
                            </div>
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                <FaBed />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-center gap-3">
                        <p className="text-xs font-bold text-slate-400 uppercase text-center">Quick Actions</p>
                        <button onClick={() => markAll("PRESENT")} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors">
                            Mark All Present
                        </button>
                        <button onClick={() => markAll("ABSENT")} className="w-full py-2 bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 font-medium rounded-lg text-sm transition-colors">
                            Mark All Absent
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <FaSearch className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search students or rooms..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent w-full outline-none text-slate-700 placeholder-slate-400"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left">Student Details</th>
                                    <th className="px-6 py-4 text-center">Status Selection</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence>
                                    {filteredStudents.map((student) => (
                                        <motion.tr
                                            key={student.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{student.name}</p>
                                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                            <FaBed size={10} /> Room: {student.room?.roomNumber || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {[
                                                        { id: "PRESENT", label: "Present", color: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100", active: "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-200" },
                                                        { id: "ABSENT", label: "Absent", color: "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100", active: "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200" },
                                                        { id: "LEAVE", label: "Leave", color: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100", active: "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-200" },
                                                    ].map((opt) => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => handleAttendanceChange(student.id, opt.id)}
                                                            className={`
                                                                px-4 py-2 rounded-lg font-medium text-sm border transition-all duration-200
                                                                ${attendance[student.id] === opt.id ? opt.active : opt.color}
                                                            `}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
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

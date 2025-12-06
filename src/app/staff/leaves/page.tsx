"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaCheck, FaTimes, FaCalendarAlt, FaTrash, FaFileDownload, FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface LeaveRequest {
    id: string;
    type: string;
    fromDate: string;
    toDate: string;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    student: {
        name: string;
        room: {
            roomNumber: string;
        };
        profile: {
            phone: string;
        };
    };
}

export default function StaffLeavesPage() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await fetch("/api/leaves");
            const data = await res.json();
            if (!data.error) setLeaves(data);
        } catch (error) {
            console.error("Error fetching leaves:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
        setProcessing(id);
        try {
            const res = await fetch(`/api/leaves/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                // Optimistic update
                setLeaves(leaves.map(leave =>
                    leave.id === id ? { ...leave, status: newStatus } : leave
                ));
            } else {
                const err = await res.json();
                alert(`Failed to update Status: ${err.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error updating leave:", error);
            alert("An error occurred while updating the request.");
        } finally {
            setProcessing(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this leave request?")) return;
        setProcessing(id);
        try {
            const res = await fetch(`/api/leaves/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setLeaves(leaves.filter(leave => leave.id !== id));
            } else {
                const err = await res.json();
                alert(`Failed to delete: ${err.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error deleting leave:", error);
            alert("An error occurred while deleting the request.");
        } finally {
            setProcessing(null);
        }
    };

    const handleExport = () => {
        const headers = ["Student Name", "Room", "Phone", "Type", "From Date", "To Date", "Reason", "Status"];
        const csvContent = [
            headers.join(","),
            ...leaves.map(leave => [
                leave.student.name,
                leave.student.room?.roomNumber || "N/A",
                leave.student.profile?.phone || "N/A",
                leave.type,
                new Date(leave.fromDate).toLocaleDateString(),
                new Date(leave.toDate).toLocaleDateString(),
                `"${leave.reason.replace(/"/g, '""')}"`,
                leave.status
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `leaves_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const filteredLeaves = leaves.filter(
        (leave) =>
            leave.student.name.toLowerCase().includes(search.toLowerCase()) ||
            leave.type.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><FaCheck size={10} /> Approved</span>;
            case "REJECTED":
                return <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><FaTimes size={10} /> Rejected</span>;
            default:
                return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><FaSpinner className="animate-spin" size={10} /> Pending</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Leave Management</h1>
                        <p className="text-slate-500 mt-1">Review and manage student leave requests</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium shadow-sm"
                    >
                        <FaFileDownload />
                        Export CSV
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative max-w-md w-full">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by student name or type..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                            <span className="font-semibold">{filteredLeaves.length}</span> requests found
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left">Student</th>
                                    <th className="px-6 py-4 text-left">Request Details</th>
                                    <th className="px-6 py-4 text-left">Reason</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-violet-500" />
                                                Loading requests...
                                            </td>
                                        </tr>
                                    ) : filteredLeaves.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                                No leave requests found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLeaves.map((leave) => (
                                            <motion.tr
                                                key={leave.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-slate-50/80 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">
                                                            {leave.student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{leave.student.name}</p>
                                                            <p className="text-xs text-slate-500">
                                                                Room {leave.student.room?.roomNumber || "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 mb-1 uppercase tracking-wider">
                                                            {leave.type}
                                                        </span>
                                                        <p className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
                                                            <FaCalendarAlt className="text-slate-400" size={12} />
                                                            {new Date(leave.fromDate).toLocaleDateString()} <span className="text-slate-300">→</span> {new Date(leave.toDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-600 max-w-xs truncate" title={leave.reason}>
                                                        {leave.reason}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(leave.status)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {processing === leave.id ? (
                                                            <FaSpinner className="animate-spin text-violet-500 m-2" />
                                                        ) : (
                                                            <>
                                                                {leave.status === "PENDING" && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleStatusUpdate(leave.id, "APPROVED")}
                                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                                                            title="Approve"
                                                                        >
                                                                            <FaCheck />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleStatusUpdate(leave.id, "REJECTED")}
                                                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                                                                            title="Reject"
                                                                        >
                                                                            <FaTimes />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDelete(leave.id)}
                                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                                                    title="Delete"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

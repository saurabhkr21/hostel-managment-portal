"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaExclamationCircle, FaCheckCircle, FaClock, FaTools, FaFilter, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Complaint {
    id: string;
    title: string;
    description: string;
    status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
    createdAt: string;
    student: {
        name: string;
        room: {
            roomNumber: string;
        };
    };
}

export default function StaffComplaintsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "IN_PROGRESS" | "RESOLVED">("ALL");

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await fetch("/api/complaints");
            const data = await res.json();
            if (!data.error) setComplaints(data);
        } catch (error) {
            console.error("Error fetching complaints:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: "PENDING" | "IN_PROGRESS" | "RESOLVED") => {
        // Optimistic UI update
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));

        try {
            const res = await fetch(`/api/complaints/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                // Revert if failed
                fetchComplaints();
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating complaint:", error);
        }
    };

    const filteredComplaints = complaints.filter(
        (complaint) => {
            const matchesSearch = complaint.title.toLowerCase().includes(search.toLowerCase()) ||
                complaint.student.name.toLowerCase().includes(search.toLowerCase());
            const matchesFilter = filter === "ALL" || complaint.status === filter;
            return matchesSearch && matchesFilter;
        }
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "RESOLVED":
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 shadow-sm uppercase tracking-wide">
                        <FaCheckCircle /> Resolved
                    </span>
                );
            case "IN_PROGRESS":
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200 shadow-sm uppercase tracking-wide">
                        <FaTools /> In Progress
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200 shadow-sm uppercase tracking-wide">
                        <FaClock /> Pending
                    </span>
                );
        }
    };

    const StatusButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2
                ${active
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-200 scale-105"
                    : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">
                            Complaint Management
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Track, manage and resolve student issues efficiently</p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by student name or issue..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none shadow-sm transition-all"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <StatusButton active={filter === "ALL"} onClick={() => setFilter("ALL")}>All</StatusButton>
                        <StatusButton active={filter === "PENDING"} onClick={() => setFilter("PENDING")}><FaClock /> Pending</StatusButton>
                        <StatusButton active={filter === "IN_PROGRESS"} onClick={() => setFilter("IN_PROGRESS")}><FaTools /> In Progress</StatusButton>
                        <StatusButton active={filter === "RESOLVED"} onClick={() => setFilter("RESOLVED")}><FaCheckCircle /> Resolved</StatusButton>
                    </div>
                </div>

                {/* Complaints List */}
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                        {filteredComplaints.length > 0 ? (
                            filteredComplaints.map((complaint) => (
                                <motion.div
                                    key={complaint.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group flex flex-col md:flex-row gap-6 md:items-center justify-between"
                                >
                                    {/* Content */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between md:hidden">
                                            {getStatusBadge(complaint.status)}
                                            <span className="text-xs text-slate-400 font-medium">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold shrink-0">
                                                {complaint.student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 leading-tight">{complaint.title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                                    <span className="font-medium text-violet-600">{complaint.student.name}</span>
                                                    <span>•</span>
                                                    <span>Room {complaint.student.room?.roomNumber || "N/A"}</span>
                                                    <span className="hidden md:inline">•</span>
                                                    <span className="hidden md:inline">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pl-13 md:pl-12">
                                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm leading-relaxed border border-slate-100">
                                                {complaint.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                        <div className="hidden md:block mb-2">
                                            {getStatusBadge(complaint.status)}
                                        </div>

                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            {complaint.status === "PENDING" && (
                                                <button
                                                    onClick={() => handleStatusUpdate(complaint.id, "IN_PROGRESS")}
                                                    className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <FaTools /> Take Action
                                                </button>
                                            )}
                                            {(complaint.status === "PENDING" || complaint.status === "IN_PROGRESS") && (
                                                <button
                                                    onClick={() => handleStatusUpdate(complaint.id, "RESOLVED")}
                                                    className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <FaCheckCircle /> Resolve
                                                </button>
                                            )}
                                            {complaint.status === "RESOLVED" && (
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Completed</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300"
                            >
                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaExclamationCircle size={32} />
                                </div>
                                <p className="text-slate-500 font-medium text-lg">No complaints found</p>
                                <p className="text-slate-400 text-sm">Try adjusting your filters or search</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

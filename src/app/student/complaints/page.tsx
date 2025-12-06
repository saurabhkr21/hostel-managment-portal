"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaExclamationCircle, FaCheckCircle, FaClock, FaPaperPlane, FaTools } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Complaint {
    id: string;
    title: string;
    description: string;
    status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
    createdAt: string;
}

export default function StudentComplaintsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/complaints", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchComplaints();
                setFormData({ title: "", description: "" });
            }
        } catch (error) {
            console.error("Error submitting complaint:", error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "RESOLVED":
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800 uppercase tracking-wide">
                        <FaCheckCircle /> Resolved
                    </span>
                );
            case "IN_PROGRESS":
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800 uppercase tracking-wide">
                        <FaTools /> In Progress
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800 uppercase tracking-wide">
                        <FaClock /> Pending
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">My Complaints</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Report issues and track their status</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium shadow-lg shadow-violet-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                    >
                        <FaPlus /> New Complaint
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                        {complaints.length > 0 ? (
                            complaints.map((complaint) => (
                                <motion.div
                                    key={complaint.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{complaint.title}</h3>
                                            <p className="text-sm text-slate-400 dark:text-slate-500">
                                                Reported on {new Date(complaint.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {getStatusBadge(complaint.status)}
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                        {complaint.description}
                                    </p>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                <FaExclamationCircle className="mx-auto text-4xl text-slate-300 dark:text-slate-600 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">No complaints found</p>
                                <p className="text-slate-400 dark:text-slate-500 text-sm">Have an issue? Report it now.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border dark:border-slate-700"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Report an Issue</h2>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g., Leaking tap, Broken chair"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all dark:text-white dark:placeholder-slate-400"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="Please describe the issue in detail..."
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none dark:text-white dark:placeholder-slate-400"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium shadow-lg shadow-violet-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                                        >
                                            <FaPaperPlane size={14} /> Submit Report
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

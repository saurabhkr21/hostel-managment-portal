"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMoneyBillWave, FaExclamationCircle, FaCheckCircle, FaPlus, FaSearch, FaUser } from "react-icons/fa";

export default function FeesPage() {
    const [stats, setStats] = useState<any>({ totalCollected: 0, pendingAmount: 0, paidCount: 0, pendingCount: 0 });
    const [fees, setFees] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        studentId: "",
        amount: "",
        type: "Hostel Fee",
        status: "Paid",
        remarks: ""
    });

    useEffect(() => {
        fetchData();
        fetchStudents();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, feesRes] = await Promise.all([
                fetch("/api/fees/stats"),
                fetch("/api/fees")
            ]);

            const statsData = await statsRes.json();
            const feesData = await feesRes.json();

            setStats(statsData);

            // Safely set fees, as API failures might return an object
            if (Array.isArray(feesData)) {
                setFees(feesData);
            } else {
                setFees([]);
                console.error("Fees API Error:", feesData);
                // Optionally show a toast or alert if needed, but console is fine for now
            }
        } catch (error) {
            console.error("Error fetching fee data:", error);
            setFees([]); // Fallback to empty
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            // Filter only students
            const studentList = data.filter((u: any) => u.role === "STUDENT");
            setStudents(studentList);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/fees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({ studentId: "", amount: "", type: "Hostel Fee", status: "Paid", remarks: "" });
                fetchData(); // Refresh data
                alert("Payment recorded successfully!");
            } else {
                const errorData = await res.json();
                console.error("Payment API Error:", errorData);
                alert(`Failed to record payment: ${errorData.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error submitting form");
        }
    };

    const filteredFees = fees.filter(fee =>
        fee.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.student?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-10"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800 dark:text-white">Fee Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Track and manage student fees</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-violet-500/30"
                    >
                        <FaPlus /> Add Payment
                    </button>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatsCard
                        title="Total Collected"
                        value={`₹${stats.totalCollected?.toLocaleString() || 0}`}
                        icon={FaMoneyBillWave}
                        color="text-emerald-500"
                        bgColor="bg-emerald-100 dark:bg-emerald-900/30"
                    />
                    <StatsCard
                        title="Pending Fees"
                        value={`₹${stats.pendingAmount?.toLocaleString() || 0}`}
                        icon={FaExclamationCircle}
                        color="text-amber-500"
                        bgColor="bg-amber-100 dark:bg-amber-900/30"
                    />
                    <StatsCard
                        title="Paid Transactions"
                        value={stats.paidCount || 0}
                        icon={FaCheckCircle}
                        color="text-blue-500"
                        bgColor="bg-blue-100 dark:bg-blue-900/30"
                    />
                    <StatsCard
                        title="Pending Invoices"
                        value={stats.pendingCount || 0}
                        icon={FaExclamationCircle}
                        color="text-rose-500"
                        bgColor="bg-rose-100 dark:bg-rose-900/30"
                    />
                </div>

                {/* Search & Filter */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 flex items-center gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by student name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white"
                        />
                    </div>
                </div>

                {/* Fees Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Date</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Student</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Type</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Amount</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading...</td></tr>
                                ) : filteredFees.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No records found</td></tr>
                                ) : (
                                    filteredFees.map((fee) => (
                                        <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="p-4 text-slate-600 dark:text-slate-300">
                                                {new Date(fee.paymentDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                                        <FaUser size={12} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-white">{fee.student?.name || "Unknown"}</p>
                                                        <p className="text-xs text-slate-500">{fee.student?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300">{fee.type}</td>
                                            <td className="p-4 font-mono font-medium text-slate-800 dark:text-white">₹{fee.amount}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${fee.status === 'Paid'
                                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }`}>
                                                    {fee.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-500 text-sm truncate max-w-[200px]">{fee.remarks || "-"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Fee Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Record New Payment</h2>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Student</label>
                                    <select
                                        required
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
                                    >
                                        <option value="">Select Student</option>
                                        {students.map(student => (
                                            <option key={student.id} value={student.id}>
                                                {student.name} ({student.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
                                        >
                                            <option>Hostel Fee</option>
                                            <option>Mess Fee</option>
                                            <option>Security Deposit</option>
                                            <option>Fine</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
                                    >
                                        <option>Paid</option>
                                        <option>Pending</option>
                                        <option>Overdue</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Remarks</label>
                                    <textarea
                                        value={formData.remarks}
                                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white min-h-[80px]"
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/30"
                                    >
                                        Save Payment
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color, bgColor }: any) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${bgColor} ${color}`}>
                <Icon />
            </div>
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{value}</h3>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMoneyBillWave, FaClock, FaCheckCircle, FaExclamationCircle, FaDownload, FaSpinner, FaHistory, FaCreditCard, FaGooglePay, FaUniversity, FaCheck } from "react-icons/fa";
import { useSession } from "next-auth/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function StudentFeesPage() {
    const { data: session } = useSession();
    const [fees, setFees] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalPaid: 0, pendingDues: 0, nextDueDate: "" });
    const [loading, setLoading] = useState(true);
    const [showPayModal, setShowPayModal] = useState(false);

    // Payment Gateway State
    const [paymentStep, setPaymentStep] = useState(1); // 1: Details, 2: Method, 3: Processing, 4: Success
    const [selectedMethod, setSelectedMethod] = useState("");
    const [payData, setPayData] = useState({
        type: "Hostel Fee",
        amount: "",
        remarks: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    // Reset payment state when modal closes
    useEffect(() => {
        if (!showPayModal) {
            setTimeout(() => {
                setPaymentStep(1);
                setSelectedMethod("");
                setPayData({ type: "Hostel Fee", amount: "", remarks: "" });
            }, 300);
        }
    }, [showPayModal]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchFees(), fetchStats()]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFees = async () => {
        try {
            const res = await fetch("/api/fees");
            const data = await res.json();
            if (res.ok) {
                setFees(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error fetching fees:", error);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/student/fees/stats");
            const data = await res.json();
            if (res.ok) {
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const processPayment = async () => {
        setPaymentStep(3); // Show processing

        try {
            // Simulate bank delay
            await new Promise(resolve => setTimeout(resolve, 3000)); // Increased for realism

            const res = await fetch("/api/fees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: session?.user?.id,
                    amount: payData.amount,
                    type: payData.type,
                    status: "Paid",
                    remarks: payData.remarks || "Online Payment"
                })
            });

            if (res.ok) {
                setPaymentStep(4); // Show success
                await fetchData();
                // Close modal after success animation
                setTimeout(() => setShowPayModal(false), 2000);
            } else {
                const err = await res.json();
                alert(err.error || "Payment failed");
                setPaymentStep(2); // Go back to method selection
            }
        } catch (error) {
            console.error(error);
            alert("Payment failed due to an error");
            setPaymentStep(2);
        }
    };

    const downloadReceipt = (fee: any) => {
        const doc = new jsPDF();

        // Brand Header
        doc.setFillColor(124, 58, 237); // Violet
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("Hostel Payment Receipt", 105, 25, { align: "center" });

        // Receipt Details
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);

        const startY = 60;
        doc.text(`Receipt ID: #${fee.id.slice(-8).toUpperCase()}`, 20, startY);
        doc.text(`Date: ${new Date(fee.paymentDate).toLocaleDateString()}`, 140, startY);

        doc.text(`Student Name: ${session?.user?.name || "N/A"}`, 20, startY + 10);
        doc.text(`Student Email: ${session?.user?.email || "N/A"}`, 20, startY + 20);

        // Table
        autoTable(doc, {
            startY: startY + 40,
            head: [['Description', 'Type', 'Status', 'Amount']],
            body: [
                [
                    fee.remarks || "Fee Payment",
                    fee.type,
                    fee.status,
                    `Rs. ${fee.amount.toLocaleString()}`
                ]
            ],
            theme: 'striped',
            headStyles: { fillColor: [124, 58, 237] }
        });

        // Footer
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.text("This is a computer-generated receipt.", 105, finalY, { align: "center" });

        doc.save(`Receipt-${fee.id.slice(-6)}.pdf`);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                            Fees & Payments
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-base">Manage your fee deposits and view history</p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02, translateY: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowPayModal(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 dark:shadow-violet-900/30 transition-all border border-violet-500/20"
                    >
                        <FaMoneyBillWave />
                        <span>Pay Fees</span>
                    </motion.button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Paid"
                        value={`₹${stats.totalPaid.toLocaleString()}`}
                        icon={FaCheckCircle}
                        gradient="from-emerald-500 to-teal-400"
                        shadowColor="shadow-emerald-500/10"
                        iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                    />
                    <StatCard
                        title="Pending Dues"
                        value={`₹${stats.pendingDues.toLocaleString()}`}
                        icon={stats.pendingDues > 0 ? FaExclamationCircle : FaCheckCircle}
                        gradient={stats.pendingDues > 0 ? "from-amber-500 to-orange-400" : "from-emerald-500 to-teal-400"}
                        shadowColor={stats.pendingDues > 0 ? "shadow-amber-500/10" : "shadow-emerald-500/10"}
                        iconBg={stats.pendingDues > 0 ? "bg-amber-50 dark:bg-amber-900/20" : "bg-emerald-50 dark:bg-emerald-900/20"}
                        iconColor={stats.pendingDues > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}
                    />
                    <StatCard
                        title="Next Due Date"
                        value={stats.nextDueDate ? new Date(stats.nextDueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                        icon={FaClock}
                        gradient="from-blue-500 to-indigo-400"
                        shadowColor="shadow-blue-500/10"
                        iconBg="bg-blue-50 dark:bg-blue-900/20"
                        iconColor="text-blue-600 dark:text-blue-400"
                    />
                </div>

                {/* Transaction History */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                                <FaHistory />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Transaction History</h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    {['Date', 'Type', 'Amount', 'Status', 'Receipt'].map((header) => (
                                        <th key={header} className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {loading && fees.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading transaction history...</td></tr>
                                ) : fees.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No transactions found</td></tr>
                                ) : (
                                    fees.map((fee, index) => (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            key={fee.id}
                                            className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                                                {new Date(fee.paymentDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-800 dark:text-white">{fee.type}</div>
                                                {fee.remarks && <div className="text-xs text-slate-400 mt-0.5">{fee.remarks}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 font-mono">
                                                ₹{fee.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={fee.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                {fee.status === 'Paid' && (
                                                    <button
                                                        onClick={() => downloadReceipt(fee)}
                                                        className="px-3 py-1.5 rounded-lg text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                                    >
                                                        <FaDownload size={12} /> <span>Download</span>
                                                    </button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mock Payment Gateway Modal */}
            <AnimatePresence>
                {showPayModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                                        <FaMoneyBillWave size={16} />
                                    </div>
                                    {paymentStep === 1 && "Payment Details"}
                                    {paymentStep === 2 && "Select Payment Method"}
                                    {paymentStep === 3 && "Processing Payment"}
                                    {paymentStep === 4 && "Payment Successful"}
                                </h2>
                                {paymentStep < 3 && (
                                    <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-medium">
                                        Close
                                    </button>
                                )}
                            </div>

                            {/* Step 1: Fee Details */}
                            {paymentStep === 1 && (
                                <form onSubmit={(e) => { e.preventDefault(); setPaymentStep(2); }} className="p-6 space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fee Type</label>
                                        <select
                                            required value={payData.type} onChange={(e) => setPayData({ ...payData, type: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                                        >
                                            <option>Hostel Fee</option>
                                            <option>Mess Fee</option>
                                            <option>Security Deposit</option>
                                            <option>Fine</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-2.5 text-slate-400 font-medium text-sm">₹</span>
                                            <input
                                                type="number" required min="1" placeholder="0.00" value={payData.amount} onChange={(e) => setPayData({ ...payData, amount: e.target.value })}
                                                className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all dark:text-white font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Remarks</label>
                                        <textarea
                                            rows={2} placeholder="e.g. September Installment" value={payData.remarks} onChange={(e) => setPayData({ ...payData, remarks: e.target.value })}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all dark:text-white resize-none text-sm"
                                        />
                                    </div>
                                    <button type="submit" className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-md shadow-violet-200 dark:shadow-violet-900/20 transition-all text-sm mt-2">
                                        Proceed to Pay
                                    </button>
                                </form>
                            )}

                            {/* Step 2: Payment Method */}
                            {paymentStep === 2 && (
                                <div className="p-6 space-y-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl flex justify-between items-center mb-4">
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Total Amount</p>
                                            <p className="text-xl font-bold text-slate-800 dark:text-white">₹{parseInt(payData.amount).toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => setPaymentStep(1)} className="text-xs text-violet-600 font-bold hover:underline">Edit</button>
                                    </div>

                                    <div className="space-y-3">
                                        <button onClick={() => { setSelectedMethod("card"); processPayment(); }} className="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-xl flex items-center gap-4 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg"><FaCreditCard /></div>
                                            <div className="text-left flex-1">
                                                <p className="font-bold text-slate-700 dark:text-white group-hover:text-violet-700 text-sm">Credit / Debit Card</p>
                                                <p className="text-xs text-slate-500">Visa, Mastercard, RuPay</p>
                                            </div>
                                        </button>
                                        <button onClick={() => { setSelectedMethod("upi"); processPayment(); }} className="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-xl flex items-center gap-4 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg"><FaGooglePay /></div>
                                            <div className="text-left flex-1">
                                                <p className="font-bold text-slate-700 dark:text-white group-hover:text-violet-700 text-sm">UPI / VR</p>
                                                <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm</p>
                                            </div>
                                        </button>
                                        <button onClick={() => { setSelectedMethod("netbanking"); processPayment(); }} className="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-xl flex items-center gap-4 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-lg"><FaUniversity /></div>
                                            <div className="text-left flex-1">
                                                <p className="font-bold text-slate-700 dark:text-white group-hover:text-violet-700 text-sm">Net Banking</p>
                                                <p className="text-xs text-slate-500">All Indian Banks</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Processing */}
                            {paymentStep === 3 && (
                                <div className="p-10 flex flex-col items-center justify-center text-center space-y-6">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-16 h-16 border-4 border-slate-200 border-t-violet-600 rounded-full"
                                    />
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Processing Payment...</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Please do not close this window.</p>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Success */}
                            {paymentStep === 4 && (
                                <div className="p-10 flex flex-col items-center justify-center text-center space-y-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl"
                                    >
                                        <FaCheck />
                                    </motion.div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Payment Successful!</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Redirecting to history...</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, gradient, shadowColor, iconBg, iconColor }: any) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 relative overflow-hidden group`}
        >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-[0.03] rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-500`}></div>

            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${iconBg} ${iconColor}`}>
                    <Icon />
                </div>
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }: { status: string }) {
    let classes = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";

    if (status === 'Paid') {
        classes = "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    } else if (status === 'Pending') {
        classes = "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    } else if (status === 'Overdue') {
        classes = "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800";
    }

    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${classes}`}>
            {status}
        </span>
    );
}

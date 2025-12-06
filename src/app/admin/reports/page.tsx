"use client";


import { useState } from "react";
import { motion } from "framer-motion";
import { FaFileAlt, FaDownload, FaFilter, FaSpinner } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
    const [loading, setLoading] = useState<string | null>(null);

    const generateOccupancyReport = async () => {
        try {
            setLoading("Occupancy Report");
            const res = await fetch("/api/rooms");
            const rooms = await res.json();

            if (!res.ok) throw new Error("Failed to fetch room data");

            const doc = new jsPDF();

            doc.setFontSize(20);
            doc.text("Hostel Occupancy Report", 14, 22);
            doc.setFontSize(11);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

            const tableData = rooms.map((room: any) => [
                room.roomNumber,
                room.type,
                `${room.occupants.length}/${room.capacity}`,
                room.occupants.map((u: any) => u.name).join(", ") || "Empty"
            ]);

            autoTable(doc, {
                head: [["Room No", "Type", "Occupancy", "Occupants"]],
                body: tableData,
                startY: 40,
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [124, 58, 237] } // Violet-600
            });

            doc.save("occupancy-report.pdf");
        } catch (error) {
            console.error(error);
            alert("Failed to generate report");
        } finally {
            setLoading(null);
        }
    };

    const generateAttendanceReport = async () => {
        try {
            setLoading("Student Attendance");
            // Fetch today's attendance by default or all? Let's fetch all recent for now
            const res = await fetch("/api/attendance");
            const attendance = await res.json();

            if (!res.ok) throw new Error("Failed to fetch attendance data");

            const doc = new jsPDF();

            doc.setFontSize(20);
            doc.text("Student Attendance Report", 14, 22);
            doc.setFontSize(11);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

            const tableData = attendance.map((record: any) => [
                new Date(record.date).toLocaleDateString(),
                record.student?.name || "Unknown",
                record.student?.room?.roomNumber || "N/A",
                record.status,
                record.markedBy || "System"
            ]);

            autoTable(doc, {
                head: [["Date", "Student", "Room", "Status", "Marked By"]],
                body: tableData,
                startY: 40,
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [124, 58, 237] }
            });

            doc.save("attendance-report.pdf");
        } catch (error) {
            console.error(error);
            alert("Failed to generate report");
        } finally {
            setLoading(null);
        }
    };

    const generateFeeReport = async () => {
        try {
            setLoading("Fee Collection");
            const res = await fetch("/api/fees");
            const fees = await res.json();

            if (!res.ok) throw new Error("Failed to fetch fee data");

            const doc = new jsPDF();

            doc.setFontSize(20);
            doc.text("Fee Collection Report", 14, 22);
            doc.setFontSize(11);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

            const tableData = fees.map((fee: any) => [
                new Date(fee.paymentDate).toLocaleDateString(),
                fee.student?.name || "Unknown",
                fee.type,
                `${fee.amount}`,
                fee.status
            ]);

            autoTable(doc, {
                head: [["Date", "Student", "Type", "Amount", "Status"]],
                body: tableData,
                startY: 40,
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [124, 58, 237] }
            });

            doc.save("fee-report.pdf");
        } catch (error) {
            console.error(error);
            alert("Failed to generate report");
        } finally {
            setLoading(null);
        }
    };

    const handleDownload = (reportName: string) => {
        switch (reportName) {
            case "Occupancy Report":
                generateOccupancyReport();
                break;
            case "Student Attendance":
                generateAttendanceReport();
                break;
            case "Fee Collection":
                generateFeeReport();
                break;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-10"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800 dark:text-white">Reports</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Generate and view system reports</p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {["Occupancy Report", "Student Attendance", "Fee Collection"].map((report, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 group hover:border-violet-500 dark:hover:border-violet-500 transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center mb-4 text-xl">
                                <FaFileAlt />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">{report}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                Detailed insights and analytics for {report.toLowerCase()}.
                            </p>
                            <button
                                onClick={() => handleDownload(report)}
                                disabled={!!loading}
                                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium flex items-center justify-center gap-2 group-hover:bg-violet-600 group-hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading === report ? (
                                    <>
                                        <FaSpinner className="animate-spin" /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <FaDownload /> Download PDF
                                    </>
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center text-2xl mb-4">
                        <FaFilter />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Custom Reports</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md">
                        Need specific data? Custom report generation tools will be available here soon.
                    </p>
                </div>
            </div>
        </div>
    );
}

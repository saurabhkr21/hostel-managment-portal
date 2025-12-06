"use client";

import { motion } from "framer-motion";
import { FaFileAlt, FaDownload, FaFilter } from "react-icons/fa";

export default function ReportsPage() {
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
                    {/* Placeholder Report Cards */}
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
                            <button className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium flex items-center justify-center gap-2 group-hover:bg-violet-600 group-hover:text-white transition-all">
                                <FaDownload /> Download PDF
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

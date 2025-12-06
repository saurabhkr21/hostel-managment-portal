"use client";

import { motion } from "framer-motion";
import { FaCog, FaMoon, FaBell, FaLock, FaUser } from "react-icons/fa";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white">Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage your preferences and system configurations</p>
                </motion.div>

                <div className="space-y-6">
                    {/* Appearance */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                <FaMoon className="text-violet-500" /> Appearance
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-slate-800 dark:text-white">Theme Preference</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Choose how the application looks to you.</p>
                                </div>
                                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                                    {['light', 'system', 'dark'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTheme(t)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === t
                                                ? 'bg-white dark:bg-slate-600 text-violet-600 dark:text-white shadow-sm'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                }`}
                                        >
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Notifications (Placeholder) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden opacity-60 pointer-events-none"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                <FaBell className="text-rose-500" /> Notifications
                            </h2>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-500 dark:text-slate-400">Notification settings coming soon.</p>
                        </div>
                    </motion.div>

                    {/* Security (Placeholder) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden opacity-60 pointer-events-none"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                <FaLock className="text-emerald-500" /> Security
                            </h2>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-500 dark:text-slate-400">Password and security settings coming soon.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

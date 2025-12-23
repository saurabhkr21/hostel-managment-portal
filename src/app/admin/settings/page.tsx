"use client";

import { motion } from "framer-motion";
import { FaMoon, FaBell, FaLock, FaShieldAlt, FaEnvelope, FaMobileAlt, FaSave, FaEye, FaEyeSlash } from "react-icons/fa";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { data: session } = useSession();

    // Password State
    const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

    // Notification State
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        sms: true,
        marketing: false
    });
    const [loadingNotify, setLoadingNotify] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            alert("New passwords do not match!");
            return;
        }
        setLoadingPassword(true);
        try {
            const res = await fetch("/api/settings/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordData.current,
                    newPassword: passwordData.new
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Password updated successfully!");
                setPasswordData({ current: "", new: "", confirm: "" });
            } else {
                alert(data.error || "Failed to update password");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleNotificationSave = async () => {
        setLoadingNotify(true);
        // Simulator API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoadingNotify(false);
        alert("Notification preferences saved locally!");
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white">Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage your account security and preferences</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column: Appearance & Notifications */}
                    <div className="space-y-8">
                        {/* Appearance */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
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
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Light or dark mode</p>
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

                        {/* Notifications */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                    <FaBell className="text-rose-500" /> Notifications
                                </h2>
                                <button
                                    onClick={handleNotificationSave}
                                    className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-2"
                                >
                                    <FaSave /> {loadingNotify ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <Toggle
                                    label="Email Notifications"
                                    desc="Receive daily digests and important alerts"
                                    icon={<FaEnvelope className="text-blue-500" />}
                                    checked={notifications.email}
                                    onChange={() => setNotifications({ ...notifications, email: !notifications.email })}
                                />
                                <Toggle
                                    label="Push Notifications"
                                    desc="Real-time alerts on your device"
                                    icon={<FaBell className="text-amber-500" />}
                                    checked={notifications.push}
                                    onChange={() => setNotifications({ ...notifications, push: !notifications.push })}
                                />
                                <Toggle
                                    label="SMS Alerts"
                                    desc="Get OTPs and emergency alerts via SMS"
                                    icon={<FaMobileAlt className="text-emerald-500" />}
                                    checked={notifications.sms}
                                    onChange={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Security */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden h-fit"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                <FaShieldAlt className="text-emerald-500" /> Security
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600">
                                <div className="flex items-center gap-3 mb-2">
                                    <FaLock className="text-slate-400" />
                                    <h3 className="font-semibold text-slate-800 dark:text-white">Change Password</h3>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    Ensure your account uses a long, random password to stay secure.
                                </p>

                                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword.current ? "text" : "password"}
                                                required
                                                value={passwordData.current}
                                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                className="w-full p-3 pr-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                                            >
                                                {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword.new ? "text" : "password"}
                                                    required
                                                    value={passwordData.new}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                    className="w-full p-3 pr-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                                                >
                                                    {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Confirm</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword.confirm ? "text" : "password"}
                                                    required
                                                    value={passwordData.confirm}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                    className="w-full p-3 pr-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                                                >
                                                    {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loadingPassword}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loadingPassword ? "Updating..." : "Update Password"}
                                    </button>
                                </form>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                <h3 className="font-medium text-slate-800 dark:text-white mb-4">Login Activity</h3>
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Windows PC - Chrome</p>
                                            <p className="text-xs text-slate-400">Bangalore, India • Active Now</p>
                                        </div>
                                    </div>
                                    <button className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                        Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function Toggle({ label, desc, icon, checked, onChange }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
                <div className="mt-1">{icon}</div>
                <div>
                    <h4 className="font-medium text-slate-800 dark:text-white">{label}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                </div>
            </div>
            <button
                onClick={onChange}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-600'
                    }`}
            >
                <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
}

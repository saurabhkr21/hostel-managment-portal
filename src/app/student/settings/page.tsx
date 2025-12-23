"use client";

import { motion } from "framer-motion";
import { FaMoon, FaBell, FaLock, FaShieldAlt, FaEnvelope, FaMobileAlt, FaSave, FaUser, FaUserEdit, FaBirthdayCake, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaIdCard, FaBuilding, FaHistory, FaCheckCircle, FaExclamationCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function StudentSettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { data: session } = useSession();

    // Profile State
    const [profile, setProfile] = useState<any>({});
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);

    // Password State
    const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

    // Notification State
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        sms: true,
    });
    const [loadingNotify, setLoadingNotify] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/me");
            const data = await res.json();
            if (data.profile) {
                const formattedData = {
                    ...data.profile,
                    dob: data.profile.dob ? new Date(data.profile.dob).toISOString().split('T')[0] : ''
                };
                setProfile(formattedData);
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await fetch("/api/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile)
            });
            if (res.ok) {
                alert("Profile updated successfully!");
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating profile");
        } finally {
            setSavingProfile(false);
        }
    };

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
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulating
        setLoadingNotify(false);
        alert("Notification preferences saved locally!");
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">Account Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg font-medium">Manage your digital identity and security with precision</p>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* Left Column (2/3 width): Profile Information */}
                    <div className="xl:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                            transition={{ duration: 0.3 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 overflow-hidden"
                        >
                            <div className="relative p-8 overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                                <div className="flex justify-between items-center relative z-10">
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                        <div className="p-3 bg-violet-100 dark:bg-slate-700 rounded-xl">
                                            <FaUserEdit className="text-violet-600 dark:text-violet-400" />
                                        </div>
                                        Personal Information
                                    </h2>
                                    {/* Read-Only Badge */}
                                    <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-600">
                                        <FaLock size={10} />
                                        <span>Read Only</span>
                                    </div>
                                </div>
                            </div>

                            {loadingProfile ? (
                                <div className="p-12 text-center text-slate-400 animate-pulse">Loading profile data...</div>
                            ) : (
                                <form className="p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                    {/* Info Alert */}
                                    <div className="col-span-1 md:col-span-2 mb-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl text-sm font-medium border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                                        <FaExclamationCircle className="text-blue-500" />
                                        To change details, authentication is required from admin.
                                    </div>

                                    {/* Read-Only Academic Info Card */}
                                    <div className="col-span-1 md:col-span-2 p-6 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-700/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-600/50 mb-4 transition-all hover:border-violet-300 dark:hover:border-violet-700">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="text-center md:text-left">
                                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Roll No</span>
                                                <span className="text-lg font-bold text-slate-800 dark:text-white font-mono">{profile.rollNo || "N/A"}</span>
                                            </div>
                                            <div className="text-center md:text-left">
                                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Branch</span>
                                                <span className="text-lg font-bold text-slate-800 dark:text-white">{profile.branch || "N/A"}</span>
                                            </div>
                                            <div className="text-center md:text-left">
                                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Course</span>
                                                <span className="text-lg font-bold text-slate-800 dark:text-white">{profile.course || "N/A"}</span>
                                            </div>
                                            <div className="text-center md:text-left">
                                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Year</span>
                                                <span className="text-lg font-bold text-slate-800 dark:text-white">{profile.yearSem || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 group">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Full Name (Verified)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                disabled
                                                value={session?.user?.name || ""}
                                                className="w-full p-4 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-500 font-semibold cursor-not-allowed"
                                            />
                                            <FaCheckCircle className="absolute right-4 top-4.5 text-emerald-500" />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2 ml-1">Phone Number</label>
                                        <div className="relative">
                                            <FaPhone className="absolute left-4 top-4 text-slate-400" />
                                            <input
                                                type="tel"
                                                disabled
                                                value={profile.phone || ""}
                                                className="w-full pl-12 p-3.5 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-600 dark:text-slate-300 cursor-not-allowed font-medium"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2 ml-1">Date of Birth</label>
                                        <div className="relative">
                                            <FaBirthdayCake className="absolute left-4 top-4 text-slate-400" />
                                            <input
                                                type="date"
                                                disabled
                                                value={profile.dob || ""}
                                                className="w-full pl-12 p-3.5 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-600 dark:text-slate-300 cursor-not-allowed font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 group">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2 ml-1">Current Address</label>
                                        <div className="relative">
                                            <FaMapMarkerAlt className="absolute left-4 top-4 text-slate-400" />
                                            <textarea
                                                disabled
                                                value={profile.address || ""}
                                                className="w-full pl-12 p-3.5 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-600 dark:text-slate-300 cursor-not-allowed h-28 resize-none font-medium"
                                                placeholder="Hostel Block A, Room 101..."
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2 ml-1">Father's Name</label>
                                        <input
                                            type="text"
                                            disabled
                                            value={profile.fatherName || ""}
                                            className="w-full p-3.5 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-600 dark:text-slate-300 cursor-not-allowed font-medium"
                                            placeholder="Father's Name"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2 ml-1">Guardian Phone</label>
                                        <input
                                            type="tel"
                                            disabled
                                            value={profile.guardianPhone || ""}
                                            className="w-full p-3.5 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-600 dark:text-slate-300 cursor-not-allowed font-medium"
                                            placeholder="Guardian's Contact"
                                        />
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column (1/3 width): Preferences & Security */}
                    <div className="space-y-8">
                        {/* Appearance & Notifications */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-linear-to-r from-slate-50 to-transparent dark:from-slate-700/30">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                    <FaMoon className="text-violet-500" /> Preferences
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                                    <div>
                                        <h3 className="font-semibold text-slate-800 dark:text-white">Dark Mode</h3>
                                        <p className="text-xs text-slate-500">Adjust appearance</p>
                                    </div>
                                    <button
                                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 shadow-inner ${theme === 'dark' ? 'bg-violet-600' : 'bg-slate-200'
                                            }`}
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>
                                <hr className="border-slate-100 dark:border-slate-700" />
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Notifications</h3>
                                    <Toggle
                                        label="Email Alerts"
                                        activeColor="bg-blue-500"
                                        checked={notifications.email}
                                        onChange={() => setNotifications({ ...notifications, email: !notifications.email })}
                                    />
                                    <Toggle
                                        label="SMS Alerts"
                                        activeColor="bg-emerald-500"
                                        checked={notifications.sms}
                                        onChange={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleNotificationSave}
                                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-colors shadow-sm"
                                    >
                                        Save Preferences
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Security */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-linear-to-r from-emerald-50 to-transparent dark:from-emerald-900/10">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                    <FaShieldAlt className="text-emerald-500" /> Security
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-300" />
                                        <input
                                            type={showPassword.current ? "text" : "password"}
                                            required
                                            value={passwordData.current}
                                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                            className="w-full pl-12 pr-10 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 transition-all"
                                            placeholder="Current Password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-300" />
                                        <input
                                            type={showPassword.new ? "text" : "password"}
                                            required
                                            value={passwordData.new}
                                            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                            className="w-full pl-12 pr-10 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 transition-all"
                                            placeholder="New Password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <FaCheckCircle className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-300" />
                                        <input
                                            type={showPassword.confirm ? "text" : "password"}
                                            required
                                            value={passwordData.confirm}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                            className="w-full pl-12 pr-10 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 transition-all"
                                            placeholder="Confirm New Password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loadingPassword}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all text-sm disabled:opacity-70"
                                    >
                                        {loadingPassword ? "Updating..." : "Update Password"}
                                    </motion.button>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FaHistory className="text-slate-400" />
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Recent Activity</h3>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Current Session</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Active Now • Web</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Toggle({ label, checked, onChange, activeColor = "bg-violet-600" }: any) {
    return (
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{label}</span>
            <button
                onClick={onChange}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 shadow-inner ${checked ? activeColor : 'bg-slate-200 dark:bg-slate-600'
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

"use client";

import { useState } from "react";
import { FaPaperPlane, FaBroadcastTower, FaUsers, FaUser, FaInfoCircle, FaExclamationTriangle, FaBullhorn } from "react-icons/fa";
import { motion } from "framer-motion";

export default function AdminNotifications() {
    const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");
    const [targetType, setTargetType] = useState<"individual" | "all">("all");
    const [notificationType, setNotificationType] = useState("INFO");
    const [recipientId, setRecipientId] = useState("");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        try {
            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetType,
                    recipientId: targetType === "individual" ? recipientId : undefined,
                    type: notificationType,
                    title,
                    message
                })
            });

            const data = await res.json();
            if (res.ok) {
                setStatus({ type: "success", message: "Notification sent successfully!" });
                setMessage("");
                setTitle("");
                setRecipientId("");
            } else {
                setStatus({ type: "error", message: data.error || "Failed to send notification" });
            }
        } catch (error) {
            setStatus({ type: "error", message: "Something went wrong" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                        Notifications & Circulars
                    </h1>
                    <p className="text-slate-500 text-sm">Broadcast updates to students or staff</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Compose */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Target Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setTargetType("all")}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${targetType === "all"
                                        ? "border-violet-600 bg-violet-50 dark:bg-violet-900/10 text-violet-700 dark:text-violet-300"
                                        : "border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                                        }`}
                                >
                                    <FaBroadcastTower className="text-2xl" />
                                    <span className="font-bold">Broadcast All</span>
                                    <span className="text-xs opacity-70">Send to every student</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTargetType("individual")}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${targetType === "individual"
                                        ? "border-violet-600 bg-violet-50 dark:bg-violet-900/10 text-violet-700 dark:text-violet-300"
                                        : "border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                                        }`}
                                >
                                    <FaUser className="text-2xl" />
                                    <span className="font-bold">Individual</span>
                                    <span className="text-xs opacity-70">Single student only</span>
                                </button>
                            </div>

                            {/* Individual Recipient Input */}
                            {targetType === "individual" && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Recipient Student ID / Email</label>
                                    <input
                                        type="text"
                                        value={recipientId}
                                        onChange={(e) => setRecipientId(e.target.value)}
                                        placeholder="Enter student email or ID..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                        required
                                    />
                                </div>
                            )}

                            {/* Notification Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notification Type</label>
                                <div className="flex gap-3">
                                    {[
                                        { id: "INFO", label: "General Info", icon: FaInfoCircle, color: "text-blue-500 bg-blue-50" },
                                        { id: "WARNING", label: "Warning", icon: FaExclamationTriangle, color: "text-amber-500 bg-amber-50" },
                                        { id: "CIRCULAR", label: "Circular", icon: FaBullhorn, color: "text-violet-500 bg-violet-50" },
                                        { id: "URGENT", label: "Urgent", icon: FaExclamationTriangle, color: "text-rose-500 bg-rose-50" },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setNotificationType(type.id)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border transition-all ${notificationType === type.id
                                                ? `${type.color} border-current`
                                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                                                }`}
                                        >
                                            <type.icon />
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Title / Subject</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Hostel Maintenance Notice..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Message Content</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                                    required
                                />
                            </div>

                            {status && (
                                <div className={`p-4 rounded-xl text-sm font-bold ${status.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                    }`}>
                                    {status.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-violet-500/20 active:scale-[99%] transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                ) : (
                                    <>
                                        <FaPaperPlane /> Send Notification
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Panel: Preview & Instructions */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Preview</h3>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                            <div className="flex gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notificationType === "URGENT" ? "bg-rose-100 text-rose-600" :
                                    notificationType === "WARNING" ? "bg-amber-100 text-amber-600" :
                                        notificationType === "CIRCULAR" ? "bg-violet-100 text-violet-600" :
                                            "bg-blue-100 text-blue-600"
                                    }`}>
                                    {notificationType === "URGENT" || notificationType === "WARNING" ? <FaExclamationTriangle /> :
                                        notificationType === "CIRCULAR" ? <FaBullhorn /> : <FaInfoCircle />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                                        {title || "Notification Title"}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-3">
                                        {message || "Message content will appear here..."}
                                    </p>
                                    <div className="mt-2 flex gap-2">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            Just now
                                        </span>
                                        {notificationType === "CIRCULAR" && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-bold">
                                                Circular
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/20">
                        <div className="flex gap-3">
                            <FaInfoCircle className="text-blue-600 shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-blue-700 dark:text-blue-300 text-sm mb-1">Guidelines</h4>
                                <ul className="text-xs text-blue-600/80 space-y-2 list-disc pl-4">
                                    <li>Use <b>Circulars</b> for official announcements like holiday notices or rule changes.</li>
                                    <li>Use <b>Urgent</b> for critical alerts like fire drills or immediate actions.</li>
                                    <li><b>Broadcasts</b> will be sent to all registered active students.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

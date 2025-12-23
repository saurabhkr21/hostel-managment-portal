"use client";

import { useState } from "react";
import { FaPaperPlane, FaBroadcastTower, FaUsers, FaUser, FaInfoCircle, FaExclamationTriangle, FaBullhorn, FaPaperclip, FaSearch } from "react-icons/fa";
import StudentSelectorModal from "@/components/admin/StudentSelectorModal";
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

    const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Add file input ref
    const fileInputRef = useState<HTMLInputElement | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                setAttachmentUrl(data.url);
            } else {
                setStatus({ type: "error", message: "Failed to upload file" });
            }
        } catch (error) {
            setStatus({ type: "error", message: "Upload error" });
        } finally {
            setUploading(false);
        }
    };

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
                    message,
                    attachmentUrl
                })
            });

            const data = await res.json();
            if (res.ok) {
                setStatus({ type: "success", message: "Notification sent successfully!" });
                setMessage("");
                setTitle("");
                setRecipientId("");
                setAttachmentUrl(null);
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
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-indigo-600">
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
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={recipientId}
                                            onChange={(e) => setRecipientId(e.target.value)}
                                            placeholder="Enter student email or ID..."
                                            className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(true)}
                                            className="px-4 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/20"
                                            title="Search Student"
                                        >
                                            <FaSearch />
                                        </button>
                                    </div>
                                    <StudentSelectorModal
                                        isOpen={isModalOpen}
                                        onClose={() => setIsModalOpen(false)}
                                        onSelect={(email) => {
                                            setRecipientId(email);
                                            setIsModalOpen(false);
                                        }}
                                    />
                                </div>
                            )}

                            {/* Notification Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Notification Type</label>
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
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 dark:text-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Message Content</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 dark:text-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Attachment (PDF/Doc/Excel)</label>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                        {uploading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500"></span> : <FaPaperclip />}
                                        {uploading ? "Uploading..." : "Attach File"}
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                                        />
                                    </label>
                                    {attachmentUrl && (
                                        <div className="flex items-center gap-2 text-sm bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 px-3 py-1.5 rounded-lg border border-violet-100 dark:border-violet-800">
                                            <span className="truncate max-w-[200px]">{attachmentUrl.split('/').pop()}</span>
                                            <button
                                                type="button"
                                                onClick={() => setAttachmentUrl(null)}
                                                className="hover:text-red-500 transition-colors"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {status && (
                                <div className={`p-4 rounded-xl text-sm font-bold ${status.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                    }`}>
                                    {status.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || uploading}
                                className="w-full py-4 bg-linear-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-violet-500/20 active:scale-[99%] transition-all flex justify-center items-center gap-2 disabled:opacity-70"
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

                                    {attachmentUrl && (
                                        <div className="mt-2">
                                            <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                                                <FaPaperclip size={10} />
                                                View Attachment
                                            </a>
                                        </div>
                                    )}

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
                                    <li><b>Attachments</b> can be PDFs, Documents, or Excel files for official circulars.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

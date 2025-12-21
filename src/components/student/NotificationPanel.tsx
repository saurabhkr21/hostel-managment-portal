import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaBell, FaCheckDouble, FaExclamationTriangle, FaBullhorn, FaInfoCircle, FaPaperclip, FaArrowLeft } from "react-icons/fa";

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: any[];
    onMarkRead: (id: string) => void;
}

import { useState } from "react";

export default function NotificationPanel({ isOpen, onClose, notifications, onMarkRead }: NotificationPanelProps) {
    const [selectedNotification, setSelectedNotification] = useState<any>(null);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "WARNING": return <FaExclamationTriangle className="text-amber-500" />;
            case "URGENT": return <FaExclamationTriangle className="text-rose-500" />;
            case "CIRCULAR": return <FaBullhorn className="text-violet-500" />;
            default: return <FaInfoCircle className="text-blue-500" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "WARNING": return "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800";
            case "URGENT": return "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800";
            case "CIRCULAR": return "bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800";
            default: return "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800";
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl z-[70] flex flex-col border-l border-slate-200 dark:border-slate-800"
                    >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <FaBell className="text-violet-600 dark:text-violet-400" />
                                <h2 className="font-bold text-lg text-slate-800 dark:text-white">Notifications</h2>
                                <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs px-2 py-0.5 rounded-full font-bold">
                                    {notifications.filter(n => !n.read).length}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                            <AnimatePresence mode="wait">
                                {selectedNotification ? (
                                    <motion.div
                                        key="detail"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="p-6 space-y-6 h-full"
                                    >
                                        <button
                                            onClick={() => setSelectedNotification(null)}
                                            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-2"
                                        >
                                            <FaArrowLeft /> Back to List
                                        </button>

                                        <div className={`p-4 rounded-2xl border ${getTypeColor(selectedNotification.type)}`}>
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm shrink-0">
                                                    {getTypeIcon(selectedNotification.type)}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                                                        {selectedNotification.type}
                                                    </span>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 leading-tight">
                                                        {selectedNotification.title || "Untitled Notification"}
                                                    </h3>
                                                    <span className="text-xs font-medium text-slate-500 mt-2 block">
                                                        {new Date(selectedNotification.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="prose dark:prose-invert max-w-none">
                                            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                                                {selectedNotification.message}
                                            </p>
                                        </div>

                                        {selectedNotification.attachmentUrl && (
                                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Attachment</h4>
                                                <a
                                                    href={selectedNotification.attachmentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all group"
                                                >
                                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform text-violet-600 dark:text-violet-400">
                                                        <FaPaperclip size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                                            {selectedNotification.attachmentUrl.split('/').pop()}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-0.5">Click to view/download</p>
                                                    </div>
                                                </a>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="list"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-4 space-y-3"
                                    >
                                        {notifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center pt-20 text-slate-400 space-y-4">
                                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                                    <FaBell className="text-2xl opacity-20" />
                                                </div>
                                                <p className="text-sm">No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <motion.div
                                                    layout
                                                    key={n.id}
                                                    onClick={() => {
                                                        setSelectedNotification(n);
                                                        if (!n.read) onMarkRead(n.id);
                                                    }}
                                                    className={`p-4 rounded-xl border relative group cursor-pointer transition-all ${getTypeColor(n.type)} ${!n.read ? "shadow-md ring-1 ring-violet-500/20" : "opacity-80 hover:opacity-100"}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className="mt-1 shrink-0">
                                                            {getTypeIcon(n.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-1">
                                                                {n.title && (
                                                                    <h4 className={`font-bold text-sm ${!n.read ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                                                                        {n.title}
                                                                    </h4>
                                                                )}
                                                                {!n.read && (
                                                                    <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-1.5" />
                                                                )}
                                                            </div>
                                                            <p className={`text-sm leading-relaxed line-clamp-2 ${!n.read ? "text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-500"}`}>
                                                                {n.message}
                                                            </p>
                                                            <div className="flex justify-between items-center mt-3">
                                                                <span className="text-[10px] text-slate-400 font-medium">
                                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    {n.attachmentUrl && <FaPaperclip className="text-slate-400 text-xs" />}
                                                                    {n.type === "CIRCULAR" && (
                                                                        <span className="text-[10px] px-1.5 py-0.5 bg-violet-200 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded font-bold uppercase tracking-wider">
                                                                            Circular
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaBell, FaCheckDouble, FaExclamationTriangle, FaBullhorn, FaInfoCircle } from "react-icons/fa";

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: any[];
    onMarkRead: (id: string) => void;
}

export default function NotificationPanel({ isOpen, onClose, notifications, onMarkRead }: NotificationPanelProps) {
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

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
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
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => !n.read && onMarkRead(n.id)}
                                        className={`p-4 rounded-xl border relative group cursor-pointer transition-all ${getTypeColor(n.type)} ${!n.read ? "shadow-md ring-1 ring-violet-500/20" : "opacity-80"}`}
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
                                                <p className={`text-sm leading-relaxed ${!n.read ? "text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-500"}`}>
                                                    {n.message}
                                                </p>
                                                <div className="flex justify-between items-center mt-3">
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {n.type === "CIRCULAR" && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-violet-200 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded font-bold uppercase tracking-wider">
                                                            Circular
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

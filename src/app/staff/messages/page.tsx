"use client";

import { useEffect, useState, useRef } from "react";
import { FaUserCircle, FaPaperPlane, FaSearch } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
    sender: {
        name: string;
        role: string;
    };
    receiver: {
        name: string;
        role: string;
    };
}

interface UserSummary {
    id: string;
    name: string;
    role: string;
    lastMessage?: string;
}

export default function StaffMessagesPage() {
    const { data: session } = useSession();
    const [threads, setThreads] = useState<UserSummary[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch conversation threads (users who have messaged)
    const fetchThreads = async () => {
        try {
            const res = await fetch("/api/messages");
            const data = await res.json();
            if (Array.isArray(data)) {
                // Ensure unique users
                const uniqueUsers = Array.from(new Map(data.map((u: any) => [u.id, u])).values());
                setThreads(uniqueUsers as UserSummary[]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Fetch messages for selected thread
    const fetchMessages = async (userId: string) => {
        try {
            const res = await fetch(`/api/messages?targetId=${userId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchThreads();
        const interval = setInterval(fetchThreads, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            fetchMessages(selectedUserId);
            const interval = setInterval(() => fetchMessages(selectedUserId), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedUserId]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedUserId) return;

        const content = input.trim();
        setInput("");

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, receiverId: selectedUserId })
            });

            if (res.ok) {
                fetchMessages(selectedUserId);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="p-6 h-screen flex flex-col pt-20 sm:pt-6 bg-slate-50 dark:bg-slate-950">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-3">
                <FaPaperPlane className="text-violet-600 dark:text-violet-400" />
                Messages
            </h1>

            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex">

                {/* Threads Cloud */}
                <div className={`w-full sm:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col ${selectedUserId ? 'hidden sm:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                        <div className="relative group">
                            <FaSearch className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="w-full bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 border border-transparent focus:border-violet-500/50 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {threads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center p-6">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <FaUserCircle className="text-3xl opacity-20" />
                                </div>
                                <p className="text-sm font-medium">No active conversations</p>
                                <p className="text-xs mt-1 opacity-60">Messages from students will appear here</p>
                            </div>
                        ) : (
                            threads.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUserId(user.id)}
                                    className={`w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left border-b border-slate-50 dark:border-slate-800/50 group relative overflow-hidden ${selectedUserId === user.id ? "bg-violet-50/80 dark:bg-violet-900/10" : ""}`}
                                >
                                    {selectedUserId === user.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600 dark:bg-violet-500" />
                                    )}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${selectedUserId === user.id ? "bg-violet-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}>
                                        {user.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <p className={`font-bold text-sm truncate ${selectedUserId === user.id ? "text-violet-700 dark:text-violet-300" : "text-slate-800 dark:text-white"}`}>{user.name}</p>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.role}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col bg-slate-50/30 dark:bg-black/20 ${!selectedUserId ? 'hidden sm:flex' : 'flex'}`}>
                    {!selectedUserId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <FaPaperPlane className="text-4xl text-violet-200 dark:text-slate-700 ml-[-4px] mt-1" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Select a Conversation</h3>
                            <p className="max-w-xs mx-auto text-sm opacity-60">Choose a student from the list to view history and send messages.</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                                <button onClick={() => setSelectedUserId(null)} className="sm:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
                                    <FaSearch size={14} className="rotate-180" />
                                    {/* Using search icon rotated as generic back for now - better to use ArrowLeft if available, checking imports.. we don't have ArrowLeft imported, sticking to this or FaChevronLeft if added */}
                                </button>
                                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 flex items-center justify-center font-bold border border-violet-200 dark:border-violet-800">
                                    {threads.find(t => t.id === selectedUserId)?.name[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-white text-base">
                                        {threads.find(t => t.id === selectedUserId)?.name}
                                    </div>
                                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-black/20">
                                {messages.map((msg) => {
                                    const isMe = msg.senderId === session?.user?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${isMe
                                                ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-none"
                                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none"
                                                }`}>
                                                {msg.content}
                                                <p className={`text-[10px] mt-1.5 opacity-60 text-right ${isMe ? "text-violet-100" : "text-slate-400"}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-3 items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 px-5 py-3 rounded-full text-sm outline-none focus:ring-2 focus:ring-violet-500/50 border border-transparent focus:border-violet-500/20 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="p-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                                >
                                    <FaPaperPlane className="transform -translate-x-0.5 translate-y-0.5" />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

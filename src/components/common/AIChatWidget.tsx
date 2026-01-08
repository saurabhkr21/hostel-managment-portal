"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaPaperPlane, FaTimes, FaComments } from "react-icons/fa";

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
}

export default function AIChatWidget() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);


    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "ai",
            content: "Hello! I am your Hostel AI Assistant. How can I help you today?"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Hide on specific pages
    if (pathname === "/staff/messages") return null;

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage], // Send context
                    userRole: session?.user?.role,
                    userName: session?.user?.name,
                    currentPath: pathname
                })
            });

            const data = await response.json();

            if (data.error) {
                // Check specifically for missing key error
                let errorMessage = data.error;
                if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
                    errorMessage = "🔔 internal_error: The AI API is not enabled. Please enable 'Generative Language API' in Google Cloud Console.";
                } else if (errorMessage.includes("API Key")) {
                    errorMessage = "✨ Setup Required: Please add a valid GEMINI_API_KEY to your .env file.";
                }

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "ai",
                    content: errorMessage
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "ai",
                    content: data.reply
                }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "ai",
                content: "Network error. Please check your connection."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 mb-4 overflow-hidden pointer-events-auto flex flex-col max-h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-linear-to-r from-violet-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm border border-white/10">
                                    <FaRobot className="text-lg" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Hostel Assistant</h3>
                                    <p className="text-[10px] text-violet-100 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                        {isLoading ? "Thinking..." : "Online"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50 min-h-[350px]">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "user"
                                            ? "bg-linear-to-r from-violet-600 to-indigo-600 text-white rounded-br-none shadow-violet-500/20"
                                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none"
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap">
                                            {msg.content.split('\n').map((line, i) => (
                                                <p key={i} className="mb-1 last:mb-0">{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700 flex gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-150"></span>
                                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-300"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about rules, rooms, or stats..."
                                className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-2.5 rounded-full text-sm outline-none focus:ring-2 focus:ring-violet-500/50 border border-transparent focus:border-violet-500/30 transition-all placeholder:text-slate-400"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="p-3 bg-linear-to-r from-violet-600 to-indigo-600 hover:shadow-lg disabled:opacity-50 disabled:shadow-none hover:shadow-violet-500/30 text-white rounded-full transition-all active:scale-95"
                            >
                                <FaPaperPlane className="text-sm" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                layoutId="chat-toggle"
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto bg-linear-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-violet-600/40 text-white p-4 rounded-full transition-all active:scale-95 group relative border border-white/10"
            >
                {isOpen ? <FaTimes className="text-xl" /> : <FaComments className="text-xl" />}
                {!isOpen && (
                    <span className="absolute 0 top-0 right-0 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500 border-2 border-white dark:border-slate-900"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
}

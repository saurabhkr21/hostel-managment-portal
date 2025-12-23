"use client";

import { useEffect, useState, useRef } from "react";
import { FaUserCircle, FaPaperPlane, FaSearch, FaCheck, FaTrash, FaInbox, FaUserClock, FaArrowLeft } from "react-icons/fa";
import { useSession } from "next-auth/react";

interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
}

interface UserSummary {
    id: string;
    name: string;
    role: string;
    profileImage?: string;
    lastMessage?: string;
    conversationId: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    initiatorId: string;
}

export default function StudentMessagesPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<"primary" | "requests">("primary");
    const [threads, setThreads] = useState<UserSummary[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch conversation threads based on active tab
    const fetchThreads = async () => {
        try {
            const res = await fetch(`/api/messages?type=${activeTab}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setThreads(data);
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

    // Initial load & Polling
    useEffect(() => {
        fetchThreads();
        const interval = setInterval(fetchThreads, 10000);
        return () => clearInterval(interval);
    }, [activeTab]);

    useEffect(() => {
        if (selectedUserId) {
            fetchMessages(selectedUserId);
            const interval = setInterval(() => fetchMessages(selectedUserId), 3000);
            return () => clearInterval(interval);
        } else {
            setMessages([]);
        }
    }, [selectedUserId]);

    // Scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
                fetchThreads(); // Refresh list order
            }
        } catch (error) {
            console.error(error);
        }
    };

    const acceptRequest = async (conversationId: string) => {
        try {
            const res = await fetch("/api/conversations/accept", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId })
            });
            if (res.ok) {
                // Refresh threads - it should move to primary
                fetchThreads();
                // If selected, refresh to show input
                if (selectedUserId) fetchMessages(selectedUserId);

                // Switch to primary tab to see it? Or stay in requests until refreshed?
                // Better to just refresh current list, it will disappear from Requests
                setActiveTab("primary");
                setSelectedUserId(null); // Deselect to avoid confusion
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Unified list: if searching, show search results. Else show threads.
    const [searchResults, setSearchResults] = useState<UserSummary[]>([]);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 0) {
                try {
                    const res = await fetch(`/api/messages?search=${encodeURIComponent(searchQuery)}`);
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setSearchResults(data);
                    }
                } catch (error) {
                    console.error("Search error", error);
                }
            } else {
                setSearchResults([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const currentThread = searchResults.length > 0 && searchQuery
        ? searchResults.find(t => t.id === selectedUserId)
        : threads.find(t => t.id === selectedUserId);

    const displayList = searchQuery.trim().length > 0 ? searchResults : threads;

    return (
        <div className="p-0 md:p-6 h-dvh md:h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <h1 className="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2 pl-4 py-4 md:pl-2 md:py-0 border-b md:border-none border-slate-200 dark:border-slate-800 bg-white md:bg-transparent dark:bg-slate-900 md:dark:bg-transparent">
                <FaPaperPlane className="ml-12 md:ml-0 text-violet-600 dark:text-violet-400" />
                Messages
            </h1>

            <div className="flex-1 bg-white dark:bg-slate-900 rounded-none md:rounded-2xl shadow-none md:shadow-xl border-t md:border border-slate-200 dark:border-slate-800 overflow-hidden flex">

                {/* Left Sidebar */}
                <div className={`w-full sm:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col ${selectedUserId ? 'hidden sm:flex' : 'flex'}`}>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 dark:border-slate-800">
                        <button
                            onClick={() => { setActiveTab("primary"); setSelectedUserId(null); }}
                            className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === "primary"
                                ? "text-violet-600 border-b-2 border-violet-600 bg-violet-50/50 dark:bg-violet-900/10"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}
                        >
                            Primary
                        </button>
                        <button
                            onClick={() => { setActiveTab("requests"); setSelectedUserId(null); }}
                            className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === "requests"
                                ? "text-violet-600 border-b-2 border-violet-600 bg-violet-50/50 dark:bg-violet-900/10"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}
                        >
                            Requests
                        </button>
                    </div>

                    {/* Search (only for Primary mainly, but kept for both) */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                        <div className="relative group">
                            <FaSearch className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 border border-transparent focus:border-violet-500/50 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Thread List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {displayList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center p-6">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    {activeTab === "primary" ? <FaInbox className="text-3xl opacity-20" /> : <FaUserClock className="text-3xl opacity-20" />}
                                </div>
                                <p className="text-sm font-medium">
                                    {searchQuery ? "No users found" : (activeTab === "primary" ? "No messages yet" : "No new requests")}
                                </p>
                                <p className="text-xs mt-1 opacity-60">
                                    {searchQuery ? "Try a different name" : (activeTab === "primary" ? "Start chatting with your friends!" : "Message requests will appear here")}
                                </p>
                            </div>
                        ) : (
                            displayList.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUserId(user.id)}
                                    className={`w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left border-b border-slate-50 dark:border-slate-800/50 group relative ${selectedUserId === user.id ? "bg-violet-50/80 dark:bg-violet-900/10" : ""}`}
                                >
                                    {selectedUserId === user.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600 dark:bg-violet-500" />
                                    )}
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name && user.name[0]
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <p className={`font-bold text-sm truncate ${selectedUserId === user.id ? "text-violet-700 dark:text-violet-300" : "text-slate-800 dark:text-white"}`}>{user.name}</p>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {user.lastMessage || "Started a conversation"}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Chat Area */}
                <div className={`flex-1 flex flex-col bg-slate-50/30 dark:bg-black/20 ${!selectedUserId ? 'hidden sm:flex' : 'flex'}`}>
                    {!selectedUserId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <FaPaperPlane className="text-4xl text-violet-200 dark:text-slate-700 ml-[-4px] mt-1" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Select a Conversation</h3>
                            <p className="max-w-xs mx-auto text-sm opacity-60">Choose a thread to view messages.</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                                <button onClick={() => setSelectedUserId(null)} className="sm:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
                                    <FaArrowLeft size={16} />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 flex items-center justify-center font-bold border border-violet-200 dark:border-violet-800 overflow-hidden">
                                    {currentThread?.profileImage ? (
                                        <img src={currentThread.profileImage} alt={currentThread.name} className="w-full h-full object-cover" />
                                    ) : (
                                        currentThread?.name && currentThread.name[0]
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-800 dark:text-white text-base">
                                        {currentThread?.name}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {activeTab === "requests" ? "Sent a message request" : "Online"}
                                    </p>
                                </div>

                                {/* Accept/Decline Buttons for Requests */}
                                {activeTab === "requests" && currentThread && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => acceptRequest(currentThread.conversationId)}
                                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-violet-500/20"
                                        >
                                            <FaCheck /> Accept
                                        </button>
                                        <button className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg flex items-center gap-2 transition-all">
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-black/20">
                                {activeTab === "requests" && (
                                    <div className="p-6 text-center text-slate-500">
                                        <p className="text-sm font-medium mb-2">Message Request</p>
                                        <p className="text-xs max-w-sm mx-auto opacity-70">
                                            {currentThread?.name} wants to send you a message. Accept the request to start chatting.
                                        </p>
                                    </div>
                                )}

                                {messages.map((msg) => {
                                    const isMe = msg.senderId === session?.user?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${isMe
                                                ? "bg-linear-to-br from-violet-600 to-indigo-600 text-white rounded-br-none"
                                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none"
                                                }`}>
                                                {msg.content}
                                                <p className={`text-[10px] mt-1 opacity-60 text-right ${isMe ? "text-violet-100" : "text-slate-400"}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>

                            {/* Input - Only visible if Primary tab (or Accepted) */}
                            {activeTab === "primary" && (
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
                                        className="p-3.5 bg-linear-to-r from-violet-600 to-indigo-600 text-white rounded-full hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                                    >
                                        <FaPaperPlane className="transform -translate-x-0.5 translate-y-0.5" />
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

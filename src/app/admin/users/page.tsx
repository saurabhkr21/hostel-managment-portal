"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserShield, FaUserGraduate, FaUserTie, FaBed, FaEye } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import UserModal from "@/components/admin/UserModal";

interface User {
    id: string;
    email: string;
    role: "ADMIN" | "STAFF" | "STUDENT";
    name: string;
    profile?: any;
    roomId?: string;
    room?: {
        roomNumber: string;
    };
}

interface Room {
    id: string;
    roomNumber: string;
    capacity: number;
    occupants: { id: string }[];
}

export default function UsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
        fetchRooms();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            console.log("Users Data:", data);
            if (!data.error) setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            const res = await fetch("/api/rooms");
            const data = await res.json();
            if (!data.error) setRooms(data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    const handleSave = async (formData: any) => {
        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
            const method = editingUser ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchUsers();
                fetchRooms(); // Refresh rooms to update occupancy
                setEditingUser(null);
            } else {
                const error = await res.json();
                alert(error.error || "Failed to save user");
            }
        } catch (error) {
            console.error("Error saving user:", error);
            alert("An error occurred while saving.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchUsers();
                fetchRooms();
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const [filterRole, setFilterRole] = useState<"ALL" | "ADMIN" | "STAFF" | "STUDENT">("ALL");

    const filteredUsers = users.filter((user) => {
        const matchesSearch = (user.email || "").toLowerCase().includes(search.toLowerCase()) ||
            (user.name || "").toLowerCase().includes(search.toLowerCase());
        const matchesRole = filterRole === "ALL" || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "ADMIN": return <FaUserShield className="text-rose-500" />;
            case "STAFF": return <FaUserTie className="text-emerald-500" />;
            default: return <FaUserGraduate className="text-violet-500" />;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "ADMIN": return "bg-rose-100 text-rose-700 border-rose-200";
            case "STAFF": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default: return "bg-violet-100 text-violet-700 border-violet-200";
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">User Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage admins, staff, and students</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium shadow-lg shadow-violet-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                    >
                        <FaPlus /> Add User
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <div className="relative w-full max-w-lg group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaSearch className="text-slate-400 dark:text-slate-500 group-focus-within:text-violet-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all dark:text-white dark:placeholder-slate-500 font-medium"
                            />
                        </div>
                    </div>



                    {/* Role Filter Tabs */}
                    <div className="flex border-b border-slate-100 dark:border-slate-700 overflow-x-auto bg-slate-50/50 dark:bg-slate-800/50 px-6">
                        {["ALL", "ADMIN", "STAFF", "STUDENT"].map((role) => (
                            <button
                                key={role}
                                onClick={() => setFilterRole(role as any)}
                                className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${filterRole === role
                                    ? "border-violet-600 text-violet-700 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-900/20"
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    }`}
                            >
                                {role === "ALL" ? "All Users" : role.charAt(0) + role.slice(1).toLowerCase() + "s"}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-left">User</th>
                                    <th className="px-6 py-4 text-left">Role</th>
                                    <th className="px-6 py-4 text-left">Room</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                <AnimatePresence>
                                    {filteredUsers.map((user) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-lg overflow-hidden`}>
                                                        {user.profile?.profileImage ? (
                                                            <img src={user.profile.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            getRoleIcon(user.role)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-white">
                                                            {user.role === "STUDENT" ? (
                                                                <Link href={`/staff/students/${user.id}`} className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline">
                                                                    {user.name}
                                                                </Link>
                                                            ) : (
                                                                user.name
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.room ? (
                                                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 px-3 py-1 rounded-lg w-fit">
                                                        <FaBed className="text-slate-400 dark:text-slate-500" />
                                                        Room {user.room.roomNumber}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-slate-500 text-sm italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
                                                        title="Edit User"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    {user.role === "STUDENT" && (
                                                        <Link
                                                            href={`/staff/students/${user.id}`}
                                                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors flex items-center justify-center"
                                                            title="View Profile"
                                                        >
                                                            <FaEye />
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>

                <AnimatePresence>
                    {isModalOpen && (
                        <UserModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onSave={handleSave}
                            user={editingUser}
                            rooms={rooms}
                        />
                    )}
                </AnimatePresence>
            </div >
        </div >
    );
}

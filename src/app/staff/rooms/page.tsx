"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBed, FaUsers, FaExternalLinkAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Room {
    id: string;
    roomNumber: string;
    type: string;
    capacity: number;
    occupants: {
        id: string;
        name: string | null;
        email: string;
    }[];
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [formData, setFormData] = useState({
        roomNumber: "",
        capacity: 2,
        type: "Double", // Default type
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await fetch("/api/rooms");
            const data = await res.json();
            if (!data.error) setRooms(data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingRoom ? `/api/rooms/${editingRoom.id}` : "/api/rooms";
            const method = editingRoom ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchRooms();
                resetForm();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to save room");
            }
        } catch (error) {
            console.error("Error saving room:", error);
            alert("An error occurred");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this room?")) return;
        try {
            const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchRooms();
            } else {
                const err = await res.json();
                alert(`Failed to delete: ${err.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error deleting room:", error);
            alert("Delete failed");
        }
    };

    const resetForm = () => {
        setEditingRoom(null);
        setFormData({ roomNumber: "", capacity: 2, type: "Double" });
    };

    const openEditModal = (room: Room) => {
        setEditingRoom(room);
        setFormData({
            roomNumber: room.roomNumber,
            capacity: room.capacity,
            type: room.type || "Double"
        });
        setIsModalOpen(true);
    };

    const filteredRooms = rooms.filter((room) =>
        (room.roomNumber || "").toLowerCase().includes(search.toLowerCase())
    );

    const [viewingRoom, setViewingRoom] = useState<Room | null>(null);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Room Management</h1>
                        <p className="text-slate-500 mt-1">Manage hostel rooms and occupancy</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium shadow-lg shadow-violet-200 transition-all hover:scale-105 active:scale-95"
                    >
                        <FaPlus /> Add Room
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative max-w-md w-full">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search rooms..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left">Room Number</th>
                                    <th className="px-6 py-4 text-left">Type</th>
                                    <th className="px-6 py-4 text-left">Capacity</th>
                                    <th className="px-6 py-4 text-left">Occupancy</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence>
                                    {filteredRooms.map((room) => (
                                        <motion.tr
                                            key={room.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div
                                                    className="flex items-center gap-3 cursor-pointer group"
                                                    onClick={() => setViewingRoom(room)}
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shadow-sm group-hover:bg-violet-200 transition-colors">
                                                        <FaBed />
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-slate-800 group-hover:text-violet-600 transition-colors">Room {room.roomNumber}</span>
                                                        <p className="text-[10px] text-slate-400">Click for details</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                                                    {room.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">{room.capacity} Students</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2 max-w-[140px]">
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                                                        <span>{room.occupants.length} Occupied</span>
                                                        <span>{room.capacity - room.occupants.length} Free</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 shadow-sm ${room.occupants.length >= room.capacity
                                                                ? "bg-rose-500"
                                                                : room.occupants.length > 0
                                                                    ? "bg-violet-500"
                                                                    : "bg-emerald-500"
                                                                }`}
                                                            style={{
                                                                width: `${(room.occupants.length / room.capacity) * 100}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setViewingRoom(room)}
                                                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <FaUsers />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(room)}
                                                        className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                                        title="Edit Room"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(room.id)}
                                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Delete Room"
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

                {/* Edit/Create Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-xl font-bold text-slate-800">
                                        {editingRoom ? "Edit Room" : "Add New Room"}
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">Enter room details below</p>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Room Number</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                            placeholder="e.g. A-101"
                                            value={formData.roomNumber}
                                            onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Room Type</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all appearance-none"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option value="Single">Single (1 Bed)</option>
                                                <option value="Double">Double (2 Beds)</option>
                                                <option value="Triple">Triple (3 Beds)</option>
                                                <option value="Dormitory">Dormitory (4+ Beds)</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Capacity</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium shadow-lg shadow-violet-200 transition-all hover:scale-105 active:scale-95"
                                        >
                                            {editingRoom ? "Save Changes" : "Create Room"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Occupants Detail Modal */}
                <AnimatePresence>
                    {viewingRoom && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-100 bg-violet-50 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-violet-900">
                                            Room {viewingRoom.roomNumber} Details
                                        </h2>
                                        <p className="text-sm text-violet-600 mt-1">
                                            Occupancy: {viewingRoom.occupants.length} / {viewingRoom.capacity}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-violet-600 shadow-sm">
                                        <FaUsers size={20} />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Current Occupants</h3>
                                    <div className="space-y-3">
                                        {viewingRoom.occupants.length === 0 ? (
                                            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                <p className="text-slate-500 italic">This room is currently empty.</p>
                                            </div>
                                        ) : (
                                            viewingRoom.occupants.map((student) => (
                                                <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-violet-200 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center font-bold text-sm">
                                                            {student.name ? student.name.charAt(0) : "S"}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">
                                                                {student.name || "Unknown Student"}
                                                            </p>
                                                            <p className="text-xs text-slate-500">{student.email}</p>
                                                            <p className="text-[10px] text-slate-400">ID: {student.id.slice(0, 8)}...</p>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/staff/students/${student.id}`}
                                                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-100 rounded-lg transition-colors"
                                                        title="View Full Profile"
                                                    >
                                                        <FaExternalLinkAlt size={14} />
                                                    </Link>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="mt-8">
                                        <button
                                            onClick={() => setViewingRoom(null)}
                                            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                                        >
                                            Close Details
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

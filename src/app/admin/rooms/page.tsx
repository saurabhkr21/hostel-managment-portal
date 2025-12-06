"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBed, FaUsers, FaExternalLinkAlt, FaSort, FaFilter, FaUserGraduate, FaGripVertical, FaBuilding } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Room {
    id: string;
    roomNumber: string;
    type: string;
    capacity: number;
    block: string | null;
    occupants: {
        id: string;
        name: string | null;
        email: string;
        profile: {
            profileImage: string | null;
        } | null;
    }[];
}

interface Student {
    id: string;
    name: string | null;
    email: string;
    profile: {
        profileImage: string | null;
    } | null;
}

export default function AdminRoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("number"); // number, capacity, occupancy, block
    const [filterType, setFilterType] = useState("All");
    const [filterBlock, setFilterBlock] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [formData, setFormData] = useState({
        roomNumber: "",
        capacity: 2,
        type: "Double",
        block: "Main Block",
    });

    // Drag and Drop State
    const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchRooms(), fetchUnassignedStudents()]);
        setLoading(false);
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

    const fetchUnassignedStudents = async () => {
        try {
            const res = await fetch("/api/staff/students?unassigned=true");
            const data = await res.json();
            if (!data.error) setUnassignedStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
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
        setFormData({ roomNumber: "", capacity: 2, type: "Double", block: "Main Block" });
    };

    const openEditModal = (room: Room) => {
        setEditingRoom(room);
        setFormData({
            roomNumber: room.roomNumber,
            capacity: room.capacity,
            type: room.type || "Double",
            block: room.block || "Main Block",
        });
        setIsModalOpen(true);
    };

    // Drag Handlers
    const handleDragStart = (e: React.DragEvent, studentId: string) => {
        setDraggedStudentId(studentId);
        e.dataTransfer.effectAllowed = "move";
        // e.dataTransfer.setData("studentId", studentId); // Optional, using state instead
    };

    const handleDragOver = (e: React.DragEvent, room: Room) => {
        e.preventDefault();
        if (room.occupants.length >= room.capacity) {
            e.dataTransfer.dropEffect = "none";
        } else {
            e.dataTransfer.dropEffect = "move";
        }
    };

    const handleDrop = async (e: React.DragEvent, roomId: string) => {
        e.preventDefault();
        if (!draggedStudentId) return;

        // Optimistic Update (Optional: complex to revert, so just call API)
        try {
            const res = await fetch("/api/rooms/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, studentId: draggedStudentId }),
            });

            if (res.ok) {
                // Refresh data
                fetchData();
                setDraggedStudentId(null);
            } else {
                const err = await res.json();
                alert(err.error || "Failed to assign room");
                setDraggedStudentId(null);
            }
        } catch (error) {
            console.error("Assignment failed:", error);
            alert("Failed to assign student");
            setDraggedStudentId(null);
        }
    };

    const uniqueBlocks = Array.from(new Set(rooms.map(r => r.block || "Main Block"))).sort();

    const filteredRooms = rooms
        .filter((room) => {
            const matchesSearch = (room.roomNumber || "").toLowerCase().includes(search.toLowerCase()) ||
                (room.block || "").toLowerCase().includes(search.toLowerCase());
            const matchesType = filterType === "All" || room.type === filterType;
            const matchesBlock = filterBlock === "All" || (room.block || "Main Block") === filterBlock;
            return matchesSearch && matchesType && matchesBlock;
        })
        .sort((a, b) => {
            if (sortBy === "number") {
                const numA = parseInt(a.roomNumber.replace(/\D/g, "") || "0");
                const numB = parseInt(b.roomNumber.replace(/\D/g, "") || "0");
                return numA - numB;
            }
            if (sortBy === "block") return (a.block || "").localeCompare(b.block || "");
            if (sortBy === "capacity_desc") return b.capacity - a.capacity;
            if (sortBy === "capacity_asc") return a.capacity - b.capacity;
            if (sortBy === "occupancy_desc") return b.occupants.length - a.occupants.length;
            if (sortBy === "occupancy_asc") return a.occupants.length - b.occupants.length;
            return 0;
        });

    const [viewingRoom, setViewingRoom] = useState<Room | null>(null);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-8 transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Room Management (Admin)</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage rooms and drag students to assign</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium shadow-lg shadow-violet-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                    >
                        <FaPlus /> Add Room
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Main Room List */}
                    <div className="xl:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col xl:flex-row justify-between gap-6 items-center">
                                {/* Search Bar */}
                                <div className="relative w-full max-w-lg group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaSearch className="text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search rooms by number or block..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all dark:text-white font-medium"
                                    />
                                </div>

                                {/* Filters & Sort */}
                                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-center">
                                    {/* Block Filter */}
                                    <div className="relative w-full sm:w-auto min-w-[160px]">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <FaBuilding />
                                        </div>
                                        <select
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm font-semibold text-slate-700 dark:text-white appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            value={filterBlock}
                                            onChange={(e) => setFilterBlock(e.target.value)}
                                        >
                                            <option value="All">All Blocks</option>
                                            {uniqueBlocks.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>

                                    {/* Type Filter */}
                                    <div className="relative w-full sm:w-auto min-w-[150px]">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <FaFilter />
                                        </div>
                                        <select
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm font-semibold text-slate-700 dark:text-white appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                        >
                                            <option value="All">All Types</option>
                                            <option value="Single">Single</option>
                                            <option value="Double">Double</option>
                                            <option value="Triple">Triple</option>
                                            <option value="Dormitory">Dormitory</option>
                                        </select>
                                    </div>

                                    {/* Sort Dropdown */}
                                    <div className="relative w-full sm:w-auto min-w-[180px]">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <FaSort />
                                        </div>
                                        <select
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm font-semibold text-slate-700 dark:text-white appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <option value="number">Sort: Room No.</option>
                                            <option value="block">Sort: Block Name</option>
                                            <option value="capacity_desc">Capacity: High-Low</option>
                                            <option value="capacity_asc">Capacity: Low-High</option>
                                            <option value="occupancy_desc">Occupancy: High-Low</option>
                                            <option value="occupancy_asc">Occupancy: Low-High</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left">Room Info</th>
                                            <th className="px-6 py-4 text-left">Details</th>
                                            <th className="px-6 py-4 text-left">Capacity</th>
                                            <th className="px-6 py-4 text-left">Occupancy</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        <AnimatePresence>
                                            {filteredRooms.map((room) => {
                                                const isFull = room.occupants.length >= room.capacity;
                                                return (
                                                    <motion.tr
                                                        key={room.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className={`transition-all duration-300 relative ${isFull ? 'bg-slate-50/50 dark:bg-slate-900/20' : 'hover:bg-white dark:hover:bg-slate-700/30 hover:shadow-lg hover:z-10 cursor-pointer'}`}
                                                        onDragOver={(e) => !isFull && handleDragOver(e, room)}
                                                        onDrop={(e) => !isFull && handleDrop(e, room.id)}
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div
                                                                className="flex items-center gap-3 cursor-pointer group"
                                                                onClick={() => setViewingRoom(room)}
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${isFull
                                                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                                                                    : "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50"
                                                                    }`}>
                                                                    <FaBed />
                                                                </div>
                                                                <div>
                                                                    <span className={`font-semibold transition-colors ${isFull ? "text-slate-500 dark:text-slate-500" : "text-slate-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400"
                                                                        }`}>{room.roomNumber}</span>
                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wide">
                                                                            {room.block || "Main"}
                                                                        </span>
                                                                        {isFull && <span className="text-[10px] text-rose-500 font-bold">FULL</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                    {room.type} Type
                                                                </span>
                                                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                                                    Max {room.capacity} Students
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-2 max-w-[140px]">
                                                                <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                                                    <span>{room.occupants.length} Occupied</span>
                                                                    <span>{room.capacity - room.occupants.length} Free</span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
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
                                                                    className="p-2 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
                                                                    title="View Details"
                                                                >
                                                                    <FaUsers />
                                                                </button>
                                                                <button
                                                                    onClick={() => openEditModal(room)}
                                                                    className="p-2 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
                                                                    title="Edit Room"
                                                                >
                                                                    <FaEdit />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(room.id)}
                                                                    className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                                                    title="Delete Room"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                )
                                            })}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Unassigned Students Sidebar */}
                    <div className="xl:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-8 max-h-[calc(100vh-2rem)] flex flex-col">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-amber-50/50 dark:bg-amber-900/10">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <FaUserGraduate className="text-amber-500" />
                                    Unassigned Students
                                    <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs px-2 py-0.5 rounded-full ml-auto">
                                        {unassignedStudents.length}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Drag students to a room to assign them.</p>
                            </div>

                            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                                {unassignedStudents.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm italic">
                                        All students assigned!
                                    </div>
                                ) : (
                                    unassignedStudents.map(student => (
                                        <div
                                            key={student.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, student.id)}
                                            className="bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 p-3 rounded-xl shadow-sm hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-500 hover:-translate-y-1 cursor-grab active:cursor-grabbing transition-all flex items-center gap-3 group"
                                        >
                                            <FaGripVertical className="text-slate-300 dark:text-slate-500 group-hover:text-slate-400" />
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {student.profile?.profileImage ? (
                                                    <img src={student.profile.profileImage} alt={student.name || "S"} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-300">
                                                        {student.name?.charAt(0) || "S"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{student.name}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{student.email}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit/Create Modal (Existing code) */}
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
                                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                    {/* Block Name Input */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Block Name (House)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <FaBuilding />
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
                                                placeholder="e.g. Block A, Kaveri House"
                                                value={formData.block}
                                                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Room Number</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                    <FaBed />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
                                                    placeholder="e.g. 101"
                                                    value={formData.roomNumber}
                                                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Room Type</label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all appearance-none font-medium text-slate-700"
                                                        value={formData.type}
                                                        onChange={(e) => {
                                                            const newType = e.target.value;
                                                            let newCapacity = 2;
                                                            let prefix = "A-";

                                                            if (newType === "Single") { newCapacity = 1; prefix = "S-"; }
                                                            else if (newType === "Double") { newCapacity = 2; prefix = "D-"; }
                                                            else if (newType === "Triple") { newCapacity = 3; prefix = "T-"; }
                                                            else if (newType === "Dormitory") { newCapacity = 6; prefix = "DM-"; }

                                                            setFormData(prev => ({
                                                                ...prev,
                                                                type: newType,
                                                                capacity: newCapacity,
                                                                roomNumber: editingRoom ? prev.roomNumber : prefix
                                                            }));
                                                        }}
                                                    >
                                                        <option value="Single">Single</option>
                                                        <option value="Double">Double</option>
                                                        <option value="Triple">Triple</option>
                                                        <option value="Dormitory">Dormitory</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Capacity</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                        <FaUsers />
                                                    </div>
                                                    <input
                                                        type="number"
                                                        required
                                                        min={1}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all font-medium"
                                                        value={formData.capacity}
                                                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-bold text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                        >
                                            {editingRoom ? <FaEdit /> : <FaPlus />}
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
                                            {viewingRoom.block} - Room {viewingRoom.roomNumber} Details
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
                                                <div key={student.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-violet-200 hover:shadow-lg hover:scale-[1.02] transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-slate-100 shadow-sm">
                                                            {student.profile?.profileImage ? (
                                                                <img src={student.profile.profileImage} alt={student.name || "Student"} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="bg-gradient-to-br from-violet-500 to-fuchsia-600 bg-clip-text text-transparent">
                                                                    {student.name ? student.name.charAt(0) : "S"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 group-hover:text-violet-700 transition-colors text-base">
                                                                {student.name || "Unknown Student"}
                                                            </p>
                                                            <p className="text-xs text-slate-500 font-medium">{student.email}</p>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/staff/students/${student.id}`}
                                                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-white hover:bg-violet-600 rounded-xl transition-all shadow-sm"
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

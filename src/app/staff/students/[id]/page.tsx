"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaBed, FaBuilding, FaGraduationCap, FaTint, FaMapMarkerAlt, FaUserFriends, FaCalendar } from "react-icons/fa";
import { motion } from "framer-motion";

interface StudentDetail {
    id: string;
    name: string | null;
    email: string;
    room: {
        roomNumber: string;
        type: string;
    } | null;
    profile: {
        dob: string | null;
        gender: string | null;
        phone: string | null;
        address: string | null;
        guardianName: string | null;
        guardianPhone: string | null;
        branch: string | null;
        yearSem: string | null;
        bloodGroup: string | null;
    } | null;
}

export default function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap params using React.use()
    const { id } = use(params);

    const [student, setStudent] = useState<StudentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await fetch(`/api/staff/students/${id}`);
                const data = await res.json();

                if (res.ok) {
                    setStudent(data);
                } else {
                    setError(data.error || "Failed to fetch student details");
                }
            } catch (err) {
                console.error(err);
                setError("An error occurred while fetching details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchStudent();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUser size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Student Not Found</h2>
                    <p className="text-slate-500 mb-6">{error || "The student details could not be loaded."}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-violet-600 transition-colors mb-6 group"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to List</span>
                </button>

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="h-32 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="flex items-end gap-6">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                                    <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-2xl font-bold overflow-hidden">
                                        {(student.name?.charAt(0) || "S")}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <h1 className="text-3xl font-bold text-slate-800">{student.name || "Unknown Name"}</h1>
                                    <p className="text-slate-500 flex items-center gap-2">
                                        <FaEnvelope size={14} /> {student.email}
                                    </p>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${student.room ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                    {student.room ? 'Assigned' : 'Unassigned'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Academic Info */}
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FaGraduationCap /> Academic Info
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-500">Department/Branch</p>
                                        <p className="font-medium text-slate-700">{student.profile?.branch || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Year/Sem</p>
                                        <p className="font-medium text-slate-700">{student.profile?.yearSem || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Student ID</p>
                                        <p className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200 inline-block text-slate-600">
                                            {student.id}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Room Info */}
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FaBed /> Room Details
                                </h3>
                                {student.room ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-lg">
                                                {student.room.roomNumber}
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Room Number</p>
                                                <p className="font-bold text-slate-800">Room {student.room.roomNumber}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Room Type</p>
                                            <p className="font-medium text-slate-700">{student.room.type}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col justify-center items-center text-center text-slate-400">
                                        <FaBed size={24} className="mb-2 opacity-50" />
                                        <p className="text-sm italic">No room assigned yet.</p>
                                    </div>
                                )}
                            </div>

                            {/* Personal Info */}
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FaUser /> Personal Details
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex gap-3 items-start">
                                        <FaPhone className="text-slate-400 mt-1" size={14} />
                                        <div>
                                            <p className="text-xs text-slate-500">Contact</p>
                                            <p className="font-medium text-slate-700">{student.profile?.phone || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <FaTint className="text-rose-400 mt-1" size={14} />
                                        <div>
                                            <p className="text-xs text-slate-500">Blood Group</p>
                                            <p className="font-medium text-slate-700">{student.profile?.bloodGroup || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <FaCalendar className="text-slate-400 mt-1" size={14} />
                                        <div>
                                            <p className="text-xs text-slate-500">Date of Birth</p>
                                            <p className="font-medium text-slate-700">
                                                {student.profile?.dob ? new Date(student.profile.dob).toLocaleDateString() : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Full Info Grid - Row 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            {/* Guardian Info */}
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FaUserFriends /> Guardian Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-slate-500">Guardian Name</p>
                                        <p className="font-semibold text-slate-800 text-lg">{student.profile?.guardianName || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Guardian Contact</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <FaPhone className="text-slate-400" size={12} />
                                            <span className="font-medium text-slate-700">{student.profile?.guardianPhone || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FaMapMarkerAlt /> Address
                                </h3>
                                <p className="text-slate-700 leading-relaxed">
                                    {student.profile?.address || "No address on file."}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

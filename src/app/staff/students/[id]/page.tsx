"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaBed, FaBuilding, FaGraduationCap, FaTint, FaMapMarkerAlt, FaUserFriends, FaCalendar, FaIdCard, FaEdit } from "react-icons/fa";
import { motion } from "framer-motion";
import UserModal from "@/components/admin/UserModal";

interface StudentDetail {
    id: string;
    name: string | null;
    email: string;
    room: {
        id: string;
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
        guardianEmail: string | null;
        branch: string | null;
        yearSem: string | null;
        section: string | null;
        bloodGroup: string | null;
        profileImage: string | null;
        fatherName: string | null;
        motherName: string | null;
        category: string | null;
        studentType: string | null;
        college: string | null;
        course: string | null;
        rollNo: string | null;
        enrollNo: string | null;
        highSchoolPercentage: number | null;
        intermediatePercentage: number | null;
        graduationPercentage: number | null;
    } | null;
}

export default function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const [student, setStudent] = useState<StudentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rooms, setRooms] = useState<any[]>([]); // Using any[] for simplicity as Room interface interacts with UserModal props

    const fetchRooms = async () => {
        try {
            const res = await fetch("/api/rooms");
            const data = await res.json();
            if (!data.error) setRooms(data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

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

    const handleSave = async (formData: any) => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchStudent(); // Refresh data
            } else {
                const err = await res.json();
                alert(err.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile");
        }
    };

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await fetch(`/api/staff/students/${id}`, { cache: "no-store" });
                const data = await res.json();
                console.log("Fetched student data:", data);

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
            fetchRooms();
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
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 group hover:shadow-md transition-shadow relative">
                    <div className="h-40 bg-gradient-to-r from-violet-600 to-fuchsia-600 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 opacity-10 rounded-full blur-2xl"></div>

                        {/* Top Actions */}
                        <div className="absolute top-6 left-6 z-20">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md border border-white/20 transition-all text-sm font-medium"
                            >
                                <FaArrowLeft />
                                <span>Back</span>
                            </button>
                        </div>
                        <div className="absolute top-6 right-6 z-20">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md border border-white/20 transition-all text-sm font-medium"
                            >
                                <FaEdit />
                                <span>Edit Profile</span>
                            </button>
                        </div>
                    </div>
                    <div className="px-8 pb-8">
                        <div className="relative flex flex-col md:flex-row justify-between items-end -mt-16 mb-6 gap-4">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 relative group-hover:scale-105 transition-transform duration-300">
                                    {student.profile?.profileImage ? (
                                        <img src={student.profile.profileImage} alt={student.name || "Profile"} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                            <span className="text-4xl font-bold text-slate-400">
                                                {(student.name?.charAt(0) || "S")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-2">
                                    <h1 className="text-3xl font-bold text-slate-800">{student.name || "Unknown Name"}</h1>
                                    <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2 font-medium">
                                        <FaEnvelope size={14} className="text-violet-500" /> {student.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${student.room ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                    <div className={`w-2 h-2 rounded-full ${student.room ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                    {student.room ? 'Assigned' : 'Unassigned'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Academic Info */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-violet-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <h3 className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FaGraduationCap size={16} /> Academic Info
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-slate-400 font-semibold uppercase">Department/Branch</p>
                                        <p className="font-semibold text-slate-800 text-lg">{student.profile?.branch || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-semibold uppercase">Year/Sem</p>
                                        <p className="font-semibold text-slate-800">{student.profile?.yearSem || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Student ID</p>
                                        <div className="flex items-center gap-2">
                                            <FaIdCard className="text-slate-300" />
                                            <code className="text-sm font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                                                {student.id}
                                            </code>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Room Info */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-violet-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <h3 className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FaBed size={16} /> Room Details
                                </h3>
                                {student.room ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-auto min-w-[3rem] h-12 px-3 rounded-xl bg-white text-violet-600 flex items-center justify-center font-bold text-xl shadow-sm border border-violet-100">
                                                {student.room.roomNumber}
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-semibold uppercase">Room Number</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-semibold uppercase">Room Type</p>
                                            <span className="inline-block mt-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
                                                {student.room.type}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col justify-center items-center text-center text-slate-400 py-4">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                                            <FaBed size={20} className="text-slate-300" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-500">No room assigned yet.</p>
                                    </div>
                                )}
                            </div>

                            {/* Personal Info */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-violet-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <h3 className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FaUser size={16} /> Personal Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm flex-shrink-0">
                                            <FaPhone size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-semibold uppercase">Phone Number</p>
                                            <p className="font-semibold text-slate-800">{student.profile?.phone || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-rose-400 shadow-sm flex-shrink-0">
                                            <FaTint size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-semibold uppercase">Blood Group</p>
                                            <p className="font-semibold text-slate-800">{student.profile?.bloodGroup || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm flex-shrink-0">
                                            <FaCalendar size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-semibold uppercase">Date of Birth</p>
                                            <p className="font-semibold text-slate-800">
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
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-violet-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <h3 className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FaUserFriends size={16} /> Guardian Information
                                </h3>
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400 font-semibold uppercase">Guardian Name</p>
                                        <p className="font-bold text-slate-800 text-lg mt-1">{student.profile?.guardianName || "N/A"}</p>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400 font-semibold uppercase">Guardian Contact</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="p-2 bg-white rounded-lg shadow-sm text-slate-600 font-medium border border-slate-100 block w-full text-center sm:text-left">
                                                {student.profile?.guardianPhone || "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-violet-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <h3 className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FaMapMarkerAlt size={16} /> Address
                                </h3>
                                <div className="bg-white p-4 rounded-xl border border-slate-100 text-slate-600 leading-relaxed shadow-sm min-h-[80px]">
                                    {student.profile?.address || "No address on file."}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>



            {
                student && (
                    <RenderUserModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSave}
                        student={student}
                        rooms={rooms}
                    />
                )
            }
        </div >
    );
}

// Separate component to handle memoization and conditional rendering logic cleanly
function RenderUserModal({ isOpen, onClose, onSave, student, rooms }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => Promise<void>, student: StudentDetail, rooms: any[] }) {
    const user = useMemo(() => {
        console.log("Preparing UserModal user prop with profile:", student.profile);
        return {
            id: student.id,
            name: student.name || "",
            email: student.email,
            role: "STUDENT",
            roomId: student.room?.id,
            profile: student.profile
        };
    }, [student]);

    return (
        <UserModal
            isOpen={isOpen}
            onClose={onClose}
            onSave={onSave}
            user={user as any}
            rooms={rooms}
        />
    );
}

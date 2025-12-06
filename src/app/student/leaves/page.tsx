"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaPhone, FaMapMarkerAlt, FaUser, FaInfoCircle } from "react-icons/fa";

export default function LeaveApplyPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [studentInfo, setStudentInfo] = useState<any>(null);
    const [formData, setFormData] = useState({
        type: "LEAVE",
        fromDate: "",
        toDate: "",
        timeFrom: "",
        timeTo: "",
        contactNo: "",
        reason: "",
        address: "",
        hostelReturnDate: "",
        hostelReturnTime: "",
    });

    useEffect(() => {
        fetchStudentInfo();
    }, []);

    const fetchStudentInfo = async () => {
        try {
            const res = await fetch("/api/student/info");
            const data = await res.json();
            if (!data.error) setStudentInfo(data);
        } catch (error) {
            console.error("Error fetching student info:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/leaves", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    fromDate: `${formData.fromDate}T${formData.timeFrom || "00:00"}`,
                    toDate: `${formData.toDate}T${formData.timeTo || "23:59"}`,
                }),
            });

            if (res.ok) {
                alert("Leave application submitted successfully!");
                // Reset form or redirect
            } else {
                alert("Failed to submit application");
            }
        } catch (error) {
            console.error("Error submitting leave:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-8"
            >
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-slate-800">Leave Application</h1>
                    <p className="text-slate-500">Apply for hostel leave or out pass</p>
                </div>

                {/* Student Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                        <div className="p-2 bg-violet-100/50 rounded-lg text-violet-600">
                            <FaUser size={20} />
                        </div>
                        <h2 className="font-semibold text-slate-800">Student Profile</h2>
                    </div>
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Profile Image */}
                            <div className="w-32 h-40 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden shadow-inner border border-slate-200 ring-4 ring-white shadow-sm">
                                {studentInfo?.profile?.profileImage ? (
                                    <img
                                        src={studentInfo.profile.profileImage}
                                        alt={studentInfo.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                        <FaUser size={40} />
                                    </div>
                                )}
                            </div>

                            {/* Info Grid */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                                <InfoItem label="Student Name" value={studentInfo?.name} />
                                <InfoItem label="Father's Name" value={studentInfo?.profile?.fatherName} />
                                <InfoItem label="Mother's Name" value={studentInfo?.profile?.motherName} />

                                <InfoItem label="Gender" value={studentInfo?.profile?.gender} />
                                <InfoItem label="Category" value={studentInfo?.profile?.category} />
                                <InfoItem label="Date of Birth" value={studentInfo?.profile?.dob ? new Date(studentInfo.profile.dob).toLocaleDateString() : null} />

                                <InfoItem label="Blood Group" value={studentInfo?.profile?.bloodGroup} />
                                <InfoItem label="Mobile No" value={studentInfo?.profile?.phone} />
                                <InfoItem label="Email ID" value={studentInfo?.email} className="truncate" />

                                <InfoItem label="College" value={studentInfo?.profile?.college} />
                                <InfoItem label="Course" value={studentInfo?.profile?.course} />
                                <InfoItem label="Year / Sem" value={studentInfo?.profile?.yearSem} />

                                <InfoItem label="Branch" value={studentInfo?.profile?.branch} />
                                <InfoItem label="Section" value={studentInfo?.profile?.section} />
                                <InfoItem label="Roll No" value={studentInfo?.profile?.rollNo} />

                                <InfoItem label="Enroll No" value={studentInfo?.profile?.enrollNo} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leave Application Form */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100/50 rounded-lg text-indigo-600">
                            <FaCalendarAlt size={20} />
                        </div>
                        <h2 className="font-semibold text-slate-800">Application Details</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup label="Date From" type="date" value={formData.fromDate} onChange={(v) => setFormData({ ...formData, fromDate: v })} required />
                                    <InputGroup label="Date To" type="date" value={formData.toDate} onChange={(v) => setFormData({ ...formData, toDate: v })} required />
                                </div>
                                <InputGroup label="Contact No during Leave" type="tel" value={formData.contactNo} onChange={(v) => setFormData({ ...formData, contactNo: v })} required placeholder="Enter mobile number" />

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Consent of Relation</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                                        placeholder="e.g. Father, Mother"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup label="Time From" type="time" value={formData.timeFrom} onChange={(v) => setFormData({ ...formData, timeFrom: v })} />
                                    <InputGroup label="Time To" type="time" value={formData.timeTo} onChange={(v) => setFormData({ ...formData, timeTo: v })} />
                                </div>

                                <InputGroup label="Purpose of Leave" type="text" value={formData.reason} onChange={(v) => setFormData({ ...formData, reason: v })} required placeholder="Reason for leave" />

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Address during Leave</label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all resize-none"
                                        placeholder="Full address details"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    px-8 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all
                                    ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700 hover:shadow-md active:transform active:scale-95'}
                                `}
                            >
                                {loading ? "Submitting..." : "Submit Application"}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

const InfoItem = ({ label, value, className = "" }: { label: string, value: any, className?: string }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-medium text-slate-700">{value || "—"}</span>
    </div>
);

const InputGroup = ({ label, type, value, onChange, required, placeholder }: any) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
        <input
            type={type}
            required={required}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);

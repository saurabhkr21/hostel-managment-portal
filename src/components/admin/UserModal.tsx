"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaSave, FaUser, FaGraduationCap, FaHome, FaUserShield, FaCamera } from "react-icons/fa";

interface User {
    id?: string;
    email: string;
    role: "ADMIN" | "STAFF" | "STUDENT";
    name: string;
    profile?: any;
    roomId?: string;
}

interface Room {
    id: string;
    roomNumber: string;
    capacity: number;
    occupants: { id: string }[];
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    user?: User | null;
    rooms: Room[];
}

export default function UserModal({ isOpen, onClose, onSave, user, rooms }: UserModalProps) {
    const [activeTab, setActiveTab] = useState("account");
    const [formData, setFormData] = useState({
        // Account
        profileImage: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "STUDENT",
        roomId: "",

        // Personal
        fatherName: "",
        motherName: "",
        gender: "",
        dob: "",
        bloodGroup: "",
        category: "",
        phone: "",

        // Academic
        studentType: "Regular",
        college: "",
        course: "",
        branch: "",
        yearSem: "",
        section: "",
        rollNo: "",
        enrollNo: "",
        highSchoolPercentage: "",
        intermediatePercentage: "",
        graduationPercentage: "",

        // Address
        address: "",
        guardianName: "",
        guardianPhone: "",
        guardianEmail: "",
    });

    useEffect(() => {
        if (user) {
            const [firstName, ...lastNameParts] = user.name.split(" ");
            setFormData({
                profileImage: user.profile?.profileImage || "",
                email: user.email,
                password: "",
                firstName: firstName || "",
                lastName: lastNameParts.join(" ") || "",
                role: user.role,
                roomId: user.roomId || "",

                fatherName: user.profile?.fatherName || "",
                motherName: user.profile?.motherName || "",
                gender: user.profile?.gender || "",
                dob: user.profile?.dob ? new Date(user.profile.dob).toISOString().split('T')[0] : "",
                bloodGroup: user.profile?.bloodGroup || "",
                category: user.profile?.category || "",
                phone: user.profile?.phone || "",

                studentType: user.profile?.studentType || "Regular",
                college: user.profile?.college || "",
                course: user.profile?.course || "",
                branch: user.profile?.branch || "",
                yearSem: user.profile?.yearSem || "",
                section: user.profile?.section || "",
                rollNo: user.profile?.rollNo || "",
                enrollNo: user.profile?.enrollNo || "",
                highSchoolPercentage: user.profile?.highSchoolPercentage || "",
                intermediatePercentage: user.profile?.intermediatePercentage || "",
                graduationPercentage: user.profile?.graduationPercentage || "",

                address: user.profile?.address || "",
                guardianName: user.profile?.guardianName || "",
                guardianPhone: user.profile?.guardianPhone || "",
                guardianEmail: user.profile?.guardianEmail || "",
            });
        } else {
            // Reset form
            setFormData({
                profileImage: "",
                email: "", password: "", firstName: "", lastName: "", role: "STUDENT", roomId: "",
                fatherName: "", motherName: "", gender: "", dob: "", bloodGroup: "", category: "", phone: "",
                studentType: "Regular", college: "", course: "", branch: "", yearSem: "", section: "", rollNo: "", enrollNo: "",
                highSchoolPercentage: "", intermediatePercentage: "", graduationPercentage: "",
                address: "", guardianName: "", guardianPhone: "", guardianEmail: ""
            });
        }
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    if (!isOpen) return null;

    const tabs = [
        { id: "account", label: "Account", icon: FaUserShield },
        { id: "personal", label: "Personal", icon: FaUser },
        { id: "academic", label: "Academic", icon: FaGraduationCap, hidden: formData.role !== 'STUDENT' },
        { id: "address", label: "Address", icon: FaHome },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {user ? "Edit User" : "Add New User"}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 w-full">
                    {tabs.filter(t => !t.hidden).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-center md:gap-2 px-2 md:px-6 py-3 md:py-4 font-medium text-sm transition-all whitespace-nowrap outline-none flex-1 md:flex-none border-b-2
                                ${activeTab === tab.id
                                    ? "text-violet-600 border-violet-600 bg-violet-50/50"
                                    : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50"
                                }`}
                            title={tab.label}
                        >
                            <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                <tab.icon size={20} className="transition-transform active:scale-95" />
                            </div>
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                    <form id="userForm" onSubmit={handleSubmit} className="space-y-6">
                        {activeTab === "account" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-200 shadow-inner">
                                                {formData.profileImage ? (
                                                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <FaUser size={40} />
                                                    </div>
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 bg-violet-600 text-white p-2 rounded-full cursor-pointer hover:bg-violet-700 shadow-lg transition-transform hover:scale-110">
                                                <FaCamera size={14} />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                        </div>
                                        <span className="text-xs text-slate-400 mt-2 font-medium">Upload Profile Photo</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Login Details</h3>
                                </div>
                                <InputField label="First Name" type="text" name="firstName" required value={formData.firstName} onChange={handleChange} />
                                <InputField label="Last Name" type="text" name="lastName" required value={formData.lastName} onChange={handleChange} />
                                <InputField label="Email Address" type="email" name="email" required value={formData.email} onChange={handleChange} />
                                <InputField
                                    label={user ? "New Password (Optional)" : "Password"}
                                    type="password"
                                    name="password"
                                    required={!user}
                                    value={formData.password}
                                    onChange={handleChange}
                                    minLength={6}
                                />
                                <SelectField label="Role" name="role" value={formData.role} onChange={handleChange}>
                                    <option value="STUDENT">Student</option>
                                    <option value="STAFF">Staff</option>
                                    <option value="ADMIN">Admin</option>
                                </SelectField>

                                {formData.role === "STUDENT" && (
                                    <SelectField label="Assign Room" name="roomId" value={formData.roomId} onChange={handleChange}>
                                        <option value="">No Room Assigned</option>
                                        {rooms.map(room => (
                                            <option key={room.id} value={room.id} disabled={room.occupants.length >= room.capacity && room.id !== user?.roomId}>
                                                Room {room.roomNumber} ({room.occupants.length}/{room.capacity})
                                            </option>
                                        ))}
                                    </SelectField>
                                )}
                            </div>
                        )}

                        {activeTab === "personal" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Personal Information</h3>
                                </div>
                                <InputField label="Father's Name" type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} />
                                <InputField label="Mother's Name" type="text" name="motherName" value={formData.motherName} onChange={handleChange} />
                                <InputField label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} />
                                <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </SelectField>
                                <SelectField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </SelectField>
                                <InputField label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                                <SelectField label="Category" name="category" value={formData.category} onChange={handleChange}>
                                    <option value="">Select Category</option>
                                    <option value="General">General</option>
                                    <option value="OBC">OBC</option>
                                    <option value="SC">SC</option>
                                    <option value="ST">ST</option>
                                    <option value="EWS">EWS</option>
                                </SelectField>
                                <div className="md:col-span-2">
                                    <InputField label="College / Institute Name" type="text" name="college" placeholder="e.g. Acme Institute of Technology" value={formData.college} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {activeTab === "academic" && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-3">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Program Details</h3>
                                </div>
                                <SelectField label="Student Type" name="studentType" value={formData.studentType} onChange={handleChange}>
                                    <option value="Regular">Regular</option>
                                    <option value="Lateral Entry">Lateral Entry</option>
                                </SelectField>
                                <InputField label="Course" type="text" name="course" placeholder="e.g. B.Tech" value={formData.course} onChange={handleChange} />
                                <InputField label="Branch" type="text" name="branch" placeholder="e.g. CSE" value={formData.branch} onChange={handleChange} />
                                <InputField label="Year / Sem" type="text" name="yearSem" placeholder="e.g. 3rd Year / 5th Sem" value={formData.yearSem} onChange={handleChange} />
                                <InputField label="Section" type="text" name="section" value={formData.section} onChange={handleChange} />
                                <InputField label="Roll No" type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} />
                                <InputField label="Enroll No" type="text" name="enrollNo" value={formData.enrollNo} onChange={handleChange} />

                                <div className="md:col-span-3 mt-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Previous Education (%)</h3>
                                </div>
                                <InputField label="High School %" type="number" step="0.01" name="highSchoolPercentage" value={formData.highSchoolPercentage} onChange={handleChange} />
                                <InputField label="Intermediate %" type="number" step="0.01" name="intermediatePercentage" value={formData.intermediatePercentage} onChange={handleChange} />
                                <InputField label="Graduation %" type="number" step="0.01" name="graduationPercentage" value={formData.graduationPercentage} onChange={handleChange} />
                            </div>
                        )}

                        {activeTab === "address" && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Permanent Address</h3>
                                    <TextAreaField label="" name="address" rows={3} value={formData.address} onChange={handleChange} placeholder="Enter full permanent address" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Guardian Info</h3>
                                    </div>
                                    <InputField label="Guardian Name" type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} />
                                    <InputField label="Guardian Phone" type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} />
                                    <div className="md:col-span-2">
                                        <InputField label="Guardian Email" type="email" name="guardianEmail" value={formData.guardianEmail} onChange={handleChange} placeholder="For notifications" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 transition-all">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors font-medium border border-slate-200 bg-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="userForm"
                        className="flex items-center gap-2 px-8 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium shadow-lg shadow-violet-200 transition-all hover:scale-105 active:scale-95"
                    >
                        <FaSave /> {user ? "Save Changes" : "Create User"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// Helper components for consistent styling
function InputField({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <input
                {...props}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300 text-slate-800"
            />
        </div>
    );
}

function SelectField({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <select
                {...props}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-slate-800"
            >
                {children}
            </select>
        </div>
    );
}

function TextAreaField({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <textarea
                {...props}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300 text-slate-800 disabled:resize-none"
            />
        </div>
    );
}

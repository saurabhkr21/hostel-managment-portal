"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaRedo, FaEye, FaEyeSlash, FaHotel, FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

// Curated list of high-quality nature wallpapers
const BACKGROUND_IMAGES = [
    "https://quantumuniversity.edu.in/media/gallery/Infrastructure/Hostel/Quantum_Gallery_2017_041.jpg", // Hostel Building
    "https://quantumuniversity.edu.in/media/gallery/Infrastructure/Building/Quantum_Gallery_2017_02.jpg", // Campus Architecture
    "https://quantumuniversity.edu.in/media/gallery/Infrastructure/Building/Quantum_Gallery_2017_01.jpg", // Main Building
    "https://quantumuniversity.edu.in/media/gallery/Infrastructure/Building/Quantum_Gallery_2017_09.jpg", // University Infrastructure
    "https://quantumuniversity.edu.in/media/gallery/Infrastructure/Sports/Quantum_Gallery_2017_075.jpg"  // Sports Complex
];

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [captcha, setCaptcha] = useState("");
    const [generatedCaptcha, setGeneratedCaptcha] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [bgImage, setBgImage] = useState(BACKGROUND_IMAGES[0]);

    useEffect(() => {
        generateCaptcha();
        // Select daily image
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        const imageIndex = dayOfYear % BACKGROUND_IMAGES.length;
        setBgImage(BACKGROUND_IMAGES[imageIndex]);
    }, []);

    const generateCaptcha = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setGeneratedCaptcha(result);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (captcha.toUpperCase() !== generatedCaptcha) {
            setError("Invalid Verification Code");
            setLoading(false);
            generateCaptcha();
            setCaptcha("");
            return;
        }

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("Invalid email or password");
                generateCaptcha();
                setCaptcha("");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-dvh w-full overflow-hidden relative flex items-center justify-center p-4">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 h-dvh w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            </div>

            <div className="w-full max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center px-4 md:px-12 h-full">

                {/* Left Side: Welcome Text & Socials */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-white space-y-8 hidden md:flex flex-col justify-center h-full max-h-[80vh]"
                >
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 text-white/90">
                            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                                <FaHotel className="text-3xl" />
                            </div>
                            <span className="text-xl font-bold tracking-wider uppercase">Hostel Portal</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                            Welcome <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-200">
                                Back
                            </span>
                        </h1>

                        <p className="text-lg text-white/80 max-w-md leading-relaxed">
                            Sign in to access your dashboard, manage hostel activities, and stay connected with your campus community.
                        </p>
                    </div>

                    <div className="space-y-6 pt-4">
                        <div className="flex gap-4">
                            {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
                                <a key={i} href="#" className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition-all duration-300 backdrop-blur-md border border-white/10 hover:scale-110 group">
                                    <Icon className="text-xl text-white/90 group-hover:text-white" />
                                </a>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/50 font-medium">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <span className="w-1 h-1 rounded-full bg-white/30"></span>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Login Form */}
                <div className="flex justify-center md:justify-end w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full max-w-md bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden group"
                    >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        {/* Mobile Logo/Header */}
                        <div className="md:hidden text-center mb-8 space-y-3">
                            <div className="inline-flex items-center gap-2 text-white/90 justify-center">
                                <FaHotel className="text-2xl" />
                                <span className="text-lg font-bold tracking-wider uppercase">Hostel Portal</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                        </div>

                        <div className="mb-8 hidden md:block">
                            <h2 className="text-3xl font-bold text-white">Sign In</h2>
                            <p className="text-white/60 text-sm mt-2">Enter your credentials to access your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                            {error && (
                                <div className="bg-red-500/20 border-l-4 border-red-500 p-4 rounded-r-lg text-white text-sm backdrop-blur-md animate-shake">
                                    <p className="font-bold">Error: {error}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-white/90 text-xs font-bold ml-1 uppercase tracking-wider">Email Address</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaUser className="text-slate-500 group-focus-within/input:text-orange-600 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/90 focus:bg-white text-slate-900 placeholder-slate-500 border-none outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-lg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-white/90 text-xs font-bold ml-1 uppercase tracking-wider">Password</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaLock className="text-slate-500 group-focus-within/input:text-orange-600 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/90 focus:bg-white text-slate-900 placeholder-slate-500 border-none outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 h-full px-4 text-slate-500 hover:text-slate-700 transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Captcha */}
                            <div className="grid grid-cols-5 gap-3">
                                <div className="col-span-2 bg-linear-to-tr from-white/10 to-white/5 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 relative overflow-hidden group/captcha cursor-pointer" onClick={generateCaptcha} title="Click to refresh">
                                    <span className="font-mono font-bold text-white tracking-[0.2em] text-lg select-none z-10">{generatedCaptcha}</span>
                                    {/* Abstract background for captcha */}
                                    <div className="absolute inset-0 bg-white/5 opacity-50 group-hover/captcha:opacity-75 transition-opacity" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                                    <div className="absolute top-1 right-1">
                                        <FaRedo size={10} className="text-white/40" />
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={captcha}
                                    onChange={(e) => setCaptcha(e.target.value)}
                                    placeholder="Enter Code"
                                    required
                                    className="col-span-3 h-12 w-full px-4 rounded-xl bg-black/20 focus:bg-black/40 text-white placeholder-white/30 border border-white/10 focus:border-orange-500/50 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all shadow-inner text-center font-mono tracking-widest uppercase"
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm pt-2">
                                <label className="flex items-center gap-2 text-white/80 cursor-pointer hover:text-white transition-colors select-none">
                                    <div className="relative flex items-center">
                                        <input type="checkbox" className="peer sr-only" />
                                        <div className="w-5 h-5 border-2 border-white/30 rounded peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all"></div>
                                        <svg className="w-3 h-3 text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    Remember Me
                                </label>
                                <a href="#" className="text-orange-400 hover:text-orange-300 font-medium hover:underline transition-all">
                                    Lost Password?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-linear-to-tr from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-900/20 hover:shadow-orange-600/40 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Signing In...
                                    </span>
                                ) : "Sign In"}
                            </button>

                            {/* Mobile Footer (visible only on mobile) */}
                            <div className="md:hidden text-center pt-6 border-t border-white/10 mt-6 space-y-4">
                                <p className="text-white/70 text-sm">Or continue with</p>
                                <div className="flex gap-4 justify-center">
                                    {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
                                        <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm border border-white/10">
                                            <Icon className="text-white" />
                                        </a>
                                    ))}
                                </div>
                                <div className="text-xs text-white/50 space-x-2 pt-2">
                                    <a href="#" className="hover:text-white">Terms</a>
                                    <span>•</span>
                                    <a href="#" className="hover:text-white">Privacy</a>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

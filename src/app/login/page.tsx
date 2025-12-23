"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaRedo, FaEye, FaEyeSlash, FaHotel, FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

// Curated list of high-quality nature wallpapers
const BACKGROUND_IMAGES = [
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop", // Nature/Valley
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1948&auto=format&fit=crop", // Foggy Mountains
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=1920&auto=format&fit=crop", // Waterfall
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop", // Yosemite
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop"  // Forest
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
        <div className="min-h-screen relative flex items-center justify-center p-4">
            {/* Background Image with Overlay */}
            <div className="fixed inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 transform scale-105"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            </div>

            <div className="w-full max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

                {/* Left Side: Welcome Text */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-white space-y-6 text-center md:text-left hidden md:block" // Hidden on mobile to avoid duplication/clutter if we move content
                >
                    <div className="inline-flex items-center gap-3 text-white/90 mb-2 justify-center md:justify-start">
                        <FaHotel className="text-3xl" />
                        <span className="text-xl font-bold tracking-wider uppercase">Hostel Portal</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                        Welcome <br className="hidden md:block" /> Back
                    </h1>
                    {/* Description and Icons moved to Right Side */}
                </motion.div>

                {/* Right Side: Login Form */}
                <div className="flex justify-center md:justify-end w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full max-w-md bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-2xl"
                    >
                        {/* Mobile Logo/Header to ensure branding is visible on mobile since left column is hidden on mobile now or just minimal */}
                        <div className="md:hidden text-center mb-6 space-y-2">
                            <div className="inline-flex items-center gap-2 text-white/90">
                                <FaHotel className="text-2xl" />
                                <span className="text-lg font-bold tracking-wider uppercase">Hostel Portal</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                        </div>

                        <div className="text-center md:text-left mb-6 hidden md:block">
                            <h2 className="text-2xl md:text-3xl font-bold text-white">Sign In</h2>
                            <p className="text-white/60 text-sm mt-1">Enter your details to continue</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-500/20 border-l-4 border-red-500 p-3 rounded text-white text-sm backdrop-blur-md">
                                    <p className="font-bold">Error: {error}</p>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-white/90 text-sm font-medium ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-white/90 focus:bg-white text-slate-900 placeholder-slate-500 border-none outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-lg"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-white/90 text-sm font-medium ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-white/90 focus:bg-white text-slate-900 placeholder-slate-500 border-none outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 p-1"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Captcha */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-between px-3 border border-white/10 h-12">
                                    <span className="font-mono font-bold text-white tracking-widest text-lg">{generatedCaptcha}</span>
                                    <button type="button" onClick={generateCaptcha} className="text-white/70 hover:text-white p-1">
                                        <FaRedo size={14} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={captcha}
                                    onChange={(e) => setCaptcha(e.target.value)}
                                    placeholder="CODE"
                                    required
                                    className="h-12 w-full px-4 rounded-lg bg-white/90 focus:bg-white text-slate-900 placeholder-slate-500 border-none outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-lg text-center"
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 text-white/90 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                    Remember Me
                                </label>
                                <a href="#" className="text-white/90 hover:text-white hover:underline">
                                    Lost Password?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-lg hover:shadow-orange-500/30 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? "Signing in..." : "Sign in now"}
                            </button>

                            {/* Footer Content: Description & Socials */}
                            <div className="text-center pt-6 border-t border-white/10 mt-6">
                                <p className="text-white/80 text-sm leading-relaxed mb-4">
                                    Sign in to access your dashboard, manage hostel activities, and stay connected.
                                </p>
                                <div className="flex gap-4 justify-center">
                                    {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
                                        <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm border border-white/10">
                                            <Icon className="text-white" />
                                        </a>
                                    ))}
                                </div>

                                <div className="text-xs text-white/50 mt-6 space-x-2">
                                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                                    <span>•</span>
                                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

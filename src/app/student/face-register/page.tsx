"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import * as faceapi from "face-api.js";
import { FaCamera, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

export default function FaceRegisterPage() {
    const { data: session } = useSession();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [message, setMessage] = useState("Loading AI models...");
    const [faceDetected, setFaceDetected] = useState(false);
    const [descriptor, setDescriptor] = useState<Float32Array | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
            await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
            await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
            setMessage("Models loaded. Ready to start camera.");
            setIsLoading(false);
        } catch (error) {
            console.error("Error loading models:", error);
            setMessage("Failed to load AI models. Please refresh.");
        }
    };

    const startVideo = async () => {
        setIsScanning(true);
        setMessage("Accessing camera...");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error opening video:", err);
            setMessage("Camera access denied.");
            setIsScanning(false);
        }
    };

    const handleVideoPlay = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setMessage("Looking for face...");

        const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);

        const interval = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current || saved) {
                clearInterval(interval);
                return;
            }

            const detections = await faceapi.detectSingleFace(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptor();

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);

            if (detections) {
                setFaceDetected(true);
                setDescriptor(detections.descriptor);
                setMessage("Face detected! Hold still...");

                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                faceapi.draw.drawDetections(canvas, resizedDetections);
            } else {
                setFaceDetected(false);
                setDescriptor(null);
                setMessage("Please ensure your face is clearly visible.");
            }
        }, 500);
    };

    const saveFace = async () => {
        if (!descriptor || !session?.user?.id) return;

        setIsLoading(true);
        setMessage("Saving face data...");

        try {
            // Convert Float32Array to regular array for JSON storage
            const descriptorArray = Array.from(descriptor);

            const res = await fetch(`/api/user/${session.user.id}/face`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ faceDescriptor: descriptorArray }),
            });

            if (res.ok) {
                setSaved(true);
                setMessage("Face registered successfully!");
                stopVideo();
            } else {
                setMessage("Failed to save. Try again.");
            }
        } catch (error) {
            console.error("Error saving:", error);
            setMessage("Error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Face Registration</h1>
            <p className="text-slate-500 mb-8 text-center max-w-md">
                Register your face to enable AI-based attendance.
                Ensure good lighting and face the camera directly.
            </p>

            <div className="bg-white p-4 rounded-3xl shadow-xl w-full max-w-2xl relative overflow-hidden">
                <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
                    {!isScanning && !saved && (
                        <div className="text-center p-6">
                            <FaCamera className="text-6xl text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-400 mb-6">{message}</p>
                            <button
                                onClick={startVideo}
                                disabled={isLoading}
                                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                            >
                                {isLoading ? <FaSpinner className="animate-spin" /> : <FaCamera />}
                                Start Camera
                            </button>
                        </div>
                    )}

                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        onPlay={handleVideoPlay}
                        className={`w-full h-full object-cover ${(!isScanning || saved) ? 'hidden' : ''}`}
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    />

                    {saved && (
                        <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center">
                            <div className="bg-white p-8 rounded-full shadow-2xl animate-bounce">
                                <FaCheck className="text-6xl text-emerald-500" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex flex-col items-center gap-4">
                    <div className={`text-lg font-medium transition-colors ${saved ? "text-emerald-600" :
                            faceDetected ? "text-emerald-600" : "text-slate-500"
                        }`}>
                        {message}
                    </div>

                    {isScanning && !saved && (
                        <button
                            onClick={saveFace}
                            disabled={!faceDetected || isLoading}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg
                                ${faceDetected
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 scale-100"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed scale-95"
                                }`}
                        >
                            {isLoading ? "Saving..." : "Capture & Save Face"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

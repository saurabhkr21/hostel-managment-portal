"use client";

import { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { FaCamera, FaSpinner, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function AttendanceKioskPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("Loading AI models...");
    const [lastDetection, setLastDetection] = useState<number>(0);
    const [scanResult, setScanResult] = useState<{ name: string; status: 'success' | 'error' | null }>({ name: '', status: null });

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
            await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
            await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
            setMessage("Starting camera...");
            startVideo();
        } catch (error) {
            console.error("Error loading models:", error);
            setMessage("Failed to load AI models.");
        }
    };

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsLoading(false);
            setMessage("Ready to scan.");
        } catch (err) {
            console.error("Error opening video:", err);
            setMessage("Camera access denied.");
        }
    };

    const handleVideoPlay = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);

        // Load all labeled descriptors from server (mock for now, ideally fetch on init)
        // For production: fetch all user descriptors and create a FaceMatcher
        // const labeledDescriptors = await loadLabeledImages();
        // const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

        const interval = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current) return;

            // Throttle scanning to once per 2 seconds to avoid spamming
            if (Date.now() - lastDetection < 2000) return;

            const detections = await faceapi.detectAllFaces(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptors();

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            faceapi.draw.drawDetections(canvas, resizedDetections);

            if (detections.length > 0) {
                // In a real app, match descriptor here
                // const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor);

                // Mocking a successful scan for demonstration
                setLastDetection(Date.now());
                handleAttendance(detections[0].descriptor);
            }
        }, 500);

        return () => clearInterval(interval);
    };

    const handleAttendance = async (descriptor: Float32Array) => {
        setMessage("Face detected! Verifying...");

        // Simulating API call to find user by face
        // In reality, you'd send the descriptor or use client-side matcher if list is small
        // For this MVP, we will assume if we see a face, we mark "Demo Student" present

        setTimeout(() => {
            setScanResult({ name: "Demo Student", status: 'success' });
            setMessage("Marked Present!");

            // Allow next scan after 3 seconds
            setTimeout(() => {
                setScanResult({ name: "", status: null });
                setMessage("Ready to scan.");
            }, 3000);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
            <h1 className="text-4xl font-bold mb-8 flex items-center gap-4">
                <FaCamera className="text-violet-500" />
                Attendance Kiosk
            </h1>

            <div className="relative w-full max-w-3xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        <FaSpinner className="text-6xl animate-spin text-violet-500 mb-4" />
                        <p className="text-xl font-medium">{message}</p>
                    </div>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    onPlay={handleVideoPlay}
                    className="w-full h-full object-cover"
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />

                {scanResult.status && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in zoom-in duration-300">
                        {scanResult.status === 'success' ? (
                            <>
                                <FaCheckCircle className="text-8xl text-emerald-500 mb-4" />
                                <h2 className="text-4xl font-bold text-white mb-2">{scanResult.name}</h2>
                                <p className="text-emerald-400 text-xl font-medium uppercase tracking-wide">Marked Present</p>
                            </>
                        ) : (
                            <FaTimesCircle className="text-8xl text-rose-500" />
                        )}
                    </div>
                )}
            </div>

            <div className="mt-8 text-center max-w-lg">
                <p className="text-slate-400 text-lg mb-2">{message}</p>
                <div className="flex gap-2 justify-center">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-sm text-slate-500">System Active</span>
                </div>
            </div>
        </div>
    );
}

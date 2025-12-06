import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    // Allow Admin or Staff to mark attendance (or even students via verified kiosk)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Check if already marked for today
        // We use a date range for "today" to avoid time issues, though the unique constraint handles it if we strip time.
        // For simplicity, we'll strip time from the date before saving/checking.

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                studentId: userId,
                date: today,
            },
        });

        if (existingAttendance) {
            return NextResponse.json({
                success: true,
                message: "Already marked present"
            });
        }

        const attendance = await prisma.attendance.create({
            data: {
                studentId: userId,
                date: today,
                status: "PRESENT",
                markedBy: session.user.email || "SYSTEM",
            },
        });

        return NextResponse.json({ success: true, attendance });
    } catch (error) {
        console.error("Error marking attendance:", error);
        return NextResponse.json(
            { error: "Failed to mark attendance" },
            { status: 500 }
        );
    }
}

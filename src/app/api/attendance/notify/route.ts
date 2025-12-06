import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Get all students
        const students = await prisma.user.findMany({
            where: { role: "STUDENT" },
            include: { profile: true }
        });

        // 2. Get today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: today,
                }
            }
        });

        const presentStudentIds = new Set(attendance.map(a => a.studentId));
        const absentees = students.filter(s => !presentStudentIds.has(s.id));

        const notificationsSent = [];

        // 3. Create notifications for absentees
        for (const student of absentees) {
            // Create in-app notification
            await prisma.notification.create({
                data: {
                    userId: student.id,
                    message: `You were marked absent on ${today.toLocaleDateString()}.`,
                }
            });

            // Simulate Email to Guardian
            if (student.profile?.guardianEmail) {
                // In production: await sendEmail(student.profile.guardianEmail, ...)
                console.log(`[Mock Email] Sending absence alert to ${student.profile.guardianEmail} for student ${student.name}`);
                notificationsSent.push({
                    student: student.name,
                    guardian: student.profile.guardianEmail,
                    status: "Sent"
                });
            } else {
                console.log(`[Mock Email] No guardian email for ${student.name}`);
            }
        }

        return NextResponse.json({
            success: true,
            absenteesCount: absentees.length,
            notifications: notificationsSent
        });

    } catch (error) {
        console.error("Error processing notifications:", error);
        return NextResponse.json(
            { error: "Failed to process notifications" },
            { status: 500 }
        );
    }
}

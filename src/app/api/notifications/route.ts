import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 50
        });

        return NextResponse.json(notifications);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    // Allow Admin and Staff to send notifications
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { targetType, recipientId, type, title, message } = body;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        if (targetType === "individual") {
            if (!recipientId) return NextResponse.json({ error: "Recipient ID/Email is required" }, { status: 400 });

            // Find user by Email or ID
            // Construct proper query based on input type
            const whereConditions: any[] = [{ email: recipientId }];

            // Only check ID if the input is a valid MongoDB ObjectId (24 hex chars)
            if (/^[0-9a-fA-F]{24}$/.test(recipientId)) {
                whereConditions.push({ id: recipientId });
            }

            const user = await prisma.user.findFirst({
                where: {
                    OR: whereConditions
                }
            });

            if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

            await prisma.notification.create({
                data: {
                    userId: user.id,
                    type: type || "INFO",
                    title,
                    message,
                    attachmentUrl: body.attachmentUrl,
                    read: false
                }
            });

        } else if (targetType === "all") {
            // Bulk send to all students
            const students = await prisma.user.findMany({
                where: { role: "STUDENT" },
                select: { id: true }
            });

            if (students.length === 0) return NextResponse.json({ error: "No students found" }, { status: 404 });

            // Create many notifications
            await prisma.notification.createMany({
                data: students.map(student => ({
                    userId: student.id,
                    type: type || "INFO",
                    title,
                    message,
                    attachmentUrl: body.attachmentUrl,
                    read: false
                }))
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Notification Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to send notification" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { notificationId } = body;

        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
    }
}

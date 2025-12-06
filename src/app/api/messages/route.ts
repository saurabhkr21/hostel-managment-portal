import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("targetId");

    try {
        if (session.user.role === "STUDENT") {
            // Students fetch messages with specific staff/admin or their main thread
            // If targetId is provided, fetch specific thread. Else, fetch all their messages (simplified for single thread view)

            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: session.user.id },
                        { receiverId: session.user.id }
                    ]
                },
                orderBy: { createdAt: "asc" },
                include: {
                    sender: { select: { name: true, role: true } },
                    receiver: { select: { name: true, role: true } }
                }
            });
            return NextResponse.json(messages);
        } else {
            // Staff/Admin fetching messages
            if (targetId) {
                // Fetch specific conversation
                const messages = await prisma.message.findMany({
                    where: {
                        OR: [
                            { senderId: session.user.id, receiverId: targetId },
                            { senderId: targetId, receiverId: session.user.id }
                        ]
                    },
                    orderBy: { createdAt: "asc" },
                    include: {
                        sender: { select: { name: true, role: true } },
                        receiver: { select: { name: true, role: true } }
                    }
                });
                return NextResponse.json(messages);
            } else {
                // List of conversations (Recent students who messaged)
                // This is a complex query, simplified: find unique students from received messages
                const distinctSenders = await prisma.message.findMany({
                    where: { receiverId: session.user.id },
                    distinct: ['senderId'],
                    orderBy: { createdAt: 'desc' },
                    include: { sender: true }
                });
                return NextResponse.json(distinctSenders.map(m => m.sender));
            }
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { content, receiverId } = body;

        let finalReceiverId = receiverId;

        // If Student sends execution without receiverId, find a default Staff/Admin
        if (session.user.role === "STUDENT" && !finalReceiverId) {
            const staff = await prisma.user.findFirst({
                where: { role: { in: ["ADMIN", "STAFF"] } }
            });
            if (staff) finalReceiverId = staff.id;
            else return NextResponse.json({ error: "No staff available to receive message" }, { status: 404 });
        }

        const message = await prisma.message.create({
            data: {
                content,
                senderId: session.user.id,
                receiverId: finalReceiverId
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}

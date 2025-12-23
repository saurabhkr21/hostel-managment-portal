import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { conversationId } = await req.json();

        if (!conversationId) {
            return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 });
        }

        // Verify user is a participant
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { participantIds: true }
        });

        if (!conversation || !conversation.participantIds.includes(session.user.id)) {
            return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 404 });
        }

        // Update status
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { status: "ACCEPTED" }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Accept Conversation Error:", error);
        return NextResponse.json({ error: "Failed to accept conversation" }, { status: 500 });
    }
}

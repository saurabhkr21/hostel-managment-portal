import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.STAFF)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { roomId, studentId } = body;

        if (!roomId || !studentId) {
            return NextResponse.json({ error: "Missing roomId or studentId" }, { status: 400 });
        }

        // Check Room Capacity
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { occupants: true }
        });

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (room.occupants.length >= room.capacity) {
            return NextResponse.json({ error: "Room is full" }, { status: 400 });
        }

        // Assign Student
        const updatedUser = await prisma.user.update({
            where: { id: studentId },
            data: { roomId: roomId }
        });

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error) {
        console.error("Error assigning room:", error);
        return NextResponse.json(
            { error: "Failed to assign room" },
            { status: 500 }
        );
    }
}

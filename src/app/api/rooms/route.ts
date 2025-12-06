import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const rooms = await prisma.room.findMany({
            include: {
                occupants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                roomNumber: "asc",
            },
        });
        return NextResponse.json(rooms);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch rooms" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.STAFF)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { roomNumber, capacity, type } = body;

        if (!roomNumber || !capacity || !type) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const existingRoom = await prisma.room.findUnique({
            where: { roomNumber },
        });

        if (existingRoom) {
            return NextResponse.json(
                { error: "Room already exists" },
                { status: 400 }
            );
        }

        const room = await prisma.room.create({
            data: {
                roomNumber,
                capacity: parseInt(capacity),
                type,
            },
        });

        return NextResponse.json(room, { status: 201 });
    } catch (error) {
        console.error("Error creating room:", error);
        return NextResponse.json(
            { error: "Failed to create room" },
            { status: 500 }
        );
    }
}

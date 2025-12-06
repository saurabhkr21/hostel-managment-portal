import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [studentCount, staffCount, roomCount, totalCapacity, occupiedBeds] = await prisma.$transaction([
            prisma.user.count({ where: { role: Role.STUDENT } }),
            prisma.user.count({ where: { role: Role.STAFF } }),
            prisma.room.count(),
            prisma.room.aggregate({
                _sum: {
                    capacity: true,
                },
            }),
            prisma.user.count({
                where: {
                    role: Role.STUDENT,
                    roomId: { not: null },
                },
            }),
        ]);

        return NextResponse.json({
            students: studentCount,
            staff: staffCount,
            rooms: roomCount,
            capacity: totalCapacity._sum.capacity || 0,
            occupied: occupiedBeds,
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}

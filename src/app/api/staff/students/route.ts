import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.STAFF) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const students = await prisma.user.findMany({
            where: { role: Role.STUDENT },
            select: {
                id: true,
                name: true,
                email: true,
                room: {
                    select: {
                        roomNumber: true,
                    },
                },
                profile: {
                    select: {
                        phone: true,
                        profileImage: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
        return NextResponse.json(students);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch students" },
            { status: 500 }
        );
    }
}

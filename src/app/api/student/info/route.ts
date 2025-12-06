import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.STUDENT) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const student = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                room: {
                    include: {
                        occupants: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                profile: true,
            },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error("Error fetching student info:", error);
        return NextResponse.json(
            { error: "Failed to fetch info" },
            { status: 500 }
        );
    }
}

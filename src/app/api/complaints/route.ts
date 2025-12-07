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
        const whereClause =
            session.user.role === Role.STUDENT
                ? { studentId: session.user.id }
                : {}; // Admin/Staff see all

        const complaints = await prisma.complaint.findMany({
            where: whereClause,
            include: {
                student: {
                    select: {
                        name: true,
                        profile: {
                            select: {
                                id: true, // Select ID instead of image
                            },
                        },
                        room: {
                            select: {
                                roomNumber: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(complaints);

    } catch (error) {
        console.error("Fetch complaints error:", error);
        return NextResponse.json(
            { error: "Failed to fetch complaints" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.STUDENT) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, description } = body;

        if (!title || !description) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const complaint = await prisma.complaint.create({
            data: {
                title,
                description,
                studentId: session.user.id,
            },
        });

        return NextResponse.json(complaint, { status: 201 });
    } catch (error) {
        console.error("Error creating complaint:", error);
        return NextResponse.json(
            { error: "Failed to create complaint" },
            { status: 500 }
        );
    }
}

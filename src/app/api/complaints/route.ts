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

        // 1. Fetch complaints WITHOUT status using Prisma (to get relations and avoid enum error)
        const complaintsPartial = await prisma.complaint.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                studentId: true,
                student: {
                    select: {
                        name: true,
                        profile: {
                            select: {
                                profileImage: true,
                            },
                        },
                        room: {
                            select: {
                                roomNumber: true,
                            },
                        },
                    },
                },
                // Intentionally OMIT 'status' to avoid validation error
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // 2. Fetch raw statuses using MongoDB Command to bypass Enum validation
        let rawFilter = {};
        if (session.user.role === Role.STUDENT) {
            rawFilter = { studentId: { "$oid": session.user.id } };
        }

        const rawResult: any = await prisma.$runCommandRaw({
            find: "Complaint",
            filter: rawFilter,
            projection: { _id: 1, status: 1 }
        });

        const rawDocs = rawResult.cursor?.firstBatch || [];

        // 3. Merge Status
        const statusMap = new Map();
        rawDocs.forEach((doc: any) => {
            let idStr = doc._id;
            if (typeof doc._id === 'object' && doc._id.$oid) {
                idStr = doc._id.$oid;
            }
            statusMap.set(idStr.toString(), doc.status);
        });

        const mergedComplaints = complaintsPartial.map((comp) => ({
            ...comp,
            status: statusMap.get(comp.id) || "PENDING"
        }));

        return NextResponse.json(mergedComplaints);

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

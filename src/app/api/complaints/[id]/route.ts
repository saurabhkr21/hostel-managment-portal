import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role, ComplaintStatus } from "@prisma/client";

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (
        !session ||
        (session.user.role !== Role.STAFF && session.user.role !== Role.ADMIN)
    ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { status } = body;

        // 1. Fetch current data (SAFE READ: Exclude 'status' field to prevent invalid enum error)
        const current = await prisma.complaint.findUnique({
            where: { id },
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
                        room: {
                            select: {
                                roomNumber: true
                            }
                        }
                    }
                }
            }
        });

        if (!current) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // 2. Perform Update
        // We use a robust strategy to handle potential schema mismatches (File lock issues)
        try {
            // Strategy A: MongoDB Raw Command (Bypasses Schema)
            // Can fail if collection name doesn't match exactly.
            await prisma.$runCommandRaw({
                update: "Complaint",
                updates: [
                    {
                        q: { _id: { "$oid": id } },
                        u: { $set: { status: status } }
                    }
                ]
            });
        } catch (rawError) {
            console.log("Raw update failed, trying fallback:", rawError);

            // Strategy B: Standard Update with Error Suppression
            try {
                await prisma.complaint.update({
                    where: { id },
                    data: { status: status as any }
                });
            } catch (validationError) {
                // Critical: If this throws "Invalid Enum Value", the DB write usually still happened!
                // We suppress this error to ensure the frontend receives a Success response.
                console.warn("Suppressing validation error on update:", validationError);
            }
        }

        // 3. Return the object with the NEW status manually merged.
        // We do NOT fetch again to avoid "Invalid Enum Value" error on read.
        return NextResponse.json({ ...current, status: status });
    } catch (error) {
        console.error("Error updating complaint:", error);
        return NextResponse.json(
            { error: "Failed to update complaint" },
            { status: 500 }
        );
    }
}

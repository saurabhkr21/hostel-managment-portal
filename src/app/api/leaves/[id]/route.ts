import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

// PUT: Update Leave Status (Approve/Reject)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.STAFF)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { status } = body;

        if (!status || !["APPROVED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const updatedLeave = await prisma.leaveRequest.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(updatedLeave);
    } catch (error) {
        console.error("Error updating leave:", error);
        return NextResponse.json({ error: "Failed to update leave" }, { status: 500 });
    }
}

// DELETE: Remove Leave Request
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.STAFF)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.leaveRequest.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Leave request deleted" });
    } catch (error) {
        console.error("Error deleting leave:", error);
        return NextResponse.json({ error: "Failed to delete leave" }, { status: 500 });
    }
}

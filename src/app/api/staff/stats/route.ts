import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role, ComplaintStatus } from "@prisma/client";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.STAFF) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [
            studentCount,
            complaintsPending,
            complaintsResolved,
            leavesPending,
            leavesApproved,
            leavesRejected
        ] = await prisma.$transaction([
            prisma.user.count({ where: { role: Role.STUDENT } }),
            prisma.complaint.count({ where: { status: ComplaintStatus.PENDING } }),
            prisma.complaint.count({ where: { status: ComplaintStatus.RESOLVED } }),
            prisma.leaveRequest.count({ where: { status: "PENDING" } }), // Using string if enum import is tricky, but preferably use Enum
            prisma.leaveRequest.count({ where: { status: "APPROVED" } }),
            prisma.leaveRequest.count({ where: { status: "REJECTED" } })
        ]);

        return NextResponse.json({
            students: studentCount,
            complaints: {
                pending: complaintsPending,
                resolved: complaintsResolved,
                total: complaintsPending + complaintsResolved
            },
            leaves: {
                pending: leavesPending,
                approved: leavesApproved,
                rejected: leavesRejected,
                total: leavesPending + leavesApproved + leavesRejected
            }
        });
    } catch (error) {
        console.error("Error fetching staff stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}

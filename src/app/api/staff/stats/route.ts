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
            leavesRejected,
            recentComplaints,
            recentLeaves,
            allRooms
        ] = await prisma.$transaction([
            prisma.user.count({ where: { role: Role.STUDENT } }),
            prisma.complaint.count({ where: { status: ComplaintStatus.PENDING } }),
            prisma.complaint.count({ where: { status: ComplaintStatus.RESOLVED } }),
            prisma.leaveRequest.count({ where: { status: "PENDING" } }),
            prisma.leaveRequest.count({ where: { status: "APPROVED" } }),
            prisma.leaveRequest.count({ where: { status: "REJECTED" } }),
            // Recent Complaints
            prisma.complaint.findMany({
                where: { status: ComplaintStatus.PENDING },
                take: 3,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    student: { select: { name: true, profile: { select: { profileImage: true } } } }
                }
            }),
            // Recent Leaves
            prisma.leaveRequest.findMany({
                where: { status: "PENDING" },
                take: 3,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    reason: true,
                    fromDate: true,
                    student: { select: { name: true, profile: { select: { profileImage: true } } } }
                }
            }),
            // Room Data for Occupancy Map
            prisma.room.findMany({
                include: {
                    _count: {
                        select: { occupants: true }
                    }
                }
            })
        ]);

        // Process Occupancy Data (Group by Block)
        const blockMap = new Map<string, { occupied: number, capacity: number }>();

        allRooms.forEach((room: any) => {
            // @ts-ignore
            const blockName = (room.block || "Main Block");
            const current = blockMap.get(blockName) || { occupied: 0, capacity: 0 };
            current.occupied += room._count.occupants;
            current.capacity += room.capacity;
            blockMap.set(blockName, current);
        });

        const occupancyData = Array.from(blockMap.entries())
            .map(([name, data]) => ({
                name,
                occupied: data.occupied,
                capacity: data.capacity
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

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
            },
            recentActivity: {
                complaints: recentComplaints,
                leaves: recentLeaves
            },
            occupancy: occupancyData
        });
    } catch (error) {
        console.error("Error fetching staff stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}

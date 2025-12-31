import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== Role.STAFF && session.user.role !== Role.ADMIN)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Find unique dates in Attendance
        // Since Prisma doesn't have a direct "distinct dates" for MongoDB easily with just groupBy date 
        // (because date includes time), we might need to do some processing or use a raw query if needed.
        // However, in our schema, dates are stored as DateTime. 
        // If they are saved with 00:00:00, it's easier.

        // Let's get all attendance records and extract unique dates
        // For performance, we could limit to the last 90 days or something, 
        // but for a hostel portal, the total records shouldn't be massive for a simple query.

        const attendanceDates = await prisma.attendance.findMany({
            select: {
                date: true
            },
            distinct: ['date']
        });

        const markedDates = attendanceDates.map(a => a.date.toISOString().split('T')[0]);
        // Also get total student count to see if it's "fully" marked (optional enrichment)
        const totalStudents = await prisma.user.count({ where: { role: Role.STUDENT } });

        return NextResponse.json({
            markedDates,
            totalStudents
        });

    } catch (error) {
        console.error("Error fetching marked dates:", error);
        return NextResponse.json(
            { error: "Failed to fetch marked dates" },
            { status: 500 }
        );
    }
}

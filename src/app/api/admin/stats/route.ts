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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [studentCount, staffCount, roomCount, totalCapacity, occupiedBeds, attendanceGroups, allRooms] = await prisma.$transaction([
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
            // Attendance Stats
            prisma.attendance.groupBy({
                by: ['status'],
                where: {
                    date: {
                        gte: today,
                    },
                },
                _count: {
                    status: true,
                },
                orderBy: {
                    status: 'asc',
                },
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



        // Process Attendance Data
        const attendanceMap: Record<string, number> = { PRESENT: 0, ABSENT: 0, LEAVE: 0 };
        attendanceGroups.forEach((g: any) => {
            if (g.status in attendanceMap) {
                attendanceMap[g.status] = g._count.status;
            }
        });

        const attendanceData = [
            { name: "Present", value: attendanceMap.PRESENT },
            { name: "Absent", value: attendanceMap.ABSENT },
            { name: "Leave", value: attendanceMap.LEAVE },
        ];

        // Process Occupancy Data (Group by Block/Prefix)
        const blockMap = new Map<string, { occupied: number, capacity: number }>();

        allRooms.forEach(room => {
            const blockName = ((room as any).block || "Main Block");
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

        // Activity Trends (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const weeklyActivity = await prisma.attendance.groupBy({
            by: ['date'],
            where: {
                date: { gte: sevenDaysAgo },
                status: 'PRESENT'
            },
            _count: {
                studentId: true
            },
            orderBy: {
                date: 'asc'
            }
        });

        const activityData = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            d.setHours(0, 0, 0, 0); // Normalize comparison

            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const found = weeklyActivity.find((a: any) => {
                const aDate = new Date(a.date);
                aDate.setHours(0, 0, 0, 0); // Normalize comparison
                return aDate.getTime() === d.getTime();
            });

            return {
                name: dayName,
                value: found ? found._count.studentId : 0
            };
        });

        return NextResponse.json({
            students: studentCount,
            staff: staffCount,
            rooms: roomCount,
            capacity: totalCapacity._sum.capacity || 0,
            occupied: occupiedBeds,
            attendance: attendanceData,
            occupancy: occupancyData,
            activity: activityData
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}

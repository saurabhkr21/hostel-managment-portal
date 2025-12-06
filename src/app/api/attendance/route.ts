import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const studentId = searchParams.get("studentId");

    try {
        const whereClause: any = {};

        if (session.user.role === Role.STUDENT) {
            whereClause.studentId = session.user.id;
        } else if (studentId) {
            whereClause.studentId = studentId;
        }

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            whereClause.date = {
                gte: startDate,
                lte: endDate,
            };
        }

        const attendance = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                student: {
                    select: {
                        name: true,
                        room: {
                            select: {
                                roomNumber: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        });
        return NextResponse.json(attendance);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch attendance" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== Role.STAFF && session.user.role !== Role.ADMIN)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { date, records } = body; // records: { studentId: string, status: string }[]

        if (!date || !records || !Array.isArray(records)) {
            return NextResponse.json(
                { error: "Invalid data" },
                { status: 400 }
            );
        }

        const attendanceDate = new Date(date);

        // Use transaction to upsert multiple records
        const operations = records.map((record: any) => {
            return prisma.attendance.upsert({
                where: {
                    studentId_date: {
                        studentId: record.studentId,
                        date: attendanceDate,
                    },
                },
                update: {
                    status: record.status,
                    markedBy: session.user.name || "Staff",
                },
                create: {
                    studentId: record.studentId,
                    date: attendanceDate,
                    status: record.status,
                    markedBy: session.user.name || "Staff",
                },
            });
        });

        await prisma.$transaction(operations);

        return NextResponse.json({ message: "Attendance marked successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error marking attendance:", error);
        return NextResponse.json(
            { error: "Failed to mark attendance" },
            { status: 500 }
        );
    }
}

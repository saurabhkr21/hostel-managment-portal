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
    const dateParam = searchParams.get("date");
    const statusParam = searchParams.get("status");

    try {
        const where: any = {};

        if (session.user.role === Role.STUDENT) {
            where.studentId = session.user.id;
        }

        if (statusParam) {
            where.status = statusParam;
        }

        if (dateParam) {
            const targetDate = new Date(dateParam);
            where.fromDate = { lte: targetDate };
            where.toDate = { gte: targetDate };
        }

        const leaves = await prisma.leaveRequest.findMany({
            where,
            include: {
                student: {
                    select: {
                        name: true,
                        room: {
                            select: {
                                roomNumber: true,
                            },
                        },
                        profile: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return NextResponse.json(leaves);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch leave requests" },
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
        const { type, fromDate, toDate, reason, contactNo, address } = body;

        if (!type || !fromDate || !toDate || !reason || !contactNo || !address) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                type,
                fromDate: new Date(fromDate),
                toDate: new Date(toDate),
                reason,
                contactNo,
                address,
                studentId: session.user.id,
            },
        });

        return NextResponse.json(leaveRequest, { status: 201 });
    } catch (error) {
        console.error("Error creating leave request:", error);
        return NextResponse.json(
            { error: "Failed to create leave request" },
            { status: 500 }
        );
    }
}


import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    try {
        const where: any = {};

        // Role-based filtering
        if (session.user.role === Role.STUDENT) {
            where.studentId = session.user.id;
        } else if (studentId) {
            where.studentId = studentId;
        }

        const fees = await prisma.fee.findMany({
            where,
            include: {
                student: {
                    select: {
                        name: true,
                        email: true,
                        room: {
                            select: { roomNumber: true }
                        }
                    }
                }
            },
            orderBy: {
                paymentDate: "desc",
            },
        });

        return NextResponse.json(fees);
    } catch (error) {
        console.error("Error fetching fees:", error);
        return NextResponse.json(
            { error: "Failed to fetch fees" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow Admins, Staff, and Students (for self-payment)
    if (session.user.role !== Role.ADMIN && session.user.role !== Role.STAFF && session.user.role !== Role.STUDENT) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        let { studentId, amount, type, status, remarks } = body;

        // Security: If student, enforce paying only for self
        if (session.user.role === Role.STUDENT) {
            if (studentId && studentId !== session.user.id) {
                return NextResponse.json({ error: "Cannot pay for other students" }, { status: 403 });
            }
            studentId = session.user.id; // Force correct ID
            status = "Paid"; // Students can only make "Paid" records via this endpoint (simulation)
        }

        if (!studentId || !amount || !type || !status) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const fee = await prisma.fee.create({
            data: {
                studentId,
                amount: parseFloat(amount),
                type,
                status,
                remarks,
                paymentDate: new Date(),
            },
        });

        return NextResponse.json(fee, { status: 201 });
    } catch (error: any) {
        console.error("Error creating fee:", error);
        return NextResponse.json(
            { error: `Failed to create fee record: ${error.message || error}` },
            { status: 500 }
        );
    }
}

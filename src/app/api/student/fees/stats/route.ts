import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const studentId = session.user.id;

        const paid = await prisma.fee.aggregate({
            where: {
                studentId: studentId,
                status: 'Paid'
            },
            _sum: {
                amount: true
            }
        });

        const pending = await prisma.fee.aggregate({
            where: {
                studentId: studentId,
                status: 'Pending'
            },
            _sum: {
                amount: true
            }
        });

        // Optional: If you want to show "Overdue" separately
        const overdue = await prisma.fee.aggregate({
            where: {
                studentId: studentId,
                status: 'Overdue'
            },
            _sum: {
                amount: true
            }
        });

        return NextResponse.json({
            totalPaid: paid._sum.amount || 0,
            pendingDues: (pending._sum.amount || 0) + (overdue._sum.amount || 0),
            // Mocking next due date logic for now
            nextDueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 10).toISOString()
        });
    } catch (error) {
        console.error("Error fetching fee stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

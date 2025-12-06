
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.STAFF)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const totalCollected = await prisma.fee.aggregate({
            where: { status: "Paid" },
            _sum: { amount: true }
        });

        const pendingAmount = await prisma.fee.aggregate({
            where: { status: "Pending" },
            _sum: { amount: true }
        });

        // Get monthly stats (last 6 months) - simplified for now
        // Or just count of paid vs pending transactions
        const paidCount = await prisma.fee.count({ where: { status: "Paid" } });
        const pendingCount = await prisma.fee.count({ where: { status: "Pending" } });

        return NextResponse.json({
            totalCollected: totalCollected._sum.amount || 0,
            pendingAmount: pendingAmount._sum.amount || 0,
            paidCount,
            pendingCount
        });
    } catch (error) {
        console.error("Error fetching fee stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch fee statistics" },
            { status: 500 }
        );
    }
}

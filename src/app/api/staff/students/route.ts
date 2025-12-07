import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const unassigned = searchParams.get("unassigned") === "true";

    if (!session || (session.user.role !== Role.STAFF && session.user.role !== Role.ADMIN)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const whereClause: any = { role: Role.STUDENT };
        if (unassigned) {
            whereClause.roomId = null;
        }

        console.log("Fetching students with filter:", whereClause);
        const students = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                room: {
                    select: {
                        roomNumber: true,
                    },
                },
                profile: {
                    select: {
                        phone: true,
                        // profileImage: true, // EXCLUDED for performance (Base64 is too large)
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
        console.log("Found students:", students.length);
        return NextResponse.json(students);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch students" },
            { status: 500 }
        );
    }
}

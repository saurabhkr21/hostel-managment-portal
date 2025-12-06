import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== Role.STAFF && session.user.role !== Role.ADMIN)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const student = await prisma.user.findUnique({
            where: {
                id: id,
                role: Role.STUDENT,
            },
            select: {
                id: true,
                name: true,
                email: true,
                // image: true, // Image field does not exist on User in schema, removing to avoid error if it's not there. Waaaait, schema says User has: id, name, email, password, role... NO IMAGE.
                // Profile might have image? No.
                // So image should be removed or mocked. I'll remove it from select.

                room: {
                    select: {
                        id: true,
                        roomNumber: true,
                        type: true,
                    },
                },
                profile: true,
            },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        console.log("API Fetched Student (SERVER):", JSON.stringify(student, null, 2));

        return NextResponse.json(student);
    } catch (error) {
        console.error("Error fetching student details:", error);
        return NextResponse.json(
            { error: "Failed to fetch student details" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.STAFF) {
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
                        roomNumber: true,
                        type: true,
                    },
                },
                profile: {
                    select: {
                        dob: true,
                        gender: true,
                        phone: true,
                        address: true,
                        guardianName: true,
                        guardianPhone: true,
                        branch: true,
                        yearSem: true,
                        bloodGroup: true,
                    },
                },
            },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error("Error fetching student details:", error);
        return NextResponse.json(
            { error: "Failed to fetch student details" },
            { status: 500 }
        );
    }
}

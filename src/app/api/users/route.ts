import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.STAFF)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role");

    try {
        const where: any = {};
        if (roleParam && Object.values(Role).includes(roleParam as Role)) {
            where.role = roleParam as Role;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                roomId: true,
                profile: true,
                room: {
                    select: {
                        roomNumber: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { firstName, lastName, email, password, role, phone, address, roomId } = body;

        if (!firstName || !lastName || !email || !password || !role) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const name = `${firstName} ${lastName}`;

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as Role,
                roomId: roomId || null,
                profile: {
                    create: {
                        // Personal
                        // @ts-ignore
                        profileImage: body.profileImage || null,
                        phone: phone || null,
                        address: address || null,
                        fatherName: body.fatherName || null,
                        motherName: body.motherName || null,
                        guardianName: body.guardianName || null,
                        guardianPhone: body.guardianPhone || null,
                        // @ts-ignore
                        guardianEmail: body.guardianEmail || null,
                        gender: body.gender || null,
                        dob: body.dob ? new Date(body.dob) : null,
                        bloodGroup: body.bloodGroup || null,
                        category: body.category || null,

                        // Academic
                        college: body.college || null,
                        course: body.course || null,
                        branch: body.branch || null,
                        yearSem: body.yearSem || null,
                        section: body.section || null,
                        rollNo: body.rollNo || null,
                        enrollNo: body.enrollNo || null,
                        studentType: body.studentType || "Regular",

                        // Percentages (Ensure numbers)
                        highSchoolPercentage: body.highSchoolPercentage ? parseFloat(body.highSchoolPercentage) : null,
                        intermediatePercentage: body.intermediatePercentage ? parseFloat(body.intermediatePercentage) : null,
                        graduationPercentage: body.graduationPercentage ? parseFloat(body.graduationPercentage) : null,
                    },
                },
            },
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}

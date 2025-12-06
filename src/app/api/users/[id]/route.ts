import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.STAFF)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { firstName, lastName, email, password, role, phone, address, roomId } = body;

        const updateData: any = {
            email,
            role: role as Role,
        };

        // Construct name if firstName and lastName are provided
        if (firstName && lastName) {
            updateData.name = `${firstName} ${lastName}`;
        } else if (body.name) {
            updateData.name = body.name;
        }

        // Prepare profile data
        const profileCreateData = {
            profileImage: body.profileImage || null,
            phone: phone || null,
            address: address || null,
            fatherName: body.fatherName || null,
            motherName: body.motherName || null,
            guardianName: body.guardianName || null,
            guardianPhone: body.guardianPhone || null,
            guardianEmail: body.guardianEmail || null,
            gender: body.gender || null,
            dob: body.dob ? new Date(body.dob) : null,
            bloodGroup: body.bloodGroup || null,
            category: body.category || null,
            college: body.college || null,
            course: body.course || null,
            branch: body.branch || null,
            yearSem: body.yearSem || null,
            section: body.section || null,
            rollNo: body.rollNo || null,
            enrollNo: body.enrollNo || null,
            studentType: body.studentType || "Regular",
            highSchoolPercentage: body.highSchoolPercentage ? parseFloat(body.highSchoolPercentage) : null,
            intermediatePercentage: body.intermediatePercentage ? parseFloat(body.intermediatePercentage) : null,
            graduationPercentage: body.graduationPercentage ? parseFloat(body.graduationPercentage) : null,
        };

        const profileUpdateData = {
            profileImage: body.profileImage, // undefined = do nothing
            phone: phone,
            address: address,
            fatherName: body.fatherName,
            motherName: body.motherName,
            guardianName: body.guardianName,
            guardianPhone: body.guardianPhone,
            guardianEmail: body.guardianEmail,
            gender: body.gender,
            category: body.category,
            dob: body.dob ? new Date(body.dob) : undefined,
            bloodGroup: body.bloodGroup,
            college: body.college,
            course: body.course,
            branch: body.branch,
            yearSem: body.yearSem,
            section: body.section,
            rollNo: body.rollNo,
            enrollNo: body.enrollNo,
            studentType: body.studentType,
            highSchoolPercentage: body.highSchoolPercentage ? parseFloat(body.highSchoolPercentage) : undefined,
            intermediatePercentage: body.intermediatePercentage ? parseFloat(body.intermediatePercentage) : undefined,
            graduationPercentage: body.graduationPercentage ? parseFloat(body.graduationPercentage) : undefined,
        };

        // Remove undefined keys from profileUpdateData to ensure Prisma doesn't wipe them if missing
        (Object.keys(profileUpdateData) as (keyof typeof profileUpdateData)[]).forEach(key => profileUpdateData[key] === undefined && delete profileUpdateData[key]);


        updateData.profile = {
            upsert: {
                create: profileCreateData,
                update: profileUpdateData,
            }
        };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Handle room assignment for students
        if (role === Role.STUDENT && roomId !== undefined) {
            if (roomId) {
                updateData.room = { connect: { id: roomId } };
            } else {
                updateData.room = { disconnect: true };
            }
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            include: { profile: true }
        });

        console.log("User Updated (SERVER):", JSON.stringify(user, null, 2));

        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profile: true, // Fetch full profile
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Fields allowed to be updated by the user themselves
        const {
            phone, address, fatherName, motherName,
            guardianName, guardianPhone, guardianEmail,
            gender, dob, bloodGroup, bio
            // Note: Academic fields like course/branch/yearSem usually require admin approval or distinct process, 
            // but for "customization" we can allow basic ones if desired. 
            // For now limiting to personal info.
        } = body;

        const updatedProfile = await prisma.profile.upsert({
            where: { userId: session.user.id },
            update: {
                phone, address, fatherName, motherName,
                guardianName, guardianPhone, guardianEmail,
                gender, dob: dob ? new Date(dob) : undefined, bloodGroup
            },
            create: {
                userId: session.user.id,
                phone, address, fatherName, motherName,
                guardianName, guardianPhone, guardianEmail,
                gender, dob: dob ? new Date(dob) : undefined, bloodGroup
            },
        });

        return NextResponse.json({ message: "Profile updated", profile: updatedProfile });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

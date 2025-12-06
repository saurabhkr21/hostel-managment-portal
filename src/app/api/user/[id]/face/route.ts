import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { faceDescriptor } = body;

        if (!faceDescriptor) {
            return NextResponse.json(
                { error: "Face descriptor is required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data: {
                faceDescriptor: faceDescriptor, // Save JSON directly
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving face descriptor:", error);
        return NextResponse.json(
            { error: "Failed to save face descriptor" },
            { status: 500 }
        );
    }
}

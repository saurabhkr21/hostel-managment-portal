
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: "saurabh7221@gmail.com" },
            include: { profile: true },
        });

        return NextResponse.json({
            name: user?.name,
            hasProfile: !!user?.profile,
            imageLength: user?.profile?.profileImage?.length || 0,
            imagePreview: user?.profile?.profileImage?.substring(0, 30) || "NULL"
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

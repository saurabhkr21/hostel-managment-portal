import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const user = await prisma.user.findUnique({
            where: { id },
            include: { profile: true },
        });

        if (!user || !user.profile?.profileImage) {
            return new NextResponse(null, { status: 404 });
        }

        const imageData = user.profile.profileImage;

        // Handle Base64 images
        if (imageData.startsWith("data:image")) {
            const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

            if (!matches || matches.length !== 3) {
                return new NextResponse("Invalid image data", { status: 400 });
            }

            const type = matches[1];
            const buffer = Buffer.from(matches[2], "base64");

            return new NextResponse(buffer, {
                headers: {
                    "Content-Type": type,
                    "Cache-Control": "public, max-age=31536000, immutable",
                },
            });
        }

        // Handle URL images (redirect)
        if (imageData.startsWith("http")) {
            return NextResponse.redirect(imageData);
        }

        return new NextResponse("Unknown image format", { status: 400 });
    } catch (error) {
        console.error("Error serving avatar:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

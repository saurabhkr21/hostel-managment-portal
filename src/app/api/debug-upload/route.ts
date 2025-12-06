
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";

export async function GET() {
    try {
        const imagePath = "C:/Users/saura/.gemini/antigravity/brain/951ef600-1d06-406d-a0bb-1406cdca175b/uploaded_image_1764975246562.png";

        console.log("Checking path:", imagePath);
        if (!fs.existsSync(imagePath)) {
            return NextResponse.json({ error: "File not found at " + imagePath }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(imagePath);
        const base64Image = `data:image/png;base64,${fileBuffer.toString("base64")}`;

        console.log("Updating user profile...");
        const user = await prisma.user.update({
            where: { email: "saurabh7221@gmail.com" },
            data: {
                profile: {
                    upsert: {
                        create: {
                            profileImage: base64Image
                        },
                        update: {
                            profileImage: base64Image
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: "Image updated for " + user.name,
            imageLength: base64Image.length
        });
    } catch (error) {
        console.error("Debug Upload Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 200 });
    }
}

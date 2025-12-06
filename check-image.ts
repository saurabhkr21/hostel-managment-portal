
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: "saurabh7221@gmail.com" },
            include: { profile: true },
        });

        console.log("User found:", user?.name);
        console.log("Profile found:", user?.profile ? "Yes" : "No");
        if (user?.profile) {
            console.log("Profile Image length:", user.profile.profileImage?.length || 0);
            console.log("Profile Image starts with:", user.profile.profileImage?.substring(0, 30) || "NULL");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();


import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

async function main() {
    const email = "saurabhkr1227@gmail.com";
    console.log("Connecting to DB...");
    const start = Date.now();

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, password: true, role: true }
        });

        const duration = Date.now() - start;
        console.log(`Query took: ${duration}ms`);

        if (user) {
            console.log("User found:", user.email);
            console.log("Role:", user.role);
            // Log the password hash prefix to see rounds (e.g., $2a$10$...)
            console.log("Password Hash Prefix:", user.password.substring(0, 10));

            console.log("Testing Bcrypt speed...");
            const bStart = Date.now();
            await bcrypt.compare("dummy123", user.password);
            console.log("Bcrypt compare took:", Date.now() - bStart, "ms");
        } else {
            console.log("User not found");
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

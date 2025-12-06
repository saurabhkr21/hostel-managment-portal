import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const studentId = searchParams.get("studentId");

    try {
        const whereClause: any = {};

        if (session.user.role === Role.STUDENT) {
            whereClause.studentId = session.user.id;
        } else if (studentId) {
            whereClause.studentId = studentId;
        }

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            whereClause.date = {
                gte: startDate,
                lte: endDate,
            };
        }

        const attendance = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                student: {
                    select: {
                        name: true,
                        room: {
                            select: {
                                roomNumber: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        });
        return NextResponse.json(attendance);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch attendance" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== Role.STAFF && session.user.role !== Role.ADMIN)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { date, records } = body; // records: { studentId: string, status: string }[]

        if (!date || !records || !Array.isArray(records)) {
            return NextResponse.json(
                { error: "Invalid data" },
                { status: 400 }
            );
        }

        const attendanceDate = new Date(date);

        // Use transaction to upsert multiple records
        const operations = records.map((record: any) => {
            return prisma.attendance.upsert({
                where: {
                    studentId_date: {
                        studentId: record.studentId,
                        date: attendanceDate,
                    },
                },
                update: {
                    status: record.status,
                    markedBy: session.user.name || "Staff",
                },
                create: {
                    studentId: record.studentId,
                    date: attendanceDate,
                    status: record.status,
                    markedBy: session.user.name || "Staff",
                },
            });
        });

        await prisma.$transaction(operations);

        // --- Notification Logic ---
        // 1. Filter for ABSENT records
        const absentRecords = records.filter((r: any) => r.status === "ABSENT");

        if (absentRecords.length > 0) {
            // 2. Fetch details for absent students
            const studentIds = absentRecords.map((r: any) => r.studentId);
            const absentStudents = await prisma.user.findMany({
                where: { id: { in: studentIds } },
                include: { profile: true }
            });

            // 3. Send Notifications
            const notificationPromises = absentStudents.map(async (student) => {
                const guardianEmail = student.profile?.guardianEmail;
                const studentEmail = student.email;
                const guardianPhone = student.profile?.guardianPhone;
                const studentPhone = student.profile?.phone; // Get student phone too

                const dateStr = attendanceDate.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                // --- Professional Email Template ---
                const subject = `Urgent: Attendance Alert for ${student.name} - ${dateStr}`;
                const html = `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Hostel Management System</h1>
                        </div>
                        <div style="padding: 30px; background-color: #ffffff;">
                            <h2 style="color: #1e293b; margin-top: 0;">Attendance Alert</h2>
                            <p style="color: #475569; line-height: 1.6;">Dear Parent/Guardian & Student,</p>
                            <p style="color: #475569; line-height: 1.6;">
                                This is an official notification to inform you that <strong>${student.name}</strong> has been marked <strong>ABSENT</strong> during the daily attendance check on <strong>${dateStr}</strong>.
                            </p>
                            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                                <p style="margin: 0; color: #991b1b; font-weight: 500;">Status: ABSENT (Unexcused)</p>
                            </div>
                            <p style="color: #475569; line-height: 1.6;">
                                If this is an error or if there is a valid reason for this absence, please contact the hostel warden office immediately.
                            </p>
                            <p style="color: #475569; line-height: 1.6; margin-top: 30px;">
                                Best Regards,<br>
                                <strong>Hostel Warden</strong><br>
                                <em>Hostel Administration Office</em>
                            </p>
                        </div>
                        <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0;">This is an automated system-generated email. Please do not reply directly to this message.</p>
                        </div>
                    </div>
                `;

                // --- Send Emails ---
                if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                    if (guardianEmail) await sendEmail(guardianEmail, subject, html);
                    if (studentEmail) await sendEmail(studentEmail, subject, html);
                } else {
                    console.log(`[Mock Email Logic] Would send to: Parent(${guardianEmail || 'N/A'}), Student(${studentEmail})`);
                }

                // --- Create In-App Notification (Database) ---
                await prisma.notification.create({
                    data: {
                        userId: student.id,
                        message: `You were marked ABSENT on ${dateStr}. Please contact the warden if this is a mistake.`,
                        read: false
                    }
                });

                // --- Send SMS (Twilio or Mock) ---
                const smsMessage = `[Hostel Alert] ${student.name} is marked ABSENT on ${dateStr}. Please contact warden office immediately.`;

                // Send to Parent
                if (guardianPhone) {
                    await sendTwilioSMS(guardianPhone, smsMessage);
                }
                // Send to Student
                if (studentPhone) {
                    await sendTwilioSMS(studentPhone, smsMessage);
                }
            });

            Promise.all(notificationPromises).catch(err => console.error("Notification Error:", err));
        }
        // ---------------------------

        return NextResponse.json({ message: "Attendance marked successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error marking attendance:", error);
        return NextResponse.json(
            { error: "Failed to mark attendance" },
            { status: 500 }
        );
    }
}

// --- Helper Functions ---

import nodemailer from "nodemailer";
import twilio from "twilio";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendEmail(to: string, subject: string, html: string) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
        });
        console.log(`[Email Sent] To: ${to}`);
    } catch (error) {
        console.error(`[Email Failed] To: ${to}`, error);
    }
}

async function sendTwilioSMS(to: string, body: string) {
    // Check for credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromPhone) {
        try {
            const client = twilio(accountSid, authToken);
            await client.messages.create({
                body: body,
                from: fromPhone,
                to: to
            });
            console.log(`[Twilio SMS Sent] To: ${to}`);
        } catch (error) {
            console.error(`[Twilio SMS Failed] To: ${to}`, error);
        }
    } else {
        // Fallback to Mock if no credentials
        console.log(`\n--- [SMS GATEWAY SIMULATION] ---`);
        console.log(`To: ${to}`);
        console.log(`Message: "${body}"`);
        console.log(`Status: SKIPPED (Missing Twilio Credentials in .env)`);
        console.log(`--------------------------------\n`);
    }
}

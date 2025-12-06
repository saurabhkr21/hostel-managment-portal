import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { messages, userRole } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "AI service is not configured (Missing API Key)" },
                { status: 503 }
            );
        }

        const lastMessage = messages[messages.length - 1];

        // Define Role-Based Context
        let systemPrompt = `You are a helpful and intelligent Hostel Management AI Assistant. 
        Your goal is to help users navigate the portal and answer their questions about the hostel system.
        
        Keep your answers concise, friendly, and formatted (use markdown for lists). 
        You strictly focus on Hostel Management related topics. If asked about something else, politely decline.
        
        Current User Role: ${userRole || "Guest"}
        `;

        if (userRole === "ADMIN") {
            systemPrompt += `
            Features available to Admin:
            - Dashboard: View stats (students, staff, rooms, occupancy).
            - Manage Rooms: Add, edit, delete rooms. Manage blocks/floors.
            - Manage Users: Add, edit, delete Staff and Students.
            - Attendance: View daily attendance, monthly reports.
            - Complaints: View and resolve complaints.
            - Notices: Post notices.
            `;
        } else if (userRole === "STAFF") {
            systemPrompt += `
            Features available to Staff:
            - Dashboard: View stats.
            - Attendance: Mark daily attendance (Scan QR or Manual).
            - Students: View student details.
            - Complaints: View and update status of complaints assigned to you.
            - Leave Requests: Approve/Reject student leave requests.
            `;
        } else if (userRole === "STUDENT") {
            systemPrompt += `
            Features available to Student:
            - Dashboard: View personal stats.
            - Profile: View room details, roommate info.
            - Complaints: File new complaints, check status.
            - Leave: Apply for leave, check status.
            - Outing: Scan QR for outing entry/exit.
            - Settings: Setup Face ID.
            `;
        }

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to assist as the Hostel Management AI." }],
                },
                // Convert previous simple messages to Gemini format if needed, 
                // but for single turn or simple history we can just rely on the prompt + last message for now 
                // or map full history if we had a proper structure.
                // For simplicity in this v1, we focus on the last query with context.
            ],
        });

        const result = await chat.sendMessage(lastMessage.content);
        const response = result.response.text();

        return NextResponse.json({ reply: response });

    } catch (error) {
        console.error("AI Chat Error:", error);
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
}

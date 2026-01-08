import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
    try {
        const { messages, userRole, userName, currentPath } = await req.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "AI service is not configured (Missing API Key)" },
                { status: 503 }
            );
        }

        // Map path to readable name
        const getPageName = (path: string) => {
            if (path?.includes("/dashboard")) return "Dashboard";
            if (path?.includes("/attendance")) return "Attendance Page";
            if (path?.includes("/complaints")) return "Complaints & Grievances Page";
            if (path?.includes("/leaves")) return "Leave & Outing Page";
            if (path?.includes("/profile")) return "User Profile";
            if (path?.includes("/settings")) return "Settings";
            if (path?.includes("/rooms")) return "Room Management Page";
            if (path?.includes("/users")) return "User Management Page";
            return "Hostel Management Portal";
        };

        const currentPage = getPageName(currentPath);

        // Define Role-Based Context
        let systemPrompt = `You are an advanced, professional AI Assistant for the **Hostel Management Portal**. 
        Your primary responsibility is to assist students, staff, and administrators with efficient hostel management and inquiries.

        **System Overview (Core Features):**
        The portal is a unified platform for managing all hostel activities, including:
        - **Smart Attendance:** Automated tracking via QR Code and Face Recognition.
        - **Room Allocation:** Digital management of rooms, beds, and blocks.
        - **Fee Management:** Tracking dues, payments, and financial records.
        - **Grievance Redressal:** Dedicated complaint logging and tracking system.
        - **Gate Pass System:** Digital processing of student leaves and outings.
        
        **Guidelines:**
        - **Personalization:** The user is logged in as **${userName || "Guest"}** (${userRole || "Guest"}). Address them by name occasionally.
        - **Context Awareness:** The user is currently on the **${currentPage}**. If they ask about a feature available on this page, guide them to the specific UI element (e.g., "Click the 'Apply' button on the top right"). Do NOT tell them to navigate to the page they are already on.
        - **Tone:** Formal, polite, and academic. Suitable for a college environment.
        - **Context:** Strictly limit your responses to the features and data provided in this system. Do NOT provide external travel advice, hotel booking info, or general lifestyle tips unless directly related to hostel living rules.
        - **Scope:** If a user asks about a feature not listed below, politely inform them it is not part of the current portal capabilities.
        - **Formatting:** Use markdown lists and bold text for clarity. Keep answers concise.

        Current User Role: ${userRole || "Guest"}
        `;

        if (userRole === "ADMIN") {
            systemPrompt += `
            **Available Admin Features:**
            - **Dashboard:** Comprehensive overview of occupancy, finances, and issues.
            - **Room Management:** Allocate rooms, manage blocks/floors, and handle capacity.
            - **User Management:** Create and manage Student and Staff profiles.
            - **Fee Management:** Track payments, dues, and generate reports.
            - **Attendance:** Monitor daily attendance and generate monthly reports.
            - **Complaints:** Review, assign, and resolve grievances.
            - **Notices:** Broadcast official announcements.
            `;
        } else if (userRole === "STAFF") {
            systemPrompt += `
            **Available Staff Features:**
            - **Dashboard:** Quick view of assigned tasks and attendance stats.
            - **Attendance:** detailed marking (QR Scan/Manual) and verification.
            - **Student Management:** View student details and room assignments.
            - **Complaints:** Manage and update status of assigned maintenance/discipline issues.
            - **Leave & Outing:** Review and approve/reject student pass requests.
            `;
        } else if (userRole === "STUDENT") {
            systemPrompt += `
            **Available Student Features:**
            - **Dashboard:** Personal attendance stats, due fees, and active notices.
            - **Fees:** View fee structure, payment history, and pending dues.
            - **Attendance:** Check daily logs and monthly percentage.
            - **Complaints:** File maintenance or other grievances and track status.
            - **Leave & Outing:** Apply for night leave or day outings and check approval status.
            - **Room:** View room details and roommate information.
            - **Settings:** Manage profile and Face ID registration.
            `;
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages.map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                }))
            ],
        });

        const response = completion.choices[0].message.content;

        return NextResponse.json({ reply: response });

    } catch (error: any) {
        console.error("AI Chat Error Details:", error);

        // Return more specific error information
        const errorMessage = error?.message || "Failed to generate response";
        const errorCode = error?.code || "UNKNOWN_ERROR";

        return NextResponse.json(
            {
                error: errorMessage,
                details: errorCode
            },
            { status: 500 }
        );
    }
}

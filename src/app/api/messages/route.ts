import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("targetId");
    const type = searchParams.get("type"); // "primary" | "requests"
    const search = searchParams.get("search");

    try {
        if (search) {
            // Search globally for students to message
            const users = await prisma.user.findMany({
                where: {
                    role: "STUDENT",
                    id: { not: session.user.id },
                    name: { contains: search, mode: "insensitive" }
                },
                take: 10,
                select: {
                    id: true,
                    name: true,
                    role: true,
                    profile: {
                        select: { profileImage: true }
                    }
                }
            });

            // Map to standard format - check for existing conversation ID if possible? 
            // For now, simpler to just return users. Front-end will treat as "user to message"
            // We can fetch conversation status on selection if needed, or better:
            // Check if we have a conversation with them to set "conversationId"

            const results = await Promise.all(users.map(async (u) => {
                const existingConv = await prisma.conversation.findFirst({
                    where: {
                        participantIds: { hasEvery: [session.user.id, u.id] }
                    },
                    select: { id: true, status: true, initiatorId: true }
                });

                return {
                    id: u.id,
                    name: u.name,
                    role: u.role,
                    conversationId: existingConv?.id || "",
                    status: existingConv?.status || "PENDING",
                    // If no conversation, status "PENDING" is effectively "New Request" when created
                    // But effectively checking if we have valid chat
                    lastMessage: existingConv ? "Resume chat" : "Start a new conversation"
                };
            }));

            return NextResponse.json(results);

        } else if (targetId) {
            // Get specific conversation messages
            const conversation = await prisma.conversation.findFirst({
                where: {
                    participantIds: {
                        hasEvery: [session.user.id, targetId]
                    }
                },
                include: {
                    messages: {
                        orderBy: { createdAt: "asc" }
                    }
                }
            });

            if (!conversation) return NextResponse.json([]);

            return NextResponse.json(conversation.messages);

        } else {
            // Get List of threads/users
            // Filter by type:
            // "primary": status ACCEPTED OR (status PENDING AND initiatorId == ME)
            // "requests": status PENDING AND initiatorId != ME

            const statusFilter = type === "requests"
                ? {
                    status: "PENDING",
                    initiatorId: { not: session.user.id }
                }
                : {
                    OR: [
                        { status: "ACCEPTED" },
                        {
                            status: "PENDING",
                            initiatorId: session.user.id
                        }
                    ]
                };

            const conversations = await prisma.conversation.findMany({
                where: {
                    participantIds: { has: session.user.id },
                    ...statusFilter as any
                },
                include: {
                    participants: {
                        select: {
                            id: true,
                            name: true,
                            role: true,
                            profile: {
                                select: { profileImage: true }
                            }
                        }
                    },
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1
                    }
                },
                orderBy: { updatedAt: "desc" }
            });

            // Map to UserSummary format
            const threads = conversations.map(conv => {
                const otherUser = conv.participants.find(p => p.id !== session.user.id);
                return {
                    id: otherUser?.id,
                    name: otherUser?.name,
                    role: otherUser?.role,
                    profileImage: (otherUser as any)?.profile?.profileImage,
                    lastMessage: conv.messages[0]?.content,
                    conversationId: conv.id,
                    status: conv.status,
                    initiatorId: conv.initiatorId
                };
            }).filter(t => t.id); // Filter out self if something weird happens

            return NextResponse.json(threads);
        }
    } catch (error) {
        console.error("Messages GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { content, receiverId } = body;

        if (!content || !receiverId) {
            return NextResponse.json({ error: "Missing content or receiver" }, { status: 400 });
        }

        // 1. Check if conversation exists
        let conversation = await prisma.conversation.findFirst({
            where: {
                participantIds: {
                    hasEvery: [session.user.id, receiverId]
                }
            }
        });

        // 2. If no conversation, create one (PENDING)
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    participantIds: [session.user.id, receiverId],
                    initiatorId: session.user.id,
                    status: "PENDING"
                }
            });

            // Connect users to conversation (for relations update)
            await prisma.user.update({ where: { id: session.user.id }, data: { conversations: { connect: { id: conversation.id } } } });
            await prisma.user.update({ where: { id: receiverId }, data: { conversations: { connect: { id: conversation.id } } } });
        }

        // 3. Create Message
        const message = await prisma.message.create({
            data: {
                content,
                senderId: session.user.id,
                receiverId: receiverId,
                conversationId: conversation.id
            }
        });

        // 4. Update Conversation timestamp
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(message);

    } catch (error) {
        console.error("Messages POST Error:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { sessions, adminUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getMessagesBySession,
  getUnreadCountBySession,
  createAdminReply,
  markMessagesAsRead,
} from "@/lib/db/queries/support-messages";

// GET - Get all support messages for a session (grouped by team)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: "Non autorizzato" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const sessionId = parseInt(id, 10);
  if (isNaN(sessionId)) {
    return NextResponse.json(
      { success: false, error: "ID sessione non valido" },
      { status: 400 }
    );
  }

  try {
    // Check if session exists
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Sessione non trovata" },
        { status: 404 }
      );
    }

    const messagesByTeam = await getMessagesBySession(sessionId);
    const unreadCount = await getUnreadCountBySession(sessionId);

    // Serialize dates properly for JSON response
    const serializedData = messagesByTeam.map((team) => ({
      ...team,
      lastMessage: team.lastMessage
        ? {
            ...team.lastMessage,
            createdAt:
              team.lastMessage.createdAt instanceof Date
                ? team.lastMessage.createdAt.toISOString()
                : team.lastMessage.createdAt,
          }
        : null,
      messages: team.messages.map((msg) => ({
        ...msg,
        createdAt:
          msg.createdAt instanceof Date
            ? msg.createdAt.toISOString()
            : msg.createdAt,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        messagesByTeam: serializedData,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Error fetching support messages:", error);
    return NextResponse.json(
      { success: false, error: "Errore nel caricamento dei messaggi" },
      { status: 500 }
    );
  }
}

// POST - Send a reply to a team
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: "Non autorizzato" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const sessionId = parseInt(id, 10);
  if (isNaN(sessionId)) {
    return NextResponse.json(
      { success: false, error: "ID sessione non valido" },
      { status: 400 }
    );
  }

  try {
    // Get admin user
    const adminUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.clerkId, clerkId),
    });

    if (!adminUser || adminUser.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Non autorizzato" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { teamId, message, attachmentUrl, attachmentType } = body;

    if (!teamId || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Team e messaggio sono obbligatori" },
        { status: 400 }
      );
    }

    const newMessage = await createAdminReply(
      teamId,
      sessionId,
      adminUser.id,
      message.trim(),
      attachmentUrl,
      attachmentType
    );

    return NextResponse.json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Error creating admin reply:", error);
    return NextResponse.json(
      { success: false, error: "Errore nell'invio del messaggio" },
      { status: 500 }
    );
  }
}

// PATCH - Mark messages as read
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: "Non autorizzato" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const sessionId = parseInt(id, 10);
  if (isNaN(sessionId)) {
    return NextResponse.json(
      { success: false, error: "ID sessione non valido" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "Team ID obbligatorio" },
        { status: 400 }
      );
    }

    await markMessagesAsRead(teamId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { success: false, error: "Errore nell'aggiornamento" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getCurrentPlayer } from "@/lib/utils/player-session";
import {
  getMessagesByTeam,
  createPlayerMessage,
  getUnreadCountByTeam,
  markAdminRepliesAsRead,
} from "@/lib/db/queries/support-messages";
import { getTeamPathLength } from "@/lib/db/queries/progress";
import { getTeamCurrentLocation } from "@/lib/db/queries/progress";
import { getSessionById } from "@/lib/db/queries";
import type { GameContext } from "@/lib/db/schema";

// GET - Get messages for the player's team
export async function GET() {
  const session = await getCurrentPlayer();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Non autenticato" },
      { status: 401 }
    );
  }

  if (!session.team) {
    return NextResponse.json(
      { success: false, error: "Non sei assegnato a una squadra" },
      { status: 400 }
    );
  }

  try {
    const [messages, unreadCount, gameSession] = await Promise.all([
      getMessagesByTeam(session.team.id),
      getUnreadCountByTeam(session.team.id),
      getSessionById(session.player.sessionId),
    ]);

    // Mark admin replies as read when player fetches messages
    if (unreadCount > 0) {
      await markAdminRepliesAsRead(session.team.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        messages,
        unreadCount,
        adminDisplayName: gameSession?.adminDisplayName || null,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, error: "Errore nel caricamento dei messaggi" },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(request: Request) {
  const session = await getCurrentPlayer();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Non autenticato" },
      { status: 401 }
    );
  }

  if (!session.team) {
    return NextResponse.json(
      { success: false, error: "Non sei assegnato a una squadra" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { message, attachmentUrl, attachmentType } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Il messaggio non può essere vuoto" },
        { status: 400 }
      );
    }

    // Build game context
    const totalStages = await getTeamPathLength(session.team.id);
    const currentLocation = await getTeamCurrentLocation(session.team.id);

    const gameContext: GameContext = {
      teamName: session.team.name,
      currentStage: session.team.currentStage,
      totalStages,
      locationName: currentLocation?.nameIt,
    };

    const newMessage = await createPlayerMessage(
      session.team.id,
      session.player.sessionId,
      session.player.id,
      message.trim(),
      gameContext,
      attachmentUrl,
      attachmentType
    );

    return NextResponse.json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { success: false, error: "Errore nell'invio del messaggio" },
      { status: 500 }
    );
  }
}

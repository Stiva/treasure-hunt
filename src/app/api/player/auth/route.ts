import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
} from "@/lib/utils";
import { db, sessions, players } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import {
  createPlayerSession,
  setPlayerSessionCookie,
  clearPlayerSession,
  getCurrentPlayer,
} from "@/lib/utils/player-session";
import { playerLoginSchema } from "@/lib/validations";

// POST /api/player/auth - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = playerLoginSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const { email, keyword } = validation.data;
    const normalizedEmail = email.toLowerCase();

    // Find active session with this keyword
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.keyword, keyword), eq(sessions.isActive, true)))
      .limit(1);

    if (!session) {
      return errorResponse(
        "Sessione non trovata o non attiva. Verifica la parola chiave.",
        401
      );
    }

    // Find player with this email in the session
    const [player] = await db
      .select()
      .from(players)
      .where(
        and(
          eq(players.sessionId, session.id),
          eq(players.email, normalizedEmail)
        )
      )
      .limit(1);

    if (!player) {
      return errorResponse(
        "Email non trovata in questa sessione. Verifica i dati inseriti.",
        401
      );
    }

    // Check if player is assigned to a team
    if (!player.teamId) {
      return errorResponse(
        "Non sei ancora stato assegnato a una squadra. Contatta l'organizzatore.",
        403
      );
    }

    // Create session and set cookie
    const token = await createPlayerSession(player.id);
    await setPlayerSessionCookie(token);

    return successResponse(
      {
        player: {
          id: player.id,
          firstName: player.firstName,
          lastName: player.lastName,
          email: player.email,
          teamId: player.teamId,
        },
        sessionName: session.name,
      },
      "Login effettuato con successo"
    );
  } catch (error) {
    console.error("Error during player login:", error);
    return errorResponse("Errore durante il login", 500);
  }
}

// GET /api/player/auth - Get current player
export async function GET() {
  try {
    const sessionData = await getCurrentPlayer();

    if (!sessionData) {
      return errorResponse("Non autenticato", 401);
    }

    const { player, team } = sessionData;

    // Get session info
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, player.sessionId))
      .limit(1);

    return successResponse({
      player: {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        email: player.email,
        teamId: player.teamId,
      },
      team: team
        ? {
            id: team.id,
            name: team.name,
            currentStage: team.currentStage,
            startedAt: team.startedAt,
            finishedAt: team.finishedAt,
          }
        : null,
      session: session
        ? {
            id: session.id,
            name: session.name,
            gameMode: session.gameMode,
            isActive: session.isActive,
          }
        : null,
    });
  } catch (error) {
    console.error("Error getting current player:", error);
    return errorResponse("Errore durante il recupero dei dati", 500);
  }
}

// DELETE /api/player/auth - Logout
export async function DELETE() {
  try {
    await clearPlayerSession();
    return successResponse(null, "Logout effettuato con successo");
  } catch (error) {
    console.error("Error during logout:", error);
    return errorResponse("Errore durante il logout", 500);
  }
}

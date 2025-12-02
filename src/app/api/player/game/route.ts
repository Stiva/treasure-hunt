import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/utils";
import { getCurrentPlayer } from "@/lib/utils/player-session";
import {
  getTeamGameState,
  getTeamPath,
  isCorrectCode,
  advanceTeamToNextStage,
  recordHintRequest,
  startTeam,
  getSessionById,
} from "@/lib/db/queries";

// GET /api/player/game - Get current game state
export async function GET() {
  try {
    const sessionData = await getCurrentPlayer();
    if (!sessionData) {
      return unauthorizedResponse();
    }

    const { player, team } = sessionData;

    if (!team) {
      return errorResponse("Non sei assegnato a nessuna squadra", 403);
    }

    const gameState = await getTeamGameState(team.id);
    if (!gameState) {
      return errorResponse("Stato di gioco non trovato", 404);
    }

    const path = await getTeamPath(team.id);

    // Get session for victory message
    const session = await getSessionById(player.sessionId);

    // Get localized content
    // Include GPS coordinates only if gpsHintEnabled is true
    const gpsHintEnabled = gameState.team.gpsHintEnabled;

    return successResponse({
      team: {
        id: gameState.team.id,
        name: gameState.team.name,
        currentStage: gameState.team.currentStage,
        hintsUsedCurrentStage: gameState.team.hintsUsedCurrentStage,
        lastHintRequestedAt: gameState.team.lastHintRequestedAt,
        startedAt: gameState.team.startedAt,
        finishedAt: gameState.team.finishedAt,
        gpsHintEnabled: gpsHintEnabled,
      },
      currentLocation: gameState.currentLocation,
      nextLocation: gameState.nextLocation
        ? {
            // Only expose the riddle, not the code!
            id: gameState.nextLocation.id,
            nameIt: gameState.nextLocation.nameIt,
            nameEn: gameState.nextLocation.nameEn,
            riddleIt: gameState.nextLocation.riddleIt,
            riddleEn: gameState.nextLocation.riddleEn,
            hint1It: gameState.nextLocation.hint1It,
            hint1En: gameState.nextLocation.hint1En,
            hint2It: gameState.nextLocation.hint2It,
            hint2En: gameState.nextLocation.hint2En,
            hint3It: gameState.nextLocation.hint3It,
            hint3En: gameState.nextLocation.hint3En,
            isStart: gameState.nextLocation.isStart,
            isEnd: gameState.nextLocation.isEnd,
            // Include GPS coordinates only if admin has enabled GPS hint
            ...(gpsHintEnabled && gameState.nextLocation.latitude && gameState.nextLocation.longitude
              ? {
                  latitude: gameState.nextLocation.latitude,
                  longitude: gameState.nextLocation.longitude,
                }
              : {}),
          }
        : null,
      totalStages: gameState.totalStages,
      isCompleted: gameState.isCompleted,
      pathLength: path.length,
      hasStarted: gameState.team.startedAt !== null,
      victoryMessageIt: session?.victoryMessageIt || null,
      victoryMessageEn: session?.victoryMessageEn || null,
    });
  } catch (error) {
    console.error("Error getting game state:", error);
    return errorResponse("Errore durante il recupero dello stato di gioco", 500);
  }
}

// POST /api/player/game - Submit code or start game
export async function POST(request: NextRequest) {
  try {
    const sessionData = await getCurrentPlayer();
    if (!sessionData) {
      return unauthorizedResponse();
    }

    const { team } = sessionData;

    if (!team) {
      return errorResponse("Non sei assegnato a nessuna squadra", 403);
    }

    const body = await request.json();
    const { action, code } = body;

    // Start game action
    if (action === "start") {
      if (team.startedAt) {
        return errorResponse("Il gioco è già iniziato");
      }

      const updatedTeam = await startTeam(team.id);
      return successResponse(
        { team: updatedTeam },
        "Gioco iniziato! Buona fortuna!"
      );
    }

    // Submit code action
    if (action === "submit_code") {
      if (!code || typeof code !== "string") {
        return errorResponse("Codice non valido");
      }

      const isCorrect = await isCorrectCode(team.id, code.trim());

      if (!isCorrect) {
        return errorResponse("Codice errato. Riprova!", 400);
      }

      // Advance to next stage
      const updatedTeam = await advanceTeamToNextStage(team.id);

      if (updatedTeam?.finishedAt) {
        return successResponse(
          { team: updatedTeam, completed: true },
          "Complimenti! Hai completato la caccia al tesoro!"
        );
      }

      return successResponse(
        { team: updatedTeam, completed: false },
        "Corretto! Avanti verso la prossima tappa!"
      );
    }

    // Request hint action
    if (action === "request_hint") {
      // Check hints limit
      if (team.hintsUsedCurrentStage >= 3) {
        return errorResponse("Hai già usato tutti gli indizi per questa tappa");
      }

      // Check cooldown (3 minutes)
      if (team.lastHintRequestedAt) {
        const cooldownMs = 3 * 60 * 1000; // 3 minutes
        const timeSinceLastHint =
          Date.now() - new Date(team.lastHintRequestedAt).getTime();

        if (timeSinceLastHint < cooldownMs) {
          const remainingSeconds = Math.ceil(
            (cooldownMs - timeSinceLastHint) / 1000
          );
          return errorResponse(
            `Devi attendere ancora ${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")} per il prossimo indizio`
          );
        }
      }

      const updatedTeam = await recordHintRequest(team.id);
      const hintNumber = updatedTeam?.hintsUsedCurrentStage || 1;

      return successResponse(
        { team: updatedTeam, hintNumber },
        `Indizio ${hintNumber} sbloccato!`
      );
    }

    return errorResponse("Azione non valida");
  } catch (error) {
    console.error("Error processing game action:", error);
    return errorResponse("Errore durante l'elaborazione", 500);
  }
}

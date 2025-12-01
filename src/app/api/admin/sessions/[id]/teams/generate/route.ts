import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/utils";
import {
  getSessionById,
  getUnassignedPlayers,
  createTeam,
  assignPlayersToTeam,
  getTeamsBySessionId,
} from "@/lib/db/queries";
import { generateCouplesSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/admin/sessions/[id]/teams/generate - Generate teams automatically
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      return errorResponse("Invalid session ID");
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      return notFoundResponse("Sessione non trovata");
    }

    const body = await request.json();
    const validation = generateCouplesSchema.safeParse({
      ...body,
      sessionId,
    });

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const { method } = validation.data;

    // Get unassigned players
    let players = await getUnassignedPlayers(sessionId);

    if (players.length === 0) {
      return errorResponse("Nessun giocatore disponibile da assegnare");
    }

    // Sort or shuffle based on method
    if (method === "alphabetical") {
      players = [...players].sort((a, b) =>
        `${a.lastName} ${a.firstName}`.localeCompare(
          `${b.lastName} ${b.firstName}`
        )
      );
    } else {
      // Fisher-Yates shuffle for random
      players = [...players];
      for (let i = players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]];
      }
    }

    // Get existing teams count for naming
    const existingTeams = await getTeamsBySessionId(sessionId);
    let teamNumber = existingTeams.length + 1;

    // Create teams based on game mode
    const playersPerTeam = session.gameMode === "couples" ? 2 : 1;
    const createdTeams: Array<{ name: string; players: string[] }> = [];

    for (let i = 0; i < players.length; i += playersPerTeam) {
      const teamPlayers = players.slice(i, i + playersPerTeam);

      // Generate team name
      let teamName: string;
      if (playersPerTeam === 1) {
        // Solo mode: use player name
        teamName = `${teamPlayers[0].firstName} ${teamPlayers[0].lastName}`;
      } else {
        // Couples mode: use team number
        teamName = `Squadra ${teamNumber}`;
        teamNumber++;
      }

      // Create team
      const team = await createTeam({
        sessionId,
        name: teamName,
      });

      // Assign players to team
      await assignPlayersToTeam(
        team.id,
        teamPlayers.map((p) => p.id)
      );

      createdTeams.push({
        name: teamName,
        players: teamPlayers.map((p) => `${p.firstName} ${p.lastName}`),
      });
    }

    // Count unassigned (in case of odd number in couples mode)
    const remainingUnassigned =
      session.gameMode === "couples" && players.length % 2 === 1 ? 1 : 0;

    return successResponse(
      {
        teamsCreated: createdTeams.length,
        teams: createdTeams,
        playersAssigned: players.length - remainingUnassigned,
        unassignedRemaining: remainingUnassigned,
      },
      `${createdTeams.length} squadre create con successo`,
      201
    );
  } catch (error) {
    console.error("Error generating teams:", error);
    return errorResponse("Failed to generate teams", 500);
  }
}

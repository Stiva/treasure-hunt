import { eq, and, asc, isNull, isNotNull } from "drizzle-orm";
import { db, teams, players, type Team, type NewTeam, type Player } from "../index";

export type TeamWithPlayers = Team & {
  players: Player[];
};

export async function getTeamsBySessionId(
  sessionId: number
): Promise<TeamWithPlayers[]> {
  const allTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.sessionId, sessionId))
    .orderBy(asc(teams.name));

  const teamsWithPlayers: TeamWithPlayers[] = [];

  for (const team of allTeams) {
    const teamPlayers = await db
      .select()
      .from(players)
      .where(eq(players.teamId, team.id));

    teamsWithPlayers.push({
      ...team,
      players: teamPlayers,
    });
  }

  return teamsWithPlayers;
}

export async function getTeamById(id: number): Promise<Team | undefined> {
  const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return result[0];
}

export async function getTeamWithPlayers(
  id: number
): Promise<TeamWithPlayers | undefined> {
  const team = await getTeamById(id);
  if (!team) return undefined;

  const teamPlayers = await db
    .select()
    .from(players)
    .where(eq(players.teamId, id));

  return {
    ...team,
    players: teamPlayers,
  };
}

export async function createTeam(data: NewTeam): Promise<Team> {
  const result = await db.insert(teams).values(data).returning();
  return result[0];
}

export async function updateTeam(
  id: number,
  data: Partial<NewTeam>
): Promise<Team | undefined> {
  const result = await db
    .update(teams)
    .set(data)
    .where(eq(teams.id, id))
    .returning();
  return result[0];
}

export async function deleteTeam(id: number): Promise<boolean> {
  // First, unassign all players from this team
  await db
    .update(players)
    .set({ teamId: null })
    .where(eq(players.teamId, id));

  // Then delete the team
  await db.delete(teams).where(eq(teams.id, id));
  return true;
}

export async function assignPlayersToTeam(
  teamId: number,
  playerIds: number[]
): Promise<void> {
  // Remove players currently assigned to this team
  await db
    .update(players)
    .set({ teamId: null })
    .where(eq(players.teamId, teamId));

  // Assign new players to the team
  for (const playerId of playerIds) {
    await db
      .update(players)
      .set({ teamId })
      .where(eq(players.id, playerId));
  }
}

export async function removePlayerFromTeam(playerId: number): Promise<void> {
  await db.update(players).set({ teamId: null }).where(eq(players.id, playerId));
}

export async function updateTeamProgress(
  teamId: number,
  currentStage: number
): Promise<Team | undefined> {
  const result = await db
    .update(teams)
    .set({
      currentStage,
      hintsUsedCurrentStage: 0,
      lastHintRequestedAt: null,
    })
    .where(eq(teams.id, teamId))
    .returning();
  return result[0];
}

export async function startTeam(teamId: number): Promise<Team | undefined> {
  const result = await db
    .update(teams)
    .set({
      startedAt: new Date(),
      currentStage: 0,
    })
    .where(eq(teams.id, teamId))
    .returning();
  return result[0];
}

export async function finishTeam(teamId: number): Promise<Team | undefined> {
  const result = await db
    .update(teams)
    .set({ finishedAt: new Date() })
    .where(eq(teams.id, teamId))
    .returning();
  return result[0];
}

export async function recordHintRequest(
  teamId: number
): Promise<Team | undefined> {
  const team = await getTeamById(teamId);
  if (!team) return undefined;

  const result = await db
    .update(teams)
    .set({
      hintsUsedCurrentStage: team.hintsUsedCurrentStage + 1,
      lastHintRequestedAt: new Date(),
    })
    .where(eq(teams.id, teamId))
    .returning();
  return result[0];
}

export async function getTeamsWithoutPaths(sessionId: number): Promise<Team[]> {
  // Get all teams in the session
  const allTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.sessionId, sessionId));

  return allTeams;
}

export async function getStartedTeams(sessionId: number): Promise<Team[]> {
  return db
    .select()
    .from(teams)
    .where(
      and(eq(teams.sessionId, sessionId), isNotNull(teams.startedAt))
    );
}

export async function getCompletedTeams(sessionId: number): Promise<Team[]> {
  return db
    .select()
    .from(teams)
    .where(
      and(eq(teams.sessionId, sessionId), isNotNull(teams.finishedAt))
    );
}

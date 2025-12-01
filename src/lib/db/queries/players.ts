import { eq, and, asc, isNull, ne } from "drizzle-orm";
import { db, players, type Player, type NewPlayer } from "../index";

export async function getPlayersBySessionId(
  sessionId: number
): Promise<Player[]> {
  return db
    .select()
    .from(players)
    .where(eq(players.sessionId, sessionId))
    .orderBy(asc(players.lastName), asc(players.firstName));
}

export async function getPlayerById(id: number): Promise<Player | undefined> {
  const result = await db
    .select()
    .from(players)
    .where(eq(players.id, id))
    .limit(1);
  return result[0];
}

export async function getPlayerByEmail(
  sessionId: number,
  email: string
): Promise<Player | undefined> {
  const result = await db
    .select()
    .from(players)
    .where(
      and(
        eq(players.sessionId, sessionId),
        eq(players.email, email.toLowerCase())
      )
    )
    .limit(1);
  return result[0];
}

export async function getUnassignedPlayers(
  sessionId: number
): Promise<Player[]> {
  return db
    .select()
    .from(players)
    .where(
      and(eq(players.sessionId, sessionId), isNull(players.teamId))
    )
    .orderBy(asc(players.lastName), asc(players.firstName));
}

export async function getPlayersByTeamId(teamId: number): Promise<Player[]> {
  return db
    .select()
    .from(players)
    .where(eq(players.teamId, teamId))
    .orderBy(asc(players.lastName), asc(players.firstName));
}

export async function createPlayer(data: NewPlayer): Promise<Player> {
  const result = await db
    .insert(players)
    .values({
      ...data,
      email: data.email.toLowerCase(),
    })
    .returning();
  return result[0];
}

export async function createManyPlayers(
  dataArray: NewPlayer[]
): Promise<Player[]> {
  if (dataArray.length === 0) return [];

  const normalizedData = dataArray.map((data) => ({
    ...data,
    email: data.email.toLowerCase(),
  }));

  const result = await db.insert(players).values(normalizedData).returning();
  return result;
}

export async function updatePlayer(
  id: number,
  data: Partial<NewPlayer>
): Promise<Player | undefined> {
  const updateData = {
    ...data,
    ...(data.email && { email: data.email.toLowerCase() }),
  };

  const result = await db
    .update(players)
    .set(updateData)
    .where(eq(players.id, id))
    .returning();
  return result[0];
}

export async function deletePlayer(id: number): Promise<boolean> {
  await db.delete(players).where(eq(players.id, id));
  return true;
}

export async function isEmailUnique(
  sessionId: number,
  email: string,
  excludeId?: number
): Promise<boolean> {
  const normalizedEmail = email.toLowerCase();
  const conditions = excludeId
    ? and(
        eq(players.sessionId, sessionId),
        eq(players.email, normalizedEmail),
        ne(players.id, excludeId)
      )
    : and(
        eq(players.sessionId, sessionId),
        eq(players.email, normalizedEmail)
      );

  const result = await db
    .select({ id: players.id })
    .from(players)
    .where(conditions)
    .limit(1);

  return result.length === 0;
}

export async function assignPlayerToTeam(
  playerId: number,
  teamId: number | null
): Promise<Player | undefined> {
  const result = await db
    .update(players)
    .set({ teamId })
    .where(eq(players.id, playerId))
    .returning();
  return result[0];
}

export async function getPlayersCount(sessionId: number): Promise<number> {
  const result = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.sessionId, sessionId));
  return result.length;
}

export async function deleteAllPlayersBySessionId(
  sessionId: number
): Promise<void> {
  await db.delete(players).where(eq(players.sessionId, sessionId));
}

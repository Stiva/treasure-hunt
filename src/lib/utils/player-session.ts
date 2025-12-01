import { cookies } from "next/headers";
import { db, playerSessions, players, teams } from "@/lib/db";
import { eq, and, gt } from "drizzle-orm";
import { randomBytes } from "crypto";
import type { Player, Team } from "@/lib/db/schema";

const SESSION_COOKIE_NAME = "player_session";
const SESSION_DURATION_HOURS = 24;

interface PlayerSessionData {
  player: Player;
  team: Team | null;
}

/**
 * Generate a secure random token
 */
function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Create a new player session
 */
export async function createPlayerSession(
  playerId: number
): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

  await db.insert(playerSessions).values({
    playerId,
    sessionToken: token,
    expiresAt,
  });

  return token;
}

/**
 * Set the session cookie
 */
export async function setPlayerSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/**
 * Get the session token from cookies
 */
export async function getPlayerSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

/**
 * Get current player from session
 */
export async function getCurrentPlayer(): Promise<PlayerSessionData | null> {
  const token = await getPlayerSessionToken();
  if (!token) return null;

  // Find valid session
  const [session] = await db
    .select()
    .from(playerSessions)
    .where(
      and(
        eq(playerSessions.sessionToken, token),
        gt(playerSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!session) return null;

  // Get player
  const [player] = await db
    .select()
    .from(players)
    .where(eq(players.id, session.playerId))
    .limit(1);

  if (!player) return null;

  // Get team if assigned
  let team: Team | null = null;
  if (player.teamId) {
    const [teamResult] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, player.teamId))
      .limit(1);
    team = teamResult || null;
  }

  return { player, team };
}

/**
 * Clear the session cookie
 */
export async function clearPlayerSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    // Delete session from database
    await db
      .delete(playerSessions)
      .where(eq(playerSessions.sessionToken, token));
  }

  // Clear cookie
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Validate and extend session
 */
export async function extendPlayerSession(): Promise<boolean> {
  const token = await getPlayerSessionToken();
  if (!token) return false;

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

  const result = await db
    .update(playerSessions)
    .set({ expiresAt })
    .where(
      and(
        eq(playerSessions.sessionToken, token),
        gt(playerSessions.expiresAt, new Date())
      )
    )
    .returning();

  if (result.length > 0) {
    await setPlayerSessionCookie(token);
    return true;
  }

  return false;
}

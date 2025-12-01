import { eq, desc, and, ne } from "drizzle-orm";
import { db, sessions, type Session, type NewSession } from "../index";

export async function getAllSessions(): Promise<Session[]> {
  return db.select().from(sessions).orderBy(desc(sessions.createdAt));
}

export async function getSessionById(id: number): Promise<Session | undefined> {
  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1);
  return result[0];
}

export async function getSessionByKeyword(
  keyword: string
): Promise<Session | undefined> {
  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.keyword, keyword))
    .limit(1);
  return result[0];
}

export async function getActiveSession(): Promise<Session | undefined> {
  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.isActive, true))
    .limit(1);
  return result[0];
}

export async function createSession(data: NewSession): Promise<Session> {
  const result = await db.insert(sessions).values(data).returning();
  return result[0];
}

export async function updateSession(
  id: number,
  data: Partial<NewSession>
): Promise<Session | undefined> {
  const result = await db
    .update(sessions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(sessions.id, id))
    .returning();
  return result[0];
}

export async function deleteSession(id: number): Promise<boolean> {
  const result = await db.delete(sessions).where(eq(sessions.id, id));
  return true;
}

export async function activateSession(id: number): Promise<Session | undefined> {
  // First, deactivate all sessions
  await db.update(sessions).set({ isActive: false, updatedAt: new Date() });

  // Then activate the specified session
  const result = await db
    .update(sessions)
    .set({ isActive: true, updatedAt: new Date() })
    .where(eq(sessions.id, id))
    .returning();

  return result[0];
}

export async function deactivateSession(
  id: number
): Promise<Session | undefined> {
  const result = await db
    .update(sessions)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(sessions.id, id))
    .returning();
  return result[0];
}

export async function isKeywordUnique(
  keyword: string,
  excludeId?: number
): Promise<boolean> {
  const conditions = excludeId
    ? and(eq(sessions.keyword, keyword), ne(sessions.id, excludeId))
    : eq(sessions.keyword, keyword);

  const result = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(conditions)
    .limit(1);

  return result.length === 0;
}

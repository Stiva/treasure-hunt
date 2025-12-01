import { eq, and, asc, ne } from "drizzle-orm";
import { db, locations, type Location, type NewLocation } from "../index";

export async function getLocationsBySessionId(
  sessionId: number
): Promise<Location[]> {
  return db
    .select()
    .from(locations)
    .where(eq(locations.sessionId, sessionId))
    .orderBy(asc(locations.orderIndex));
}

export async function getLocationById(
  id: number
): Promise<Location | undefined> {
  const result = await db
    .select()
    .from(locations)
    .where(eq(locations.id, id))
    .limit(1);
  return result[0];
}

export async function getLocationByCode(
  sessionId: number,
  code: string
): Promise<Location | undefined> {
  const result = await db
    .select()
    .from(locations)
    .where(and(eq(locations.sessionId, sessionId), eq(locations.code, code)))
    .limit(1);
  return result[0];
}

export async function getStartLocation(
  sessionId: number
): Promise<Location | undefined> {
  const result = await db
    .select()
    .from(locations)
    .where(and(eq(locations.sessionId, sessionId), eq(locations.isStart, true)))
    .limit(1);
  return result[0];
}

export async function getEndLocation(
  sessionId: number
): Promise<Location | undefined> {
  const result = await db
    .select()
    .from(locations)
    .where(and(eq(locations.sessionId, sessionId), eq(locations.isEnd, true)))
    .limit(1);
  return result[0];
}

export async function getIntermediateLocations(
  sessionId: number
): Promise<Location[]> {
  return db
    .select()
    .from(locations)
    .where(
      and(
        eq(locations.sessionId, sessionId),
        eq(locations.isStart, false),
        eq(locations.isEnd, false)
      )
    )
    .orderBy(asc(locations.orderIndex));
}

export async function createLocation(data: NewLocation): Promise<Location> {
  const result = await db.insert(locations).values(data).returning();
  return result[0];
}

export async function updateLocation(
  id: number,
  data: Partial<NewLocation>
): Promise<Location | undefined> {
  const result = await db
    .update(locations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(locations.id, id))
    .returning();
  return result[0];
}

export async function deleteLocation(id: number): Promise<boolean> {
  await db.delete(locations).where(eq(locations.id, id));
  return true;
}

export async function isLocationCodeUnique(
  sessionId: number,
  code: string,
  excludeId?: number
): Promise<boolean> {
  const conditions = excludeId
    ? and(
        eq(locations.sessionId, sessionId),
        eq(locations.code, code),
        ne(locations.id, excludeId)
      )
    : and(eq(locations.sessionId, sessionId), eq(locations.code, code));

  const result = await db
    .select({ id: locations.id })
    .from(locations)
    .where(conditions)
    .limit(1);

  return result.length === 0;
}

export async function setStartLocation(
  sessionId: number,
  locationId: number
): Promise<void> {
  // Remove start flag from all locations in session
  await db
    .update(locations)
    .set({ isStart: false, updatedAt: new Date() })
    .where(eq(locations.sessionId, sessionId));

  // Set start flag for the specified location
  await db
    .update(locations)
    .set({ isStart: true, updatedAt: new Date() })
    .where(eq(locations.id, locationId));
}

export async function setEndLocation(
  sessionId: number,
  locationId: number
): Promise<void> {
  // Remove end flag from all locations in session
  await db
    .update(locations)
    .set({ isEnd: false, updatedAt: new Date() })
    .where(eq(locations.sessionId, sessionId));

  // Set end flag for the specified location
  await db
    .update(locations)
    .set({ isEnd: true, updatedAt: new Date() })
    .where(eq(locations.id, locationId));
}

export async function updateLocationOrder(
  id: number,
  orderIndex: number
): Promise<void> {
  await db
    .update(locations)
    .set({ orderIndex, updatedAt: new Date() })
    .where(eq(locations.id, id));
}

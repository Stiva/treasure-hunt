import { eq, and, asc } from "drizzle-orm";
import {
  db,
  teamPaths,
  locations,
  teams,
  type TeamPath,
  type NewTeamPath,
  type Location,
  type Team,
} from "../index";

export interface TeamPathWithLocation extends TeamPath {
  location: Location;
}

// ============================================
// TEAM PATHS
// ============================================

export async function getTeamPath(
  teamId: number
): Promise<TeamPathWithLocation[]> {
  const paths = await db
    .select()
    .from(teamPaths)
    .where(eq(teamPaths.teamId, teamId))
    .orderBy(asc(teamPaths.stageOrder));

  const pathsWithLocations: TeamPathWithLocation[] = [];

  for (const path of paths) {
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.id, path.locationId))
      .limit(1);

    if (location) {
      pathsWithLocations.push({
        ...path,
        location,
      });
    }
  }

  return pathsWithLocations;
}

export async function getTeamCurrentLocation(
  teamId: number
): Promise<Location | undefined> {
  const team = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  if (!team[0]) return undefined;

  const currentStage = team[0].currentStage;

  const [path] = await db
    .select()
    .from(teamPaths)
    .where(
      and(eq(teamPaths.teamId, teamId), eq(teamPaths.stageOrder, currentStage))
    )
    .limit(1);

  if (!path) return undefined;

  const [location] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, path.locationId))
    .limit(1);

  return location;
}

export async function getTeamNextLocation(
  teamId: number
): Promise<Location | undefined> {
  const team = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  if (!team[0]) return undefined;

  const nextStage = team[0].currentStage + 1;

  const [path] = await db
    .select()
    .from(teamPaths)
    .where(
      and(eq(teamPaths.teamId, teamId), eq(teamPaths.stageOrder, nextStage))
    )
    .limit(1);

  if (!path) return undefined;

  const [location] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, path.locationId))
    .limit(1);

  return location;
}

export async function getTeamPathLength(teamId: number): Promise<number> {
  const paths = await db
    .select({ id: teamPaths.id })
    .from(teamPaths)
    .where(eq(teamPaths.teamId, teamId));
  return paths.length;
}

export async function createTeamPath(data: NewTeamPath): Promise<TeamPath> {
  const result = await db.insert(teamPaths).values(data).returning();
  return result[0];
}

export async function createManyTeamPaths(
  dataArray: NewTeamPath[]
): Promise<TeamPath[]> {
  if (dataArray.length === 0) return [];
  const result = await db.insert(teamPaths).values(dataArray).returning();
  return result;
}

export async function deleteTeamPaths(teamId: number): Promise<void> {
  await db.delete(teamPaths).where(eq(teamPaths.teamId, teamId));
}

export async function deleteAllPathsBySessionId(
  sessionId: number
): Promise<void> {
  // Get all teams in the session
  const sessionTeams = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.sessionId, sessionId));

  // Delete paths for each team
  for (const team of sessionTeams) {
    await deleteTeamPaths(team.id);
  }
}

export async function hasTeamPaths(teamId: number): Promise<boolean> {
  const paths = await db
    .select({ id: teamPaths.id })
    .from(teamPaths)
    .where(eq(teamPaths.teamId, teamId))
    .limit(1);
  return paths.length > 0;
}

// ============================================
// GAME PROGRESS
// ============================================

export async function advanceTeamToNextStage(
  teamId: number
): Promise<Team | undefined> {
  const team = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  if (!team[0]) return undefined;

  const pathLength = await getTeamPathLength(teamId);
  const newStage = team[0].currentStage + 1;

  // Check if this is the final stage
  const isCompleted = newStage >= pathLength - 1;

  const updateData: Partial<Team> = {
    currentStage: newStage,
    hintsUsedCurrentStage: 0,
    lastHintRequestedAt: null,
  };

  if (isCompleted) {
    updateData.finishedAt = new Date();
  }

  const result = await db
    .update(teams)
    .set(updateData)
    .where(eq(teams.id, teamId))
    .returning();

  return result[0];
}

export async function isCorrectCode(
  teamId: number,
  code: string
): Promise<boolean> {
  const nextLocation = await getTeamNextLocation(teamId);
  if (!nextLocation) return false;

  return nextLocation.code.toLowerCase() === code.toLowerCase();
}

export async function getTeamGameState(teamId: number): Promise<{
  team: Team;
  currentLocation: Location | null;
  nextLocation: Location | null;
  totalStages: number;
  isCompleted: boolean;
} | null> {
  const teamResult = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  if (!teamResult[0]) return null;

  const team = teamResult[0];
  const totalStages = await getTeamPathLength(teamId);
  const currentLocation = await getTeamCurrentLocation(teamId);
  const nextLocation = await getTeamNextLocation(teamId);

  return {
    team,
    currentLocation: currentLocation || null,
    nextLocation: nextLocation || null,
    totalStages,
    isCompleted: team.finishedAt !== null,
  };
}

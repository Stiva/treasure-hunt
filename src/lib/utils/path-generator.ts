import type { Location } from "@/lib/db/schema";

/**
 * Fisher-Yates shuffle algorithm for array randomization
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a unique permutation index using Lehmer code
 * This ensures each permutation is deterministically different
 */
function getLehmerPermutation<T>(array: T[], index: number): T[] {
  const n = array.length;
  if (n === 0) return [];

  const result: T[] = [];
  const available = [...array];

  let remaining = index;

  for (let i = n - 1; i >= 0; i--) {
    const factorial = factorialTable[i] || 1;
    const elementIndex = Math.floor(remaining / factorial) % available.length;
    remaining = remaining % factorial;

    result.push(available[elementIndex]);
    available.splice(elementIndex, 1);
  }

  return result;
}

// Pre-computed factorials for efficiency (up to 20!)
const factorialTable: number[] = [1];
for (let i = 1; i <= 20; i++) {
  factorialTable[i] = factorialTable[i - 1] * i;
}

function factorial(n: number): number {
  if (n < 0) return 1;
  if (n <= 20) return factorialTable[n];
  // For larger numbers, compute on the fly
  let result = factorialTable[20];
  for (let i = 21; i <= n; i++) {
    result *= i;
  }
  return result;
}

export interface GeneratedPath {
  teamId: number;
  locations: Location[];
  pathSignature: string; // For uniqueness validation
}

/**
 * Generate unique paths for all teams
 *
 * Rules:
 * - All paths start with the start location
 * - All paths end with the end location
 * - Intermediate locations are shuffled uniquely for each team
 * - No two teams should have the same path (if possible)
 *
 * @param startLocation - The common starting location
 * @param endLocation - The common ending location
 * @param intermediateLocations - Locations to be shuffled
 * @param teamIds - IDs of teams to generate paths for
 * @returns Array of generated paths
 */
export function generateUniquePaths(
  startLocation: Location,
  endLocation: Location,
  intermediateLocations: Location[],
  teamIds: number[]
): GeneratedPath[] {
  const numTeams = teamIds.length;
  const numIntermediates = intermediateLocations.length;

  // Calculate maximum possible unique permutations
  const maxPermutations = factorial(numIntermediates);

  // If we have more teams than possible permutations, we'll have duplicates
  // This is acceptable but we try to minimize it

  const paths: GeneratedPath[] = [];
  const usedSignatures = new Set<string>();

  if (numIntermediates === 0) {
    // No intermediate locations - all paths are the same
    for (const teamId of teamIds) {
      const locations = [startLocation, endLocation];
      paths.push({
        teamId,
        locations,
        pathSignature: locations.map((l) => l.id).join("-"),
      });
    }
    return paths;
  }

  // Use different strategies based on team count vs permutation count
  if (numTeams <= maxPermutations) {
    // We can guarantee unique paths
    // Use Lehmer code to generate deterministic permutations
    const usedIndices = new Set<number>();

    for (const teamId of teamIds) {
      let permIndex: number = Math.floor(Math.random() * maxPermutations);
      let intermediateOrder: Location[];
      let signature: string;
      let attempts = 0;
      const maxAttempts = Math.min(maxPermutations * 2, 10000);

      do {
        // Start with random index, then increment if collision
        if (attempts > 0) {
          permIndex = (permIndex + 1) % maxPermutations;
        }

        if (!usedIndices.has(permIndex)) {
          intermediateOrder = getLehmerPermutation(
            intermediateLocations,
            permIndex
          );
          signature = intermediateOrder.map((l) => l.id).join("-");

          if (!usedSignatures.has(signature)) {
            usedIndices.add(permIndex);
            usedSignatures.add(signature);
            break;
          }
        }

        attempts++;
      } while (attempts < maxAttempts);

      // Build full path
      const locations = [startLocation, ...intermediateOrder!, endLocation];
      paths.push({
        teamId,
        locations,
        pathSignature: locations.map((l) => l.id).join("-"),
      });
    }
  } else {
    // More teams than permutations - just shuffle randomly
    // Some paths will be duplicated
    for (const teamId of teamIds) {
      const intermediateOrder = shuffleArray(intermediateLocations);
      const locations = [startLocation, ...intermediateOrder, endLocation];

      paths.push({
        teamId,
        locations,
        pathSignature: locations.map((l) => l.id).join("-"),
      });
    }
  }

  return paths;
}

/**
 * Validate that the locations are properly configured for path generation
 */
export function validateLocationsForPathGeneration(
  locations: Location[]
): {
  isValid: boolean;
  error?: string;
  startLocation?: Location;
  endLocation?: Location;
  intermediateLocations?: Location[];
} {
  const startLocation = locations.find((l) => l.isStart);
  const endLocation = locations.find((l) => l.isEnd);
  const intermediateLocations = locations.filter((l) => !l.isStart && !l.isEnd);

  if (!startLocation) {
    return {
      isValid: false,
      error: "Nessuna tappa di partenza configurata",
    };
  }

  if (!endLocation) {
    return {
      isValid: false,
      error: "Nessuna tappa finale configurata",
    };
  }

  if (startLocation.id === endLocation.id) {
    return {
      isValid: false,
      error: "La tappa di partenza e quella finale devono essere diverse",
    };
  }

  return {
    isValid: true,
    startLocation,
    endLocation,
    intermediateLocations,
  };
}

/**
 * Check if paths can be unique for all teams
 */
export function canGenerateUniquePaths(
  intermediateLocationsCount: number,
  teamsCount: number
): { canBeUnique: boolean; maxUniquePaths: number } {
  const maxUniquePaths = factorial(intermediateLocationsCount);
  return {
    canBeUnique: teamsCount <= maxUniquePaths,
    maxUniquePaths,
  };
}

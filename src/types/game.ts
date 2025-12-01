import type { LocationWithLocalizedContent } from "./database";

// Game state types
export interface GameState {
  teamId: number;
  teamName: string;
  currentStage: number;
  totalStages: number;
  currentLocation: LocationWithLocalizedContent | null;
  nextLocation: LocationWithLocalizedContent | null;
  hintsUsed: number;
  hintsAvailable: number;
  canRequestHint: boolean;
  hintCooldownSeconds: number | null;
  isCompleted: boolean;
  startedAt: Date | null;
  finishedAt: Date | null;
}

export interface HintState {
  hintsUsed: number;
  maxHints: number;
  canRequestHint: boolean;
  cooldownSeconds: number | null;
  hints: string[];
}

export interface StageProgress {
  stageNumber: number;
  locationCode: string;
  locationName: string;
  unlockedAt: Date | null;
  hintsRequested: number;
  isComplete: boolean;
  isCurrent: boolean;
}

// Path generation types
export interface PathGenerationInput {
  sessionId: number;
  teamIds: number[];
  startLocationId: number;
  endLocationId: number;
  intermediateLocationIds: number[];
}

export interface GeneratedPath {
  teamId: number;
  path: number[]; // Array of location IDs in order
}

// Player actions
export interface SubmitCodeRequest {
  code: string;
}

export interface SubmitCodeResponse {
  success: boolean;
  correct: boolean;
  message: string;
  nextStage?: {
    stageNumber: number;
    location: LocationWithLocalizedContent;
  };
  isCompleted?: boolean;
}

export interface RequestHintResponse {
  success: boolean;
  hint?: string;
  hintNumber?: number;
  hintsRemaining: number;
  canRequestMore: boolean;
  nextHintAvailableAt?: Date;
  message?: string;
}

// Monitoring types for admin
export interface TeamMonitorData {
  teamId: number;
  teamName: string;
  players: {
    firstName: string;
    lastName: string;
    email: string;
  }[];
  currentStage: number;
  totalStages: number;
  currentLocationName: string;
  currentLocationCode: string;
  hintsUsedCurrentStage: number;
  timeAtCurrentStage: number; // minutes
  isCompleted: boolean;
  startedAt: Date | null;
  finishedAt: Date | null;
}

export interface SessionMonitorData {
  sessionId: number;
  sessionName: string;
  gameMode: "solo" | "couples";
  totalTeams: number;
  teamsStarted: number;
  teamsCompleted: number;
  teams: TeamMonitorData[];
}

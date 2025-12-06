// Types inferred from database schema

// Help content structure for customizable help pages
export interface HelpContent {
  rules: string[];
  steps: string[];
  tips: string[];
}

export interface Session {
  id: number;
  name: string;
  keyword: string;
  teamSize: number;
  isActive: boolean;
  adminDisplayName: string | null;
  victoryMessageIt: string | null;
  victoryMessageEn: string | null;
  helpContentIt: HelpContent | null;
  helpContentEn: HelpContent | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: number;
  sessionId: number;
  code: string;
  nameIt: string;
  nameEn: string;
  riddleIt: string | null;
  riddleEn: string | null;
  hint1It: string | null;
  hint1En: string | null;
  hint2It: string | null;
  hint2En: string | null;
  hint3It: string | null;
  hint3En: string | null;
  isStart: boolean;
  isEnd: boolean;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: number;
  sessionId: number;
  name: string;
  currentStage: number;
  hintsUsedCurrentStage: number;
  lastHintRequestedAt: Date | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
}

export interface Player {
  id: number;
  sessionId: number;
  teamId: number | null;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}

export interface TeamPath {
  id: number;
  teamId: number;
  locationId: number;
  stageOrder: number;
  createdAt: Date;
}

export interface PlayerSession {
  id: number;
  playerId: number;
  sessionToken: string;
  expiresAt: Date;
  createdAt: Date;
}

// Extended types with relations
export interface TeamWithPlayers extends Team {
  players: Player[];
}

export interface TeamWithPath extends Team {
  paths: TeamPath[];
  players: Player[];
}

export interface SessionWithLocations extends Session {
  locations: Location[];
}

export interface SessionWithTeams extends Session {
  teams: TeamWithPlayers[];
}

export interface LocationWithLocalizedContent {
  id: number;
  code: string;
  name: string;
  riddle: string | null;
  hint1: string | null;
  hint2: string | null;
  hint3: string | null;
  isStart: boolean;
  isEnd: boolean;
}

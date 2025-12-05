// API Request/Response types

// Generic API response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Session API
export interface CreateSessionRequest {
  name: string;
  keyword: string;
  teamSize: number;
  adminDisplayName?: string;
  victoryMessageIt?: string;
  victoryMessageEn?: string;
}

export interface UpdateSessionRequest {
  name?: string;
  keyword?: string;
  teamSize?: number;
  adminDisplayName?: string | null;
  victoryMessageIt?: string;
  victoryMessageEn?: string;
}

// Location API
export interface CreateLocationRequest {
  code: string;
  nameIt: string;
  nameEn: string;
  riddleIt?: string;
  riddleEn?: string;
  hint1It?: string;
  hint1En?: string;
  hint2It?: string;
  hint2En?: string;
  hint3It?: string;
  hint3En?: string;
  isStart?: boolean;
  isEnd?: boolean;
  orderIndex?: number;
}

export interface UpdateLocationRequest extends Partial<CreateLocationRequest> {}

// Player API
export interface CreatePlayerRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface UpdatePlayerRequest extends Partial<CreatePlayerRequest> {
  teamId?: number | null;
}

export interface ImportPlayersRequest {
  players: CreatePlayerRequest[];
}

export interface ImportPlayersResponse {
  imported: number;
  skipped: number;
  errors: string[];
}

// Team API
export interface CreateTeamRequest {
  name: string;
  playerIds?: number[];
}

export interface UpdateTeamRequest {
  name?: string;
}

export interface AssignPlayersRequest {
  playerIds: number[];
}

export interface GenerateCouplesRequest {
  method: "random" | "alphabetical";
}

export interface GenerateCouplesResponse {
  teamsCreated: number;
  unassignedPlayers: number;
}

// Path generation API
export interface GeneratePathsResponse {
  pathsGenerated: number;
  teams: {
    teamId: number;
    teamName: string;
    pathLength: number;
  }[];
}

// Player auth API
export interface PlayerLoginRequest {
  email: string;
  keyword: string;
}

export interface PlayerLoginResponse {
  success: boolean;
  player?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  team?: {
    id: number;
    name: string;
  };
  error?: string;
}

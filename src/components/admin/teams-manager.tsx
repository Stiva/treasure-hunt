"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import {
  Loader2,
  Plus,
  Trash2,
  Shuffle,
  SortAsc,
  UsersRound,
  User,
  UserMinus,
} from "lucide-react";
import type { Session, Player } from "@/lib/db/schema";
import type { TeamWithPlayers } from "@/lib/db/queries/teams";
import { TeamPathDisplay } from "./team-path-display";

interface TeamsManagerProps {
  session: Session;
  teams: TeamWithPlayers[];
  unassignedPlayers: Player[];
  locale: string;
}

export function TeamsManager({
  session,
  teams,
  unassignedPlayers,
  locale,
}: TeamsManagerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showGenerateOptions, setShowGenerateOptions] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    setIsLoading("create");
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/sessions/${session.id}/teams`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newTeamName.trim() }),
        }
      );
      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Errore durante la creazione");
        return;
      }

      setNewTeamName("");
      router.refresh();
    } catch (err) {
      setError("Errore di connessione");
    } finally {
      setIsLoading(null);
    }
  };

  const handleGenerateTeams = async (method: "random" | "alphabetical") => {
    setIsLoading(`generate-${method}`);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/sessions/${session.id}/teams/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method }),
        }
      );
      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Errore durante la generazione");
        return;
      }

      setShowGenerateOptions(false);
      router.refresh();
    } catch (err) {
      setError("Errore di connessione");
    } finally {
      setIsLoading(null);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    setIsLoading(`delete-${teamId}`);
    try {
      const response = await fetch(
        `/api/admin/sessions/${session.id}/teams/${teamId}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (data.success) {
        router.refresh();
      }
    } catch (err) {
      console.error("Error deleting team:", err);
    } finally {
      setIsLoading(null);
      setDeleteConfirm(null);
    }
  };

  const handleAssignPlayer = async (teamId: number, playerId: number) => {
    setIsLoading(`assign-${playerId}`);
    try {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return;

      const currentPlayerIds = team.players.map((p) => p.id);
      const response = await fetch(
        `/api/admin/sessions/${session.id}/teams/${teamId}/players`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerIds: [...currentPlayerIds, playerId],
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        router.refresh();
      }
    } catch (err) {
      console.error("Error assigning player:", err);
    } finally {
      setIsLoading(null);
    }
  };

  const handleRemovePlayer = async (teamId: number, playerId: number) => {
    setIsLoading(`remove-${playerId}`);
    try {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return;

      const currentPlayerIds = team.players
        .filter((p) => p.id !== playerId)
        .map((p) => p.id);

      const response = await fetch(
        `/api/admin/sessions/${session.id}/teams/${teamId}/players`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerIds: currentPlayerIds }),
        }
      );
      const data = await response.json();
      if (data.success) {
        router.refresh();
      }
    } catch (err) {
      console.error("Error removing player:", err);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Create Team */}
        <Card variant="frost" className="flex-1">
          <CardContent className="py-4">
            <h4 className="font-medium text-frost-200 mb-3">
              Crea Squadra Manualmente
            </h4>
            <div className="flex gap-2">
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Nome squadra..."
                onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
              />
              <Button
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim() || isLoading !== null}
                variant="sand"
              >
                {isLoading === "create" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generate Teams */}
        {unassignedPlayers.length > 0 && (
          <Card variant="frost" className="flex-1">
            <CardContent className="py-4">
              <h4 className="font-medium text-frost-200 mb-3">
                Genera Squadre Automaticamente
              </h4>
              {showGenerateOptions ? (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleGenerateTeams("random")}
                    disabled={isLoading !== null}
                    variant="default"
                    className="flex-1"
                  >
                    {isLoading === "generate-random" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Shuffle className="h-4 w-4 mr-2" />
                    )}
                    Random
                  </Button>
                  <Button
                    onClick={() => handleGenerateTeams("alphabetical")}
                    disabled={isLoading !== null}
                    variant="default"
                    className="flex-1"
                  >
                    {isLoading === "generate-alphabetical" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <SortAsc className="h-4 w-4 mr-2" />
                    )}
                    Alfabetico
                  </Button>
                  <Button
                    onClick={() => setShowGenerateOptions(false)}
                    variant="ghost"
                  >
                    Annulla
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowGenerateOptions(true)}
                  variant="sand"
                  className="w-full"
                >
                  <UsersRound className="h-4 w-4 mr-2" />
                  Genera da {unassignedPlayers.length} giocatori
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Unassigned Players */}
      {unassignedPlayers.length > 0 && (
        <Card variant="frost">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-sand-400" />
              Giocatori Non Assegnati ({unassignedPlayers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {unassignedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-night-800 border border-night-700 text-frost-300 text-sm"
                >
                  <span>
                    {player.firstName} {player.lastName}
                  </span>
                  {teams.length > 0 && (
                    <select
                      className="bg-night-900 border border-night-700 rounded px-2 py-0.5 text-xs text-frost-400 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignPlayer(parseInt(e.target.value), player.id);
                        }
                      }}
                      disabled={isLoading !== null}
                      defaultValue=""
                    >
                      <option value="">Assegna a...</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams List */}
      {teams.length === 0 ? (
        <Card variant="frost">
          <CardContent className="py-12 text-center">
            <UsersRound className="h-12 w-12 mx-auto text-frost-600 mb-4" />
            <h3 className="text-lg font-medium text-frost-200 mb-2">
              Nessuna squadra creata
            </h3>
            <p className="text-frost-400">
              Crea le squadre manualmente o genera automaticamente dalle liste
              giocatori
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Card key={team.id} variant="frost">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  {deleteConfirm === team.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(null)}
                        disabled={isLoading !== null}
                      >
                        No
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTeam(team.id)}
                        disabled={isLoading !== null}
                        className="text-red-400 hover:text-red-300"
                      >
                        {isLoading === `delete-${team.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Sì"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(team.id)}
                      className="text-frost-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {team.players.length === 0 ? (
                  <p className="text-frost-500 text-sm">Nessun giocatore</p>
                ) : (
                  <ul className="space-y-2">
                    {team.players.map((player) => (
                      <li
                        key={player.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-frost-300">
                          {player.firstName} {player.lastName}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePlayer(team.id, player.id)}
                          disabled={isLoading !== null}
                          className="text-frost-500 hover:text-red-400 h-6 w-6 p-0"
                        >
                          {isLoading === `remove-${player.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <UserMinus className="h-3 w-3" />
                          )}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 pt-3 border-t border-night-700">
                  <p className="text-xs text-frost-500">
                    {team.players.length} / {session.teamSize} giocatori
                  </p>
                </div>
                {/* Team Path Display */}
                <TeamPathDisplay teamId={team.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

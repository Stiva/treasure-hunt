"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Loader2, Trash2, UserMinus } from "lucide-react";
import type { Player, Team } from "@/lib/db/schema";

interface PlayersTableProps {
  players: Player[];
  teams: Array<Team & { players: Player[] }>;
  sessionId: number;
  locale: string;
}

export function PlayersTable({
  players,
  teams,
  sessionId,
  locale,
}: PlayersTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleDelete = async (playerId: number) => {
    setDeletingId(playerId);
    try {
      const response = await fetch(
        `/api/admin/sessions/${sessionId}/players/${playerId}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (data.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting player:", error);
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const getTeamName = (teamId: number | null): string | null => {
    if (!teamId) return null;
    const team = teams.find((t) => t.id === teamId);
    return team?.name || null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-frost-400 text-sm border-b border-night-700">
            <th className="pb-3 font-medium">Nome</th>
            <th className="pb-3 font-medium">Cognome</th>
            <th className="pb-3 font-medium">Email</th>
            <th className="pb-3 font-medium">Squadra</th>
            <th className="pb-3 font-medium w-20"></th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr
              key={player.id}
              className="border-b border-night-800 hover:bg-night-900/50 transition-colors"
            >
              <td className="py-3 text-frost-200">{player.firstName}</td>
              <td className="py-3 text-frost-200">{player.lastName}</td>
              <td className="py-3 text-frost-400 text-sm">{player.email}</td>
              <td className="py-3">
                {player.teamId ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-frost-600/20 text-frost-300 border border-frost-600/30">
                    {getTeamName(player.teamId)}
                  </span>
                ) : (
                  <span className="text-frost-600 text-sm">Non assegnato</span>
                )}
              </td>
              <td className="py-3">
                {confirmDelete === player.id ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete(null)}
                      disabled={deletingId === player.id}
                    >
                      No
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(player.id)}
                      disabled={deletingId === player.id}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      {deletingId === player.id ? (
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
                    onClick={() => setConfirmDelete(player.id)}
                    disabled={deletingId !== null}
                    className="text-frost-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

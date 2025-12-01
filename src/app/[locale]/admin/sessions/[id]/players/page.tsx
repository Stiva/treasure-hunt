import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getSessionById,
  getPlayersBySessionId,
  getTeamsBySessionId,
} from "@/lib/db/queries";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "@/components/ui";
import { PlayersTable } from "@/components/admin/players-table";
import { ImportPlayersForm } from "@/components/admin/import-players-form";
import {
  ArrowLeft,
  Users,
  UserPlus,
  UsersRound,
  Download,
} from "lucide-react";

interface PlayersPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function PlayersPage({ params }: PlayersPageProps) {
  const { locale, id } = await params;
  const sessionId = parseInt(id);

  if (isNaN(sessionId)) {
    notFound();
  }

  const [session, players, teams] = await Promise.all([
    getSessionById(sessionId),
    getPlayersBySessionId(sessionId),
    getTeamsBySessionId(sessionId),
  ]);

  if (!session) {
    notFound();
  }

  const t = await getTranslations("admin");

  const assignedPlayers = players.filter((p) => p.teamId !== null);
  const unassignedPlayers = players.filter((p) => p.teamId === null);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href={`/admin/sessions/${session.id}`}
        className="inline-flex items-center gap-2 text-frost-400 hover:text-frost-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna alla sessione
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-frost-100">{t("players")}</h1>
          <p className="text-frost-400">
            Gestisci i giocatori della sessione "{session.name}"
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="frost">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-frost-400" />
              <div>
                <p className="text-2xl font-bold text-frost-100">{players.length}</p>
                <p className="text-sm text-frost-400">Totale Giocatori</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="frost">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <UsersRound className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-frost-100">{assignedPlayers.length}</p>
                <p className="text-sm text-frost-400">Assegnati a Squadre</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="frost">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-sand-400" />
              <div>
                <p className="text-2xl font-bold text-frost-100">{unassignedPlayers.length}</p>
                <p className="text-sm text-frost-400">Da Assegnare</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Section */}
      <Card variant="frost">
        <CardHeader>
          <CardTitle>{t("importPlayers")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ImportPlayersForm sessionId={sessionId} locale={locale} />
        </CardContent>
      </Card>

      {/* Players List */}
      <Card variant="frost">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Elenco Giocatori ({players.length})</CardTitle>
          {players.length > 0 && (
            <a
              href={`/api/admin/sessions/${sessionId}/players/export`}
              className="text-frost-400 hover:text-frost-300 text-sm flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Esporta CSV
            </a>
          )}
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="h-12 w-12 mx-auto text-frost-600 mb-4" />
              <h3 className="text-lg font-medium text-frost-200 mb-2">
                Nessun giocatore
              </h3>
              <p className="text-frost-400">
                Importa i giocatori da un file CSV o Excel
              </p>
            </div>
          ) : (
            <PlayersTable
              players={players}
              teams={teams}
              sessionId={sessionId}
              locale={locale}
            />
          )}
        </CardContent>
      </Card>

      {/* Template Download */}
      <div className="p-4 rounded-lg bg-frost-600/10 border border-frost-600/20">
        <h4 className="font-medium text-frost-200 mb-2">Formato File</h4>
        <p className="text-sm text-frost-400 mb-3">
          Prepara un file CSV o Excel con le seguenti colonne:
        </p>
        <div className="overflow-x-auto">
          <table className="text-sm border-collapse">
            <thead>
              <tr className="text-frost-300">
                <th className="border border-night-700 px-3 py-1 bg-night-800">Nome</th>
                <th className="border border-night-700 px-3 py-1 bg-night-800">Cognome</th>
                <th className="border border-night-700 px-3 py-1 bg-night-800">Email</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-frost-400">
                <td className="border border-night-700 px-3 py-1">Mario</td>
                <td className="border border-night-700 px-3 py-1">Rossi</td>
                <td className="border border-night-700 px-3 py-1">mario.rossi@email.com</td>
              </tr>
              <tr className="text-frost-400">
                <td className="border border-night-700 px-3 py-1">Anna</td>
                <td className="border border-night-700 px-3 py-1">Verdi</td>
                <td className="border border-night-700 px-3 py-1">anna.verdi@email.com</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

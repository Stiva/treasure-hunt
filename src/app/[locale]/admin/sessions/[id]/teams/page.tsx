import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getSessionById,
  getTeamsBySessionId,
  getPlayersBySessionId,
  getUnassignedPlayers,
} from "@/lib/db/queries";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { TeamsManager } from "@/components/admin/teams-manager";
import {
  ArrowLeft,
  UsersRound,
  Users,
  UserPlus,
} from "lucide-react";

interface TeamsPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function TeamsPage({ params }: TeamsPageProps) {
  const { locale, id } = await params;
  const sessionId = parseInt(id);

  if (isNaN(sessionId)) {
    notFound();
  }

  const [session, teams, players, unassignedPlayers] = await Promise.all([
    getSessionById(sessionId),
    getTeamsBySessionId(sessionId),
    getPlayersBySessionId(sessionId),
    getUnassignedPlayers(sessionId),
  ]);

  if (!session) {
    notFound();
  }

  const t = await getTranslations("admin");

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
          <h1 className="text-2xl font-bold text-frost-100">{t("teams")}</h1>
          <p className="text-frost-400">
            Gestisci le squadre della sessione "{session.name}"
            {session.gameMode === "couples" && " (Modalità Coppie)"}
            {session.gameMode === "solo" && " (Modalità Solitario)"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="frost">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <UsersRound className="h-5 w-5 text-frost-400" />
              <div>
                <p className="text-2xl font-bold text-frost-100">{teams.length}</p>
                <p className="text-sm text-frost-400">Squadre Create</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="frost">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-frost-100">
                  {players.length - unassignedPlayers.length}
                </p>
                <p className="text-sm text-frost-400">Giocatori Assegnati</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="frost">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-sand-400" />
              <div>
                <p className="text-2xl font-bold text-frost-100">
                  {unassignedPlayers.length}
                </p>
                <p className="text-sm text-frost-400">Da Assegnare</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Manager */}
      <TeamsManager
        session={session}
        teams={teams}
        unassignedPlayers={unassignedPlayers}
        locale={locale}
      />

      {/* Help Text */}
      <div className="p-4 rounded-lg bg-frost-600/10 border border-frost-600/20">
        <h4 className="font-medium text-frost-200 mb-2">
          {session.gameMode === "couples" ? "Modalità Coppie" : "Modalità Solitario"}
        </h4>
        <p className="text-sm text-frost-400">
          {session.gameMode === "couples" ? (
            <>
              In modalità coppie, ogni squadra è composta da 2 giocatori che
              condividono lo stesso percorso e progresso. Entrambi i membri
              possono visualizzare e interagire con la sessione di gioco.
            </>
          ) : (
            <>
              In modalità solitario, ogni giocatore partecipa individualmente.
              Le squadre sono create automaticamente per ogni giocatore.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

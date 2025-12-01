import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getSessionById,
  getTeamsBySessionId,
  getTeamPath,
  getLocationsBySessionId,
} from "@/lib/db/queries";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { MonitorDashboard } from "@/components/admin/monitor-dashboard";
import {
  ArrowLeft,
  Activity,
  Users,
  Trophy,
  Clock,
} from "lucide-react";

interface MonitorPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function MonitorPage({ params }: MonitorPageProps) {
  const { locale, id } = await params;
  const sessionId = parseInt(id);

  if (isNaN(sessionId)) {
    notFound();
  }

  const [session, teams, locations] = await Promise.all([
    getSessionById(sessionId),
    getTeamsBySessionId(sessionId),
    getLocationsBySessionId(sessionId),
  ]);

  if (!session) {
    notFound();
  }

  const t = await getTranslations("admin");

  // Get paths for each team
  const teamsWithProgress = await Promise.all(
    teams.map(async (team) => {
      const path = await getTeamPath(team.id);
      return {
        ...team,
        path,
        totalStages: path.length,
      };
    })
  );

  const startedTeams = teamsWithProgress.filter((t) => t.startedAt);
  const completedTeams = teamsWithProgress.filter((t) => t.finishedAt);
  const inProgressTeams = startedTeams.filter((t) => !t.finishedAt);

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
          <h1 className="text-2xl font-bold text-frost-100 flex items-center gap-2">
            <Activity className="h-6 w-6 text-green-400" />
            {t("monitor")}
          </h1>
          <p className="text-frost-400">
            Monitoraggio in tempo reale - "{session.name}"
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            session.isActive
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-pitch-800 text-frost-500 border border-night-700"
          }`}
        >
          {session.isActive ? "Sessione Attiva" : "Sessione Non Attiva"}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="frost">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-frost-400" />
              <div>
                <p className="text-2xl font-bold text-frost-100">{teams.length}</p>
                <p className="text-sm text-frost-400">Squadre Totali</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="frost">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-sand-400" />
              <div>
                <p className="text-2xl font-bold text-frost-100">
                  {startedTeams.length}
                </p>
                <p className="text-sm text-frost-400">Iniziate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="frost">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-frost-100">
                  {inProgressTeams.length}
                </p>
                <p className="text-sm text-frost-400">In Gioco</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="frost">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-sand-400" />
              <div>
                <p className="text-2xl font-bold text-frost-100">
                  {completedTeams.length}
                </p>
                <p className="text-sm text-frost-400">Completate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monitor Dashboard */}
      <MonitorDashboard
        teams={teamsWithProgress}
        locations={locations}
        sessionId={sessionId}
        locale={locale}
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getSessionById,
  getLocationsBySessionId,
  getTeamsBySessionId,
  getPlayersBySessionId,
  hasTeamPaths,
} from "@/lib/db/queries";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "@/components/ui";
import { SessionActions } from "@/components/admin/session-actions";
import { PathGenerator } from "@/components/admin/path-generator";
import {
  ArrowLeft,
  MapPin,
  Users,
  UsersRound,
  Route,
  Activity,
  Settings,
  CheckCircle,
  XCircle,
  MessageCircle,
} from "lucide-react";

interface SessionDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function SessionDetailPage({
  params,
}: SessionDetailPageProps) {
  const { locale, id } = await params;
  const sessionId = parseInt(id);

  if (isNaN(sessionId)) {
    notFound();
  }

  const [session, locations, teams, players] = await Promise.all([
    getSessionById(sessionId),
    getLocationsBySessionId(sessionId),
    getTeamsBySessionId(sessionId),
    getPlayersBySessionId(sessionId),
  ]);

  if (!session) {
    notFound();
  }

  const t = await getTranslations("admin");

  const startLocation = locations.find((l) => l.isStart);
  const endLocation = locations.find((l) => l.isEnd);
  const intermediateLocations = locations.filter((l) => !l.isStart && !l.isEnd);

  // Check how many teams have paths generated
  const teamsWithPathsResults = await Promise.all(
    teams.map(async (team) => {
      const hasPaths = await hasTeamPaths(team.id);
      return hasPaths ? 1 : 0;
    })
  );
  const teamsWithPathsCount = teamsWithPathsResults.reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/sessions"
        className="inline-flex items-center gap-2 text-frost-400 hover:text-frost-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna alle sessioni
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-frost-100">{session.name}</h1>
            {session.isActive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                <CheckCircle className="h-3 w-3" />
                {t("active")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-pitch-800 text-frost-500 border border-night-700">
                <XCircle className="h-3 w-3" />
                {t("inactive")}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-frost-400">
            <span>
              Parola chiave:{" "}
              <code className="font-mono bg-night-900 px-2 py-0.5 rounded text-frost-300">
                {session.keyword}
              </code>
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {session.gameMode === "couples" ? t("couples") : t("solo")}
            </span>
          </div>
        </div>
        <SessionActions session={session} locale={locale} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<MapPin className="h-5 w-5" />}
          label={t("locations")}
          value={locations.length}
          href={`/admin/sessions/${session.id}/locations`}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label={t("players")}
          value={players.length}
          href={`/admin/sessions/${session.id}/players`}
        />
        <StatCard
          icon={<UsersRound className="h-5 w-5" />}
          label={t("teams")}
          value={teams.length}
          href={`/admin/sessions/${session.id}/teams`}
        />
        <StatCard
          icon={<Route className="h-5 w-5" />}
          label="Percorsi"
          value={teams.filter((t) => t.players.length > 0).length}
          href={`/admin/sessions/${session.id}/teams`}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link href={`/admin/sessions/${session.id}/locations`}>
          <Card variant="frost" className="hover:border-frost-600/50 transition-colors cursor-pointer h-full">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-frost-600/20">
                  <MapPin className="h-5 w-5 text-frost-400" />
                </div>
                <div>
                  <h3 className="font-medium text-frost-100">Gestisci Tappe</h3>
                  <p className="text-xs text-frost-500">
                    {locations.length === 0
                      ? "Aggiungi le tappe"
                      : `${locations.length} tappe configurate`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/admin/sessions/${session.id}/players`}>
          <Card variant="frost" className="hover:border-frost-600/50 transition-colors cursor-pointer h-full">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-frost-600/20">
                  <Users className="h-5 w-5 text-frost-400" />
                </div>
                <div>
                  <h3 className="font-medium text-frost-100">Gestisci Giocatori</h3>
                  <p className="text-xs text-frost-500">
                    {players.length === 0
                      ? "Importa i giocatori"
                      : `${players.length} giocatori`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/admin/sessions/${session.id}/teams`}>
          <Card variant="frost" className="hover:border-frost-600/50 transition-colors cursor-pointer h-full">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sand-500/20">
                  <UsersRound className="h-5 w-5 text-sand-400" />
                </div>
                <div>
                  <h3 className="font-medium text-frost-100">Gestisci Squadre</h3>
                  <p className="text-xs text-frost-500">
                    {teams.length === 0
                      ? "Crea le squadre"
                      : `${teams.length} squadre`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/admin/sessions/${session.id}/monitor`}>
          <Card variant="frost" className="hover:border-frost-600/50 transition-colors cursor-pointer h-full">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Activity className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-frost-100">Monitoraggio</h3>
                  <p className="text-xs text-frost-500">
                    Visualizza progresso in tempo reale
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/admin/sessions/${session.id}/support`}>
          <Card variant="frost" className="hover:border-frost-600/50 transition-colors cursor-pointer h-full">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-frost-600/20">
                  <MessageCircle className="h-5 w-5 text-frost-400" />
                </div>
                <div>
                  <h3 className="font-medium text-frost-100">Supporto</h3>
                  <p className="text-xs text-frost-500">
                    Messaggi dei giocatori
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Path Generator */}
      <PathGenerator
        sessionId={session.id}
        teamsCount={teams.length}
        locationsCount={locations.length}
        hasStart={!!startLocation}
        hasEnd={!!endLocation}
        teamsWithPaths={teamsWithPathsCount}
      />

      {/* Session Setup Checklist */}
      <Card variant="frost">
        <CardHeader>
          <CardTitle>Checklist Configurazione</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <ChecklistItem
              done={!!startLocation}
              label="Tappa di partenza configurata"
            />
            <ChecklistItem
              done={!!endLocation}
              label="Tappa finale configurata"
            />
            <ChecklistItem
              done={intermediateLocations.length > 0}
              label={`Tappe intermedie (${intermediateLocations.length})`}
            />
            <ChecklistItem
              done={players.length > 0}
              label={`Giocatori importati (${players.length})`}
            />
            <ChecklistItem
              done={teams.length > 0}
              label={`Squadre create (${teams.length})`}
            />
            <ChecklistItem
              done={teams.every((t) => t.players.length > 0)}
              label="Tutti i giocatori assegnati a squadre"
            />
            <ChecklistItem
              done={teamsWithPathsCount === teams.length && teams.length > 0}
              label={`Percorsi generati (${teamsWithPathsCount}/${teams.length})`}
            />
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card variant="frost" className="hover:border-frost-600/50 transition-colors cursor-pointer">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="text-frost-500">{icon}</div>
            <div>
              <p className="text-2xl font-bold text-frost-100">{value}</p>
              <p className="text-xs text-frost-500">{label}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3">
      {done ? (
        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
      ) : (
        <div className="h-5 w-5 rounded-full border-2 border-frost-600 flex-shrink-0" />
      )}
      <span className={done ? "text-frost-300" : "text-frost-500"}>{label}</span>
    </li>
  );
}

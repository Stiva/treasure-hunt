import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllSessions } from "@/lib/db/queries";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from "@/components/ui";
import {
  Plus,
  Settings,
  Users,
  MapPin,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default async function SessionsPage() {
  const t = await getTranslations("admin");
  const sessions = await getAllSessions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-frost-100">{t("sessions")}</h1>
          <p className="text-frost-400">
            Gestisci le sessioni di caccia al tesoro
          </p>
        </div>
        <Link href="/admin/sessions/new">
          <Button variant="sand">
            <Plus className="h-4 w-4 mr-2" />
            {t("newSession")}
          </Button>
        </Link>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card variant="frost">
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 mx-auto text-frost-500 mb-4" />
            <h3 className="text-lg font-medium text-frost-200 mb-2">
              Nessuna sessione
            </h3>
            <p className="text-frost-400 mb-4">
              Crea la tua prima sessione di caccia al tesoro
            </p>
            <Link href="/admin/sessions/new">
              <Button variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Crea Sessione
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id} variant="frost">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-frost-100">
                        {session.name}
                      </h3>
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
                      <span className="flex items-center gap-1">
                        <span className="font-mono bg-night-900 px-2 py-0.5 rounded">
                          {session.keyword}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {session.gameMode === "couples" ? t("couples") : t("solo")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/sessions/${session.id}`}>
                      <Button variant="secondary" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Gestisci
                      </Button>
                    </Link>
                    {session.isActive && (
                      <Link href={`/admin/sessions/${session.id}/monitor`}>
                        <Button variant="outline" size="sm">
                          <Activity className="h-4 w-4 mr-2" />
                          Monitor
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

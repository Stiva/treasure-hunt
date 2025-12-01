import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import {
  MapPin,
  Users,
  UsersRound,
  Activity,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gradient-frost">{t("dashboard")}</h1>
        <p className="text-frost-400">
          Gestisci le sessioni di caccia al tesoro e monitora i giocatori
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          href="/admin/sessions/new"
          icon={<Plus className="h-6 w-6" />}
          title={t("newSession")}
          description="Crea una nuova sessione di gioco"
          variant="primary"
        />
        <QuickActionCard
          href="/admin/sessions"
          icon={<MapPin className="h-6 w-6" />}
          title={t("sessions")}
          description="Gestisci le sessioni esistenti"
        />
        <QuickActionCard
          href="/admin/sessions"
          icon={<Activity className="h-6 w-6" />}
          title={t("monitor")}
          description="Monitoraggio in tempo reale"
        />
        <QuickActionCard
          href="/admin/sessions"
          icon={<Sparkles className="h-6 w-6" />}
          title="Genera Percorsi"
          description="Crea percorsi randomici"
        />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="frost">
          <CardHeader>
            <CardTitle>Come funziona</CardTitle>
            <CardDescription>Guida rapida alla gestione</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-frost-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-frost-600 text-white text-sm flex items-center justify-center">
                  1
                </span>
                <span>Crea una nuova sessione con nome e parola chiave</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-frost-600 text-white text-sm flex items-center justify-center">
                  2
                </span>
                <span>Aggiungi le tappe con indovinelli e indizi</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-frost-600 text-white text-sm flex items-center justify-center">
                  3
                </span>
                <span>Importa i giocatori e crea le squadre/coppie</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-frost-600 text-white text-sm flex items-center justify-center">
                  4
                </span>
                <span>Genera i percorsi randomici per ogni squadra</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sand-500 text-pitch-900 text-sm flex items-center justify-center">
                  5
                </span>
                <span>Attiva la sessione e condividi la parola chiave!</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card variant="frost">
          <CardHeader>
            <CardTitle>Modalità di Gioco</CardTitle>
            <CardDescription>Scegli come organizzare i partecipanti</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-night-900/50 border border-night-800">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-frost-400" />
                <h4 className="font-medium text-frost-100">Solitario</h4>
              </div>
              <p className="text-sm text-frost-400">
                Ogni giocatore partecipa singolarmente con il proprio percorso.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-night-900/50 border border-night-800">
              <div className="flex items-center gap-3 mb-2">
                <UsersRound className="h-5 w-5 text-sand-400" />
                <h4 className="font-medium text-frost-100">A Coppie</h4>
              </div>
              <p className="text-sm text-frost-400">
                I giocatori sono organizzati in coppie che condividono lo stesso
                percorso e progresso.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
  variant = "default",
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: "default" | "primary";
}) {
  const baseClasses =
    "block p-4 rounded-xl border transition-all duration-200 group";
  const variantClasses =
    variant === "primary"
      ? "bg-frost-600/10 border-frost-600/30 hover:bg-frost-600/20 hover:border-frost-500"
      : "bg-pitch-900/50 border-night-800 hover:bg-night-900/50 hover:border-night-700";

  return (
    <Link href={href} className={`${baseClasses} ${variantClasses}`}>
      <div
        className={`mb-3 ${
          variant === "primary" ? "text-frost-400" : "text-frost-500"
        } group-hover:text-frost-300 transition-colors`}
      >
        {icon}
      </div>
      <h3 className="font-medium text-frost-100 mb-1">{title}</h3>
      <p className="text-sm text-frost-400">{description}</p>
      <div className="mt-3 flex items-center text-frost-500 text-sm group-hover:text-frost-400 transition-colors">
        <span>Vai</span>
        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

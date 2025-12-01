import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getSessionById } from "@/lib/db/queries";
import { SupportPanel } from "@/components/admin/support";
import { ArrowLeft, MessageCircle } from "lucide-react";

interface SupportPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function SupportPage({ params }: SupportPageProps) {
  const { id } = await params;
  const sessionId = parseInt(id);

  if (isNaN(sessionId)) {
    notFound();
  }

  const session = await getSessionById(sessionId);

  if (!session) {
    notFound();
  }

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
            <MessageCircle className="h-6 w-6 text-frost-400" />
            Supporto
          </h1>
          <p className="text-frost-400">
            Messaggi dei giocatori - "{session.name}"
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

      {/* Support Panel */}
      <SupportPanel sessionId={sessionId} />
    </div>
  );
}

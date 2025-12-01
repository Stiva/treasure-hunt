import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSessionById } from "@/lib/db/queries";
import { SessionForm } from "@/components/admin/session-form";
import { ArrowLeft } from "lucide-react";

interface EditSessionPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditSessionPage({ params }: EditSessionPageProps) {
  const { locale, id } = await params;
  const sessionId = parseInt(id);

  if (isNaN(sessionId)) {
    notFound();
  }

  const session = await getSessionById(sessionId);

  if (!session) {
    notFound();
  }

  const t = await getTranslations("admin");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href={`/admin/sessions/${session.id}`}
        className="inline-flex items-center gap-2 text-frost-400 hover:text-frost-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna alla sessione
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-frost-100">{t("editSession")}</h1>
        <p className="text-frost-400">
          Modifica i dettagli della sessione "{session.name}"
        </p>
      </div>

      {/* Form */}
      <SessionForm session={session} locale={locale} />
    </div>
  );
}

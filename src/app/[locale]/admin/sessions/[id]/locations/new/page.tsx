import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSessionById, getLocationsBySessionId } from "@/lib/db/queries";
import { LocationForm } from "@/components/admin/location-form";
import { ArrowLeft } from "lucide-react";

interface NewLocationPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function NewLocationPage({ params }: NewLocationPageProps) {
  const { locale, id } = await params;
  const sessionId = parseInt(id);

  if (isNaN(sessionId)) {
    notFound();
  }

  const [session, locations] = await Promise.all([
    getSessionById(sessionId),
    getLocationsBySessionId(sessionId),
  ]);

  if (!session) {
    notFound();
  }

  const t = await getTranslations("admin");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href={`/admin/sessions/${session.id}/locations`}
        className="inline-flex items-center gap-2 text-frost-400 hover:text-frost-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna alle tappe
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-frost-100">Nuova Tappa</h1>
        <p className="text-frost-400">
          Aggiungi una nuova tappa alla sessione "{session.name}"
        </p>
      </div>

      {/* Form */}
      <LocationForm
        sessionId={sessionId}
        locale={locale}
        locationsCount={locations.length}
      />
    </div>
  );
}

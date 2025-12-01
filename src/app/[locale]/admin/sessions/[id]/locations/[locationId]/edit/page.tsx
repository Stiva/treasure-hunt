import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getSessionById,
  getLocationById,
  getLocationsBySessionId,
} from "@/lib/db/queries";
import { LocationForm } from "@/components/admin/location-form";
import { ArrowLeft } from "lucide-react";

interface EditLocationPageProps {
  params: Promise<{ locale: string; id: string; locationId: string }>;
}

export default async function EditLocationPage({
  params,
}: EditLocationPageProps) {
  const { locale, id, locationId } = await params;
  const sessionId = parseInt(id);
  const locId = parseInt(locationId);

  if (isNaN(sessionId) || isNaN(locId)) {
    notFound();
  }

  const [session, location, locations] = await Promise.all([
    getSessionById(sessionId),
    getLocationById(locId),
    getLocationsBySessionId(sessionId),
  ]);

  if (!session || !location) {
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
        <h1 className="text-2xl font-bold text-frost-100">Modifica Tappa</h1>
        <p className="text-frost-400">
          Modifica la tappa "{locale === "it" ? location.nameIt : location.nameEn}"
        </p>
      </div>

      {/* Form */}
      <LocationForm
        location={location}
        sessionId={sessionId}
        locale={locale}
        locationsCount={locations.length}
      />
    </div>
  );
}

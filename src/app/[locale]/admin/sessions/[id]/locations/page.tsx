import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSessionById, getLocationsBySessionId } from "@/lib/db/queries";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "@/components/ui";
import {
  ArrowLeft,
  Plus,
  MapPin,
  Flag,
  Trophy,
  Pencil,
  GripVertical,
} from "lucide-react";
import { LocationsMapToggle } from "@/components/admin/locations-page-client";

interface LocationsPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function LocationsPage({ params }: LocationsPageProps) {
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

  const startLocation = locations.find((l) => l.isStart);
  const endLocation = locations.find((l) => l.isEnd);
  const intermediateLocations = locations.filter((l) => !l.isStart && !l.isEnd);

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
          <h1 className="text-2xl font-bold text-frost-100">{t("locations")}</h1>
          <p className="text-frost-400">
            Gestisci le tappe della sessione "{session.name}"
          </p>
        </div>
        <Link href={`/admin/sessions/${session.id}/locations/new`}>
          <Button variant="sand">
            <Plus className="h-4 w-4 mr-2" />
            Nuova Tappa
          </Button>
        </Link>
      </div>

      {/* Map Toggle */}
      {locations.length > 0 && (
        <LocationsMapToggle locations={locations} locale={locale} />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="frost">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Flag className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-frost-400">Partenza</p>
                <p className="font-medium text-frost-100">
                  {startLocation ? (locale === "it" ? startLocation.nameIt : startLocation.nameEn) : "Non configurata"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="frost">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-frost-400" />
              <div>
                <p className="text-sm text-frost-400">Intermedie</p>
                <p className="font-medium text-frost-100">{intermediateLocations.length} tappe</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="frost">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-sand-400" />
              <div>
                <p className="text-sm text-frost-400">Arrivo</p>
                <p className="font-medium text-frost-100">
                  {endLocation ? (locale === "it" ? endLocation.nameIt : endLocation.nameEn) : "Non configurata"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Locations List */}
      {locations.length === 0 ? (
        <Card variant="frost">
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 mx-auto text-frost-600 mb-4" />
            <h3 className="text-lg font-medium text-frost-200 mb-2">
              Nessuna tappa configurata
            </h3>
            <p className="text-frost-400 mb-4">
              Inizia aggiungendo le tappe della caccia al tesoro
            </p>
            <Link href={`/admin/sessions/${session.id}/locations/new`}>
              <Button variant="sand">
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Prima Tappa
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card variant="frost">
          <CardHeader>
            <CardTitle>Tutte le Tappe ({locations.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-night-800">
              {locations.map((location, index) => (
                <div
                  key={location.id}
                  className="flex items-center gap-4 p-4 hover:bg-night-900/50 transition-colors"
                >
                  <div className="text-frost-600 cursor-move">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-night-800 text-frost-300">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-frost-100 truncate">
                        {locale === "it" ? location.nameIt : location.nameEn}
                      </h3>
                      {location.isStart && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          <Flag className="h-3 w-3 mr-1" />
                          Partenza
                        </span>
                      )}
                      {location.isEnd && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sand-500/20 text-sand-400 border border-sand-500/30">
                          <Trophy className="h-3 w-3 mr-1" />
                          Arrivo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-frost-500">
                      <span>
                        Codice:{" "}
                        <code className="font-mono bg-night-900 px-1.5 py-0.5 rounded text-frost-400">
                          {location.code}
                        </code>
                      </span>
                      {location.riddleIt && (
                        <span className="text-frost-600">• Indovinello configurato</span>
                      )}
                    </div>
                  </div>
                  <Link href={`/admin/sessions/${session.id}/locations/${location.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <div className="p-4 rounded-lg bg-frost-600/10 border border-frost-600/20">
        <h4 className="font-medium text-frost-200 mb-2">Suggerimenti</h4>
        <ul className="text-sm text-frost-400 space-y-1">
          <li>• La <strong>tappa di partenza</strong> è comune a tutti i team</li>
          <li>• Le <strong>tappe intermedie</strong> saranno visitate in ordine diverso da ogni team</li>
          <li>• La <strong>tappa finale</strong> è comune a tutti i team</li>
          <li>• Ogni tappa necessita di un codice univoco che i giocatori troveranno fisicamente</li>
        </ul>
      </div>
    </div>
  );
}

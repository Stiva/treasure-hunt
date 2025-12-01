import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  Key,
  Lightbulb,
  Users,
  Trophy,
  Clock,
} from "lucide-react";

interface HelpPageProps {
  params: Promise<{ locale: string }>;
}

export default async function HelpPage({ params }: HelpPageProps) {
  const { locale } = await params;
  const t = await getTranslations("help");

  return (
    <div className="min-h-screen bg-gradient-to-b from-night-950 to-pitch-950 p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        {/* Back Link */}
        <Link
          href="/play"
          className="inline-flex items-center gap-2 text-frost-400 hover:text-frost-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna al gioco
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <BookOpen className="h-12 w-12 mx-auto text-frost-400 mb-4" />
          <h1 className="text-3xl font-bold text-gradient-frost">{t("title")}</h1>
        </div>

        {/* Rules */}
        <Card variant="frost">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-frost-400" />
              {t("rules")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-frost-600 text-white text-sm flex items-center justify-center">
                1
              </span>
              <p className="text-frost-300">{t("rule1")}</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-frost-600 text-white text-sm flex items-center justify-center">
                2
              </span>
              <p className="text-frost-300">{t("rule2")}</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-frost-600 text-white text-sm flex items-center justify-center">
                3
              </span>
              <p className="text-frost-300">{t("rule3")}</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-frost-600 text-white text-sm flex items-center justify-center">
                4
              </span>
              <p className="text-frost-300">{t("rule4")}</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-frost-600 text-white text-sm flex items-center justify-center">
                5
              </span>
              <p className="text-frost-300">{t("rule5")}</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-frost-600 text-white text-sm flex items-center justify-center">
                6
              </span>
              <p className="text-frost-300">{t("rule6")}</p>
            </div>
          </CardContent>
        </Card>

        {/* How to Use */}
        <Card variant="frost">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-sand-400" />
              {t("howToUse")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sand-500 text-pitch-900 text-sm flex items-center justify-center font-medium">
                1
              </span>
              <p className="text-frost-300">{t("step1")}</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sand-500 text-pitch-900 text-sm flex items-center justify-center font-medium">
                2
              </span>
              <p className="text-frost-300">{t("step2")}</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sand-500 text-pitch-900 text-sm flex items-center justify-center font-medium">
                3
              </span>
              <p className="text-frost-300">{t("step3")}</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sand-500 text-pitch-900 text-sm flex items-center justify-center font-medium">
                4
              </span>
              <p className="text-frost-300">{t("step4")}</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sand-500 text-pitch-900 text-sm flex items-center justify-center font-medium">
                5
              </span>
              <p className="text-frost-300">{t("step5")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card variant="frost">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-frost-400" />
              {t("tips")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-night-800 border border-night-700">
              <p className="text-frost-300">{t("tip1")}</p>
            </div>
            <div className="p-3 rounded-lg bg-night-800 border border-night-700">
              <p className="text-frost-300">{t("tip2")}</p>
            </div>
            <div className="p-3 rounded-lg bg-night-800 border border-night-700">
              <p className="text-frost-300">{t("tip3")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Game Info Icons */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-pitch-900/50 border border-night-800">
            <Users className="h-8 w-8 mx-auto text-frost-400 mb-2" />
            <p className="text-sm text-frost-400">A Coppie</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-pitch-900/50 border border-night-800">
            <Clock className="h-8 w-8 mx-auto text-frost-400 mb-2" />
            <p className="text-sm text-frost-400">3 min tra indizi</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-pitch-900/50 border border-night-800">
            <Trophy className="h-8 w-8 mx-auto text-sand-400 mb-2" />
            <p className="text-sm text-frost-400">Arrivo Comune</p>
          </div>
        </div>
      </div>
    </div>
  );
}

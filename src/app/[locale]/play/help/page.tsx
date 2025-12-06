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
import { getCurrentPlayer } from "@/lib/utils/player-session";
import { getSessionById } from "@/lib/db/queries";
import type { HelpContent } from "@/types/database";

interface HelpPageProps {
  params: Promise<{ locale: string }>;
}

export default async function HelpPage({ params }: HelpPageProps) {
  const { locale } = await params;
  const t = await getTranslations("help");

  // Try to get session-specific help content
  let helpContent: HelpContent | null = null;
  let teamSize = 2; // default

  const playerData = await getCurrentPlayer();
  if (playerData?.player) {
    const session = await getSessionById(playerData.player.sessionId);
    if (session) {
      teamSize = session.teamSize;
      const content = locale === "it"
        ? session.helpContentIt
        : session.helpContentEn;
      if (content) {
        helpContent = content as HelpContent;
      }
    }
  }

  // Use custom content or fallback to i18n defaults
  const rules = helpContent?.rules?.length
    ? helpContent.rules
    : [t("rule1"), t("rule2"), t("rule3"), t("rule4"), t("rule5"), t("rule6")];

  const steps = helpContent?.steps?.length
    ? helpContent.steps
    : [t("step1"), t("step2"), t("step3"), t("step4"), t("step5")];

  const tips = helpContent?.tips?.length
    ? helpContent.tips
    : [t("tip1"), t("tip2"), t("tip3")];

  // Team size label
  const teamSizeLabel = teamSize === 1
    ? (locale === "it" ? "Singoli" : "Solo")
    : teamSize === 2
    ? (locale === "it" ? "A Coppie" : "In Pairs")
    : (locale === "it" ? `Squadre da ${teamSize}` : `Teams of ${teamSize}`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-night-950 to-pitch-950 p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        {/* Back Link */}
        <Link
          href="/play"
          className="inline-flex items-center gap-2 text-frost-400 hover:text-frost-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "it" ? "Torna al gioco" : "Back to game"}
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
            {rules.map((rule, index) => (
              <div key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-frost-600 text-white text-sm flex items-center justify-center">
                  {index + 1}
                </span>
                <p className="text-frost-300">{rule}</p>
              </div>
            ))}
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
            {steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sand-500 text-pitch-900 text-sm flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <p className="text-frost-300">{step}</p>
              </div>
            ))}
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
            {tips.map((tip, index) => (
              <div key={index} className="p-3 rounded-lg bg-night-800 border border-night-700">
                <p className="text-frost-300">{tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Game Info Icons */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-pitch-900/50 border border-night-800">
            <Users className="h-8 w-8 mx-auto text-frost-400 mb-2" />
            <p className="text-sm text-frost-400">{teamSizeLabel}</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-pitch-900/50 border border-night-800">
            <Clock className="h-8 w-8 mx-auto text-frost-400 mb-2" />
            <p className="text-sm text-frost-400">
              {locale === "it" ? "3 min tra indizi" : "3 min between hints"}
            </p>
          </div>
          <div className="text-center p-4 rounded-lg bg-pitch-900/50 border border-night-800">
            <Trophy className="h-8 w-8 mx-auto text-sand-400 mb-2" />
            <p className="text-sm text-frost-400">
              {locale === "it" ? "Arrivo Comune" : "Common Finish"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

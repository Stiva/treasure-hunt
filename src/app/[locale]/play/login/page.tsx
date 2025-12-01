import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentPlayer } from "@/lib/utils/player-session";
import { PlayerLoginForm } from "@/components/player/login-form";

interface PlayLoginPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PlayLoginPage({ params }: PlayLoginPageProps) {
  const { locale } = await params;
  const t = await getTranslations("auth");

  // Check if already logged in
  const sessionData = await getCurrentPlayer();
  if (sessionData) {
    redirect(`/${locale}/play`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-night-950 to-pitch-950 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gradient-frost mb-2">
            Caccia al Tesoro
          </h1>
          <p className="text-frost-400">{t("loginTitle")}</p>
        </div>

        {/* Login Form */}
        <PlayerLoginForm locale={locale} />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { getCurrentPlayer } from "@/lib/utils/player-session";
import { PlayerLoginForm } from "@/components/player/login-form";

// Force dynamic rendering to prevent caching issues between sessions
export const dynamic = "force-dynamic";

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
        {/* Banner Image */}
        <div className="flex justify-center">
          <Image
            src="/TitleBanner_medium.png"
            alt="Le Cinque Leggende: I Tesori Nascosti di Carpi"
            width={600}
            height={200}
            className="w-full max-w-lg h-auto rounded-lg"
            priority
          />
        </div>

        {/* Login Form */}
        <PlayerLoginForm locale={locale} />
      </div>
    </div>
  );
}

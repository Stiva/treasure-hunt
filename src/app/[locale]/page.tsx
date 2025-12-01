import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Snowflake, Sparkles, HelpCircle, Shield } from "lucide-react";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-frost-300 opacity-20 animate-float">
          <Snowflake size={40} />
        </div>
        <div
          className="absolute top-20 right-20 text-sand-400 opacity-20 animate-sparkle"
          style={{ animationDelay: "0.5s" }}
        >
          <Sparkles size={30} />
        </div>
        <div
          className="absolute bottom-20 left-1/4 text-frost-400 opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        >
          <Snowflake size={25} />
        </div>
        <div
          className="absolute bottom-40 right-1/3 text-sand-300 opacity-20 animate-sparkle"
          style={{ animationDelay: "1.5s" }}
        >
          <Sparkles size={35} />
        </div>
      </div>

      {/* Main content */}
      <div className="text-center z-10 max-w-md mx-auto">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-frost mb-4">
            {t("landing.title")}
          </h1>
          <p className="text-frost-300 text-lg">{t("landing.subtitle")}</p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4 my-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-frost-500" />
          <Snowflake className="text-frost-400 animate-spin-slow" size={20} />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-frost-500" />
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          {/* Player Login Button */}
          <Link
            href="/login"
            className="block w-full py-4 px-6 rounded-xl bg-frost-600 hover:bg-frost-500
                       text-white font-semibold text-lg transition-all duration-300
                       btn-frost frost-border"
          >
            {t("landing.playerLogin")}
          </Link>

          {/* Help Button */}
          <Link
            href="/help"
            className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl
                       bg-night-900/50 hover:bg-night-800/50 text-frost-200
                       font-medium transition-all duration-300 frost-border"
          >
            <HelpCircle size={20} />
            {t("landing.howToPlay")}
          </Link>

          {/* Admin Button */}
          <Link
            href="/admin"
            className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl
                       bg-pitch-900/50 hover:bg-pitch-800/50 text-frost-300
                       font-medium transition-all duration-300 border border-pitch-700"
          >
            <Shield size={18} />
            {t("landing.adminLogin")}
          </Link>
        </div>

        {/* Language switcher placeholder */}
        <div className="mt-8">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}

function LanguageSwitcher() {
  return (
    <div className="flex justify-center gap-4 text-sm">
      <Link
        href="/"
        locale="it"
        className="text-frost-400 hover:text-frost-200 transition-colors"
      >
        Italiano
      </Link>
      <span className="text-frost-600">|</span>
      <Link
        href="/"
        locale="en"
        className="text-frost-400 hover:text-frost-200 transition-colors"
      >
        English
      </Link>
    </div>
  );
}

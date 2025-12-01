import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SessionForm } from "@/components/admin/session-form";
import { ArrowLeft } from "lucide-react";

interface NewSessionPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewSessionPage({ params }: NewSessionPageProps) {
  const { locale } = await params;
  const t = await getTranslations("admin");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/sessions"
        className="inline-flex items-center gap-2 text-frost-400 hover:text-frost-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna alle sessioni
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-frost-100">{t("newSession")}</h1>
        <p className="text-frost-400">
          Crea una nuova sessione di caccia al tesoro
        </p>
      </div>

      {/* Form */}
      <SessionForm locale={locale} />
    </div>
  );
}

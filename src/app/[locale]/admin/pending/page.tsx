import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Clock, Snowflake, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { checkAdminAuth } from "@/lib/admin-auth";
import { Card, CardContent } from "@/components/ui";

interface PendingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PendingApprovalPage({ params }: PendingPageProps) {
  const { locale } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/${locale}/sign-in`);
  }

  const adminAuth = await checkAdminAuth();

  // If approved, redirect to admin dashboard
  if (adminAuth.isApproved) {
    redirect(`/${locale}/admin`);
  }

  const statusConfig = {
    pending: {
      icon: <Clock className="h-16 w-16 text-sand-400" />,
      title: "In attesa di approvazione",
      titleEn: "Pending Approval",
      description: "Il tuo account è in attesa di approvazione da parte di un amministratore.",
      descriptionEn: "Your account is pending approval from an administrator.",
      color: "sand",
    },
    rejected: {
      icon: <XCircle className="h-16 w-16 text-red-400" />,
      title: "Accesso negato",
      titleEn: "Access Denied",
      description: "Il tuo accesso al pannello di amministrazione è stato negato.",
      descriptionEn: "Your access to the admin panel has been denied.",
      color: "red",
    },
  };

  const status = adminAuth.status === "rejected" ? "rejected" : "pending";
  const config = statusConfig[status];

  return (
    <div className="min-h-screen bg-gradient-to-b from-night-950 to-pitch-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-night-800 bg-pitch-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 text-frost-100">
              <Snowflake className="h-6 w-6 text-frost-400" />
              <span className="font-semibold text-lg">
                Caccia al Tesoro
              </span>
            </div>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card variant="frost" className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <div className="flex justify-center mb-6">
              {config.icon}
            </div>
            <h1 className="text-2xl font-bold text-frost-100 mb-2">
              {locale === "it" ? config.title : config.titleEn}
            </h1>
            <p className="text-frost-400 mb-6">
              {locale === "it" ? config.description : config.descriptionEn}
            </p>

            {adminAuth.email && (
              <div className="bg-night-800 rounded-lg p-4 text-sm">
                <p className="text-frost-500 mb-1">
                  {locale === "it" ? "Account registrato:" : "Registered account:"}
                </p>
                <p className="text-frost-200 font-medium">{adminAuth.email}</p>
                {adminAuth.firstName && (
                  <p className="text-frost-300 mt-1">
                    {adminAuth.firstName} {adminAuth.lastName}
                  </p>
                )}
              </div>
            )}

            <p className="text-frost-500 text-sm mt-6">
              {locale === "it"
                ? "Contatta un amministratore per richiedere l'accesso."
                : "Contact an administrator to request access."}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

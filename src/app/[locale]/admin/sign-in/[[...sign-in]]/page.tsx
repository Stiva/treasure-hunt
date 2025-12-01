import { SignIn } from "@clerk/nextjs";

interface SignInPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-night-950 to-pitch-950 p-4">
      <SignIn
        path={`/${locale}/admin/sign-in`}
        routing="path"
        signUpUrl={`/${locale}/admin/sign-up`}
        forceRedirectUrl={`/${locale}/admin`}
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-pitch-900 border border-night-800 shadow-xl",
            headerTitle: "text-frost-100",
            headerSubtitle: "text-frost-400",
            socialButtonsBlockButton:
              "bg-night-800 border-night-700 text-frost-200 hover:bg-night-700",
            socialButtonsBlockButtonText: "text-frost-200",
            dividerLine: "bg-night-700",
            dividerText: "text-frost-500",
            formFieldLabel: "text-frost-200",
            formFieldInput:
              "bg-pitch-800 border-night-700 text-frost-100 focus:ring-frost-500 focus:border-frost-500",
            formButtonPrimary:
              "bg-frost-600 hover:bg-frost-500 text-white",
            footerActionLink: "text-frost-400 hover:text-frost-300",
            identityPreviewText: "text-frost-200",
            identityPreviewEditButton: "text-frost-400 hover:text-frost-300",
            formFieldInputShowPasswordButton: "text-frost-400",
            otpCodeFieldInput: "bg-pitch-800 border-night-700 text-frost-100",
            formResendCodeLink: "text-frost-400 hover:text-frost-300",
            alert: "bg-red-900/20 border-red-800 text-red-300",
            alertText: "text-red-300",
          },
        }}
      />
    </div>
  );
}

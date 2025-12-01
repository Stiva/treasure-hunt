import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  LayoutDashboard,
  MapPin,
  Users,
  UsersRound,
  Activity,
  Menu,
  Snowflake,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { userId } = await auth();
  const { locale } = await params;

  if (!userId) {
    redirect(`/${locale}/admin/sign-in`);
  }

  const t = await getTranslations("admin");

  return (
    <div className="min-h-screen bg-gradient-to-b from-night-950 to-pitch-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-night-800 bg-pitch-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/admin"
              className="flex items-center gap-2 text-frost-100 hover:text-frost-50 transition-colors"
            >
              <Snowflake className="h-6 w-6 text-frost-400" />
              <span className="font-semibold text-lg hidden sm:inline">
                {t("dashboard")}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/admin" icon={<LayoutDashboard size={18} />}>
                Dashboard
              </NavLink>
              <NavLink href="/admin/sessions" icon={<MapPin size={18} />}>
                {t("sessions")}
              </NavLink>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-frost-300 hover:text-frost-100 hover:bg-night-800/50 transition-all duration-200"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

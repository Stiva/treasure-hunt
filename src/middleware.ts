import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Define protected admin routes (require Clerk authentication)
// Exclude sign-in and sign-up pages from protection
const isAdminRoute = createRouteMatcher([
  "/:locale/admin",
  "/:locale/admin/sessions(.*)",
]);

// Define sign-in routes that should NOT be protected
const isSignInRoute = createRouteMatcher([
  "/:locale/sign-in(.*)",
  "/:locale/sign-up(.*)",
]);

// Define public routes that don't need any authentication
const isPublicRoute = createRouteMatcher([
  "/:locale",
  "/:locale/login",
  "/:locale/help",
  "/",
  "/login",
  "/help",
]);

// Define API routes
const isApiRoute = createRouteMatcher(["/api(.*)"]);
const isAdminApiRoute = createRouteMatcher(["/api/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // For API routes
  if (isApiRoute(req)) {
    // Protect admin API routes with Clerk
    if (isAdminApiRoute(req)) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }
    // Player API routes use custom auth, not Clerk
    return NextResponse.next();
  }

  // For admin pages (but not sign-in/sign-up pages), require Clerk authentication
  if (isAdminRoute(req) && !isSignInRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      // Get locale from pathname
      const localeMatch = pathname.match(/^\/(it|en)\//);
      const locale = localeMatch ? localeMatch[1] : "it";
      const signInUrl = new URL(`/${locale}/sign-in`, req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Apply i18n middleware for all non-API routes
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes that start with /api
    // - _next/static (static files)
    // - _next/image (image optimization)
    // - favicon.ico, sitemap.xml, robots.txt (metadata files)
    // - images and other static assets
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    // Include API routes
    "/api/:path*",
  ],
};

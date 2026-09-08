import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const AUTH_PAGES = new Set(["/login", "/signup"]);
const PUBLIC_PAGES = new Set(["/docs"]);

function isPublicApi(pathname: string) {
  return (
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/signup" ||
    pathname === "/api/purchases/webhook"
  );
}

function isInternalApi(pathname: string) {
  return pathname.startsWith("/api/v1/");
}

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/icon" ||
    pathname.startsWith("/icon.") ||
    pathname === "/apple-icon" ||
    pathname.startsWith("/apple-icon.") ||
    pathname.includes(".")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname) || isInternalApi(pathname) || isPublicApi(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (AUTH_PAGES.has(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (PUBLIC_PAGES.has(pathname)) {
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHENTICATED", message: "Login required" },
        { status: 401 },
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/" || pathname === "/how-credits-work") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

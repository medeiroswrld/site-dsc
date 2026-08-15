import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Keeps the Supabase session cookie fresh on every admin request and bounces
 * anonymous visitors to the login screen.
 *
 * The pages themselves re-check with `requireAdmin()` — this is the first
 * gate, not the only one.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // Without a project connected there is no panel to protect.
  if (!url || !key) {
    return NextResponse.redirect(new URL("/admin/configurar", request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("proximo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Rotas protegidas. Ficam de fora, por serem públicas de propósito:
  //   /admin/login, /admin/esqueci-senha, /admin/nova-senha e /admin/configurar.
  matcher: [
    "/admin",
    "/admin/veiculos/:path*",
    "/admin/conteudo",
    "/admin/instagram",
    "/admin/senha",
  ],
};

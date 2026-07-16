import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { tryGetServerEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const authError =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error");
  const next = requestUrl.searchParams.get("next") ?? "/portal";
  const redirectUrl = new URL(next, requestUrl.origin);
  const invalidLinkUrl = new URL("/reset-password", requestUrl.origin);

  invalidLinkUrl.searchParams.set("error", "invalid_link");

  const env = tryGetServerEnv();

  if (!env) {
    return NextResponse.redirect(invalidLinkUrl);
  }

  let response = NextResponse.redirect(redirectUrl);
  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  if (authError) {
    response = NextResponse.redirect(invalidLinkUrl);
    await supabase.auth.signOut();
    return response;
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      response = NextResponse.redirect(invalidLinkUrl);
      await supabase.auth.signOut();
      return response;
    }

    return response;
  }

  if (tokenHash && (type === "invite" || type === "recovery")) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      response = NextResponse.redirect(invalidLinkUrl);
      await supabase.auth.signOut();
      return response;
    }

    return response;
  }

  response = NextResponse.redirect(invalidLinkUrl);
  await supabase.auth.signOut();
  return response;
}

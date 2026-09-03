"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { createClient } from "@/lib/supabase/client";

export function AuthBox({ view }: { view: "sign_in" | "sign_up" }) {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.replace("/");
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;

  return (
    <div className="auth-box">
      <Auth
        supabaseClient={supabase}
        view={view}
        providers={["google"]}
        redirectTo={redirectTo}
        // Drop the library's inline styles; all styling lives in globals.css.
        appearance={{ extend: false }}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts already guards this, but re-check so `user` is always non-null below.
  if (!user) {
    redirect("/sign-in");
  }

  return <AppShell user={user}>{children}</AppShell>;
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts already guards this, but re-check so `user` is always non-null below.
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-black">
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}

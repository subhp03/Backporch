import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FloatingNav } from "./_components/FloatingNav";
import { Hero } from "./_components/Hero";
import { TopNav } from "./_components/TopNav";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/discover");
  }

  return (
    <>
      <TopNav />
      <FloatingNav />
      <Hero />
      <main className="mx-auto max-w-3xl px-6">
        <section id="problem" className="flex min-h-dvh flex-col justify-center gap-4 py-16">
          <h2 className="text-3xl font-semibold capitalize">problem</h2>
          <p className="text-zinc-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </section>
        <section id="solution" className="flex min-h-dvh flex-col justify-center gap-4 py-16">
          <h2 className="text-3xl font-semibold capitalize">solution</h2>
          <p className="text-zinc-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </section>
        <section id="contact" className="flex min-h-dvh flex-col justify-center gap-4 py-16">
          <h2 className="text-3xl font-semibold capitalize">contact</h2>
          <p className="text-zinc-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </section>
      </main>
    </>
  );
}

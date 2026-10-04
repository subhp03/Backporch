import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FloatingNav } from "./_components/FloatingNav";
import { Faq } from "./_components/Faq";
import { Hero } from "./_components/Hero";
import { Showcase } from "./_components/Showcase";
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
      <Showcase />
      <Faq />
    </>
  );
}

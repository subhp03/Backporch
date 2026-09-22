import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/chat/conversation";
import { missingProfileFields } from "@/lib/chat/profile";
import type { Profile } from "@/lib/chat/types";

/**
 * Redirects to /sign-in if unauthenticated, or /chat if the profile isn't
 * fully filled out yet. Call at the top of any page that requires
 * onboarding to be complete before it can be shown.
 */
export async function requireCompleteProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const profile = await getProfile(user.id);
  if (missingProfileFields(profile).length > 0) {
    redirect("/chat");
  }

  return profile;
}

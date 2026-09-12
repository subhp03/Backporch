import type { User } from "@supabase/supabase-js";

/** To return the first letter of the user's email **/
export function userInitial(user: User): string {
  return (user.email?.[0] ?? "?").toUpperCase();
}

/** To return OAuth avatar URL from user metadata */
export function userAvatarUrl(user: User): string | null {
  const url = user.user_metadata?.avatar_url;
  return typeof url === "string" && url.length > 0 ? url : null;
}

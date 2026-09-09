import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-10">
      <p className="text-sm text-zinc-400">Signed in as {user?.email ?? "—"}</p>
      <form action="/sign-out" method="post">
        <button
          type="submit"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-800"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

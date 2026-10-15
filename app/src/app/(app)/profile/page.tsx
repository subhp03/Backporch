import { requireCompleteProfile } from "@/lib/chat/gate";

export default async function ProfilePage() {
  await requireCompleteProfile();
  return <div>
    <p className="p-6 text-zinc-400">Coming soon</p>
    <form action="/sign-out" method="post">
      <p className="px-6">
        <button type="submit" className="text-zinc-400 underline hover:text-zinc-100">
          Sign out
        </button>
      </p>
    </form>
  </div>;
}

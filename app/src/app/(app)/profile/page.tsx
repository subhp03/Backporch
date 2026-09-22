import { requireCompleteProfile } from "@/lib/chat/gate";

export default async function ProfilePage() {
  await requireCompleteProfile();
  return <p className="p-6 text-zinc-400">Coming soon</p>;
}

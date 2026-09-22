import { redirect } from "next/navigation";
import { requireCompleteProfile } from "@/lib/chat/gate";

export default async function Home() {
  await requireCompleteProfile();
  redirect("/discover");
}

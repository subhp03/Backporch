import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { userAvatarUrl, userInitial } from "@/utils/user";

export function Navbar({ user }: { user: User }) {
  const src = userAvatarUrl(user);

  return (
    <header className="border-b border-zinc-800 bg-black">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt=""
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-lg font-semibold tracking-tight text-zinc-100">
            BackPorch
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100 transition-colors hover:bg-zinc-800"
          >
            <MessageCircle className="h-4 w-4" />
          </Link>

          {src ? (
            <Image
              src={src}
              alt=""
              width={28}
              height={28}
              className="rounded-full border border-zinc-700"
            />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xs font-medium text-zinc-100">
              {userInitial(user)}
            </span>
          )}
        </div>
      </nav>
    </header>
  );
}

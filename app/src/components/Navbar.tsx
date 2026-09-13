import Link from "next/link";
import Image from "next/image";
import { Menu, Settings } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { userAvatarUrl, userInitial } from "@/utils/user";

export function Navbar({
  user,
  onMenuClick,
}: {
  user: User;
  onMenuClick: () => void;
}) {
  const src = userAvatarUrl(user);

  return (
    <header className="border-b border-zinc-800 bg-black">
      <nav className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-1.5 text-zinc-100 hover:bg-zinc-900 sm:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="text-xl font-semibold tracking-tight text-zinc-100">
              BackPorch
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3.5">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm text-zinc-100 transition-colors hover:bg-zinc-900"
          >
            <Settings className="h-7 w-7" />
          </Link>

          {src ? (
            <Image
              src={src}
              alt=""
              width={32}
              height={32}
              className="rounded-full border border-zinc-700"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-sm font-medium text-zinc-100">
              {userInitial(user)}
            </span>
          )}
        </div>
      </nav>
    </header>
  );
}

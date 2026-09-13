"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Compass, Sparkles, Bookmark, User } from "lucide-react";

const LINKS = [
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/matches", label: "Matches", icon: Sparkles },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: User },
];

/*Keeps the css clean on the sidebar component*/
function linkClasses(isActive: boolean): string {
  return (
    "flex items-center gap-3 rounded-lg px-4 py-3 text-base transition-colors " +
    (isActive
      ? "bg-zinc-900 text-zinc-100"
      : "text-zinc-400 hover:bg-red-900 hover:text-zinc-100")
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-zinc-800 bg-black">
      <nav className="flex flex-col gap-2 py-4">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={linkClasses(isActive)}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

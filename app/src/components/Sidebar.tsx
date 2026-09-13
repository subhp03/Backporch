"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Compass, Sparkles, Bookmark, User, X } from "lucide-react";

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
      ? "bg-red-900 text-zinc-100"
      : "text-zinc-400 hover:bg-red-900 hover:text-zinc-100")
  );
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 sm:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={
          "fixed inset-y-0 left-0 z-30 w-56 shrink-0 border-r border-zinc-800 bg-black transition-transform sm:static sm:translate-x-0 " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex justify-end px-2 pt-2 sm:hidden">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 py-4">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={linkClasses(isActive)}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

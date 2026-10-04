import Link from "next/link";
import { LuminousTopography } from "@/components/ui/luminous-topography";

export function Hero() {
  return (
    <section id="home" className="relative">
      <LuminousTopography
        className="absolute inset-0"
        accent="#dc2626"
        density={1}
        depth={3}
        drift={0.8}
        intensity={1}
        interactive
        safeArea={{ x: 0.2, y: 0.2, w: 0.6, h: 0.6 }}
      />

      <div className="pointer-events-none relative flex min-h-[80dvh] flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
          Find your next home in Kolkata by just talking.
        </h1>
        <p className="max-w-xl text-lg text-zinc-400">
          Tell Backporch what you want. It searches listings across portals and
          explains why each one fits.
        </p>
        <div className="pointer-events-auto flex gap-3">
          <Link
            href="/sign-up"
            className="rounded-full bg-[#991b1b] px-6 py-3 text-sm font-semibold text-[#fff5f5] transition-colors hover:bg-[#b91c1c]"
          >
            Get started
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-900"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

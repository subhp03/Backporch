import Link from "next/link";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/Hero_Section.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      <div className="relative flex min-h-[80dvh] flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="max-w-3xl font-pixel text-5xl font-normal text-zinc-50 sm:text-6xl">
          Find your next home <br></br> by just talking.
        </h1>
        <p className="max-w-xl text-lg text-zinc-300">
          We gather listings for Kolkata from multiple portals into one
          place, then AI matches them to what you actually want.
        </p>
        <div className="flex gap-3">
          <Link
            href="/sign-up"
            className="rounded-full bg-[#991b1b] px-6 py-3 text-sm font-semibold text-[#fff5f5] transition-colors hover:bg-[#b91c1c]"
          >
            Try it for free
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-900"
          >
            Already a user?
          </Link>
        </div>
      </div>
    </section>
  );
}

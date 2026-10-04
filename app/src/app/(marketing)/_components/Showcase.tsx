import { MatchesPreview } from "./MatchesPreview";

const blurbs = [
  {
    title: "Listings in one place",
    body: "We gather Kolkata listings from property portals into one database, so you search once.",
  },
  {
    title: "Matches that explain themselves",
    body: "Every result comes with a short reason it fits your budget, BHK and area, or the catch to watch for.",
  },
  {
    title: "Always fresh",
    body: "Listings are re-scraped daily and stale ones are retired, so you are not chasing homes that are gone.",
  },
];

export function Showcase() {
  return (
    <section id="showcase" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-zinc-50">
          Matches that tell you why.
        </h2>
        <p className="mt-4 text-zinc-400">
          Backporch reads every listing against what you told it, then ranks
          the best ones with a line on why each fits.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <MatchesPreview />

        <div className="flex flex-col gap-6 px-6 pt-10">
          <div className="flex flex-col gap-4">
            {blurbs.map(({ title, body }) => (
              <div key={title}>
                <p className="text-lg font-medium text-zinc-100">{title}</p>
                <p className="mt-1 text-base text-zinc-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { Plus } from "lucide-react";

const faqs = [
  {
    question: "What is Backporch?",
    answer:
      "Backporch is an AI property search assistant for Kolkata. You tell it what you want in a short chat, and it finds and ranks listings that fit.",
  },
  {
    question: "Where do the listings come from?",
    answer:
      "We gather listings from property portals into one database and refresh them daily. Right now that means MagicBricks, with more sources planned.",
  },
  {
    question: "How does matching work?",
    answer:
      "Your preferences are turned into a search over the listings, filtered by budget, BHK and locality. An AI then re-ranks the best candidates and writes a short reason for each.",
  },
  {
    question: "What data do you store about listings?",
    answer:
      "Only factual details such as price, BHK, area and locality. We do not store photos, owner names or contact details.",
  },
  {
    question: "Which cities do you cover?",
    answer: "Kolkata only for now.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-24">
      <div className="text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-zinc-50">
          Common questions
        </h2>
        <p className="mt-4 text-zinc-400">Short answers to what comes up most.</p>
      </div>

      <div className="mt-12 border-t border-zinc-800">
        {faqs.map(({ question, answer }) => (
          <details key={question} className="group border-b border-zinc-800 py-6">
            <summary className="flex cursor-pointer list-none items-center gap-4 text-lg font-medium text-zinc-50 [&::marker]:content-['']">
              <Plus className="h-5 w-5 shrink-0 text-red-500 transition-transform duration-200 group-open:rotate-45" />
              {question}
            </summary>
            <p className="mt-3 pl-9 text-zinc-400">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

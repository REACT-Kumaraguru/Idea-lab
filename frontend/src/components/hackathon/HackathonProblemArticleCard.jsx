import React from "react";

/** @param {Record<string, unknown>} p */
export function mentorNamesForProblem(p) {
  if (!p) return "Not assigned";
  const list = Array.isArray(p.mentors) && p.mentors.length ? p.mentors : p.mentor ? [p.mentor] : [];
  const names = list.map((m) => m?.user?.fullName).filter(Boolean);
  return names.length ? names.join(", ") : "Not assigned";
}

/**
 * Renders full description: paragraphs and bullet lists (-, *, •).
 */
function ProblemDescriptionBody({ text }) {
  if (!text) {
    return <p className="text-stone-600 italic">No description provided.</p>;
  }

  const lines = text.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    if (!lines[i].trim()) {
      i += 1;
      continue;
    }

    if (/^\s*[-*•]\s+/.test(lines[i])) {
      const items = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*•]\s+/, "").trim());
        i += 1;
      }
      blocks.push({ type: "ul", items });
    } else {
      const buf = [];
      while (i < lines.length && lines[i].trim() && !/^\s*[-*•]\s+/.test(lines[i])) {
        buf.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: "p", text: buf.join("\n") });
    }
  }

  return (
    <div className="font-sans text-base text-stone-800 leading-[1.75]">
      {blocks.map((b, idx) => {
        if (b.type === "ul") {
          return (
            <ul
              key={`ul-${idx}`}
              className="my-5 list-disc pl-6 sm:pl-7 space-y-2.5 marker:text-stone-400"
            >
              {b.items.map((item, j) => (
                <li key={j} className="pl-1">
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={`p-${idx}`} className="my-5 first:mt-0 whitespace-pre-wrap break-words">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Full-width article-style problem card (Medium / newspaper).
 * @param {{ problem: object, footerMeta?: React.ReactNode, action: React.ReactNode, className?: string }} props
 */
export function HackathonProblemArticleCard({ problem, footerMeta, action, className = "" }) {
  const p = problem;
  const category = p.sector?.trim() || "Problem statement";

  return (
    <article
      className={`w-full rounded-2xl border border-stone-200/90 bg-white shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08),0_2px_8px_-2px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <header className="border-b border-stone-100 pb-8 sm:pb-10">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            {category}
          </p>
          <h2 className="mt-4 font-article text-[1.65rem] sm:text-3xl lg:text-[2.15rem] font-bold leading-[1.2] tracking-tight text-stone-900">
            {p.title}
          </h2>
          <p className="mt-4 font-sans text-sm sm:text-[0.95rem] text-stone-600">
            <span className="text-stone-500">Mentors — </span>
            {mentorNamesForProblem(p)}
          </p>
        </header>

        <section className="pt-8 sm:pt-10">
          <ProblemDescriptionBody text={p.description} />
        </section>

        <footer className="mt-10 sm:mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 border-t border-stone-100 pt-8">
          <div className="font-sans text-sm text-stone-600 leading-relaxed">
            {footerMeta}
          </div>
          <div className="flex w-full justify-end sm:w-auto sm:shrink-0">{action}</div>
        </footer>
      </div>
    </article>
  );
}

export default HackathonProblemArticleCard;

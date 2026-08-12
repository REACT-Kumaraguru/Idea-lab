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
    return <p className="text-stone-500 italic">No description provided.</p>;
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
    <div className="font-sans text-xs sm:text-sm text-stone-300 leading-relaxed space-y-3">
      {blocks.map((b, idx) => {
        if (b.type === "ul") {
          return (
            <ul
              key={`ul-${idx}`}
              className="my-3 list-disc pl-6 space-y-2 marker:text-amber-400 text-stone-300"
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
          <p key={`p-${idx}`} className="my-3 first:mt-0 whitespace-pre-wrap break-words">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Full-width article-style problem card (Serene Dark Obsidian Glass).
 * @param {{ problem: object, footerMeta?: React.ReactNode, action: React.ReactNode, className?: string }} props
 */
export function HackathonProblemArticleCard({ problem, footerMeta, action, className = "" }) {
  const p = problem;
  const category = p.sector?.trim() || "Problem Statement";

  return (
    <article
      className={`w-full serene-glass-card rounded-3xl border border-amber-500/25 p-6 sm:p-8 lg:p-10 shadow-2xl text-stone-100 font-sans ${className}`}
    >
      <div>
        <header className="border-b border-amber-500/20 pb-6">
          <p className="text-[11px] font-serif uppercase tracking-[0.22em] text-amber-300 font-normal">
            {category}
          </p>
          <h2 className="mt-3 font-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-snug text-stone-100 tracking-wide">
            {p.title}
          </h2>
          <p className="mt-3 font-sans text-xs text-stone-400">
            <span>Mentors — </span>
            <span className="text-amber-300 font-semibold">{mentorNamesForProblem(p)}</span>
          </p>
        </header>

        <section className="pt-6">
          <ProblemDescriptionBody text={p.description} />
        </section>

        <footer className="mt-8 pt-6 border-t border-amber-500/20 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-sans text-xs text-stone-400 leading-relaxed">
            {footerMeta}
          </div>
          <div className="flex w-full justify-end sm:w-auto sm:shrink-0">{action}</div>
        </footer>
      </div>
    </article>
  );
}

export default HackathonProblemArticleCard;

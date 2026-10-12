import React from "react";

export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 p-6 md:p-12 animate-pulse space-y-8">
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="h-8 w-48 bg-stone-900/90 rounded-2xl border border-amber-500/20 shadow-lg" />
        <div className="flex gap-3">
          <div className="h-8 w-24 bg-stone-900/80 rounded-xl border border-amber-500/10" />
          <div className="h-8 w-24 bg-stone-900/80 rounded-xl border border-amber-500/10" />
        </div>
      </div>

      {/* Hero header skeleton */}
      <div className="serene-glass-card rounded-3xl border border-amber-500/20 p-8 space-y-4 shadow-xl">
        <div className="h-4 w-32 bg-amber-500/20 rounded-full" />
        <div className="h-10 w-3/4 max-w-xl bg-stone-800/80 rounded-2xl" />
        <div className="h-4 w-1/2 max-w-md bg-stone-800/50 rounded-xl" />
      </div>

      {/* Grid skeleton */}
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="serene-glass-card rounded-3xl border border-amber-500/15 p-6 space-y-4 shadow-md"
          >
            <div className="h-5 w-2/3 bg-stone-800/80 rounded-xl" />
            <div className="h-20 w-full bg-stone-900/70 rounded-2xl" />
            <div className="h-8 w-full bg-amber-500/10 rounded-xl border border-amber-500/20" />
          </div>
        ))}
      </div>
    </div>
  );
}

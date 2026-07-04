"use client";

import { Clock3 } from "lucide-react";
import { HoverText } from "./HoverText";
import type { TermMatcher } from "@/lib/content/matching";
import type { StudyUnit, Term } from "@/lib/content/types";

type StudyUnitViewProps = {
  unit: StudyUnit;
  matcher: TermMatcher | null;
  activeTermId?: string;
  onTermHover: (term: Term) => void;
};

export function StudyUnitView({
  unit,
  matcher,
  activeTermId,
  onTermHover,
}: StudyUnitViewProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-8 py-7">
        <div className="mb-4 flex items-center gap-3 text-sm font-medium text-slate-600">
          <span className="rounded-md bg-slate-100 px-3 py-1 text-slate-700">
            {unit.part}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock3 aria-hidden="true" size={16} />
            {unit.estimatedMinutes} min
          </span>
        </div>
        <h1 className="text-4xl font-semibold tracking-normal text-slate-950">
          {unit.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          {unit.summary}
        </p>
      </div>

      <div className="space-y-8 px-8 py-8">
        <div className="space-y-6">
          {unit.paragraphs.map((paragraph) => (
            <HoverText
              key={paragraph}
              as="p"
              text={paragraph}
              matcher={matcher}
              activeTermId={activeTermId}
              onTermHover={onTermHover}
              className="text-[1.15rem] leading-9 text-slate-800"
            />
          ))}
        </div>

        <div className="border-t border-slate-200 pt-7">
          <h2 className="text-lg font-semibold text-slate-950">
            Reading Checkpoints
          </h2>
          <ul className="mt-4 grid gap-3">
            {unit.keyTakeaways.map((takeaway) => (
              <li
                key={takeaway}
                className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-base leading-7 text-slate-700"
              >
                <HoverText
                  text={takeaway}
                  matcher={matcher}
                  activeTermId={activeTermId}
                  onTermHover={onTermHover}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

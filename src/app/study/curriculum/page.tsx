"use client";

import { useState } from "react";
import { COURSE_MAP } from "@/config/courseMap";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronDown, Map as MapIcon, Layers, Sparkles } from "lucide-react";
import { cx } from "@/lib/utils";

export default function CurriculumPage() {
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({});

  const toggleUnit = (unitName: string) => {
    setOpenUnits(prev => ({ ...prev, [unitName]: !prev[unitName] }));
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="منهج بيكر (Curriculum)"
        subtitle="تصفح الوحدات الدراسية واقرأ المادة العلمية بترتيب تفاعلي."
      />
      
      <div className="max-w-5xl mx-auto px-4 [direction:rtl]">
        <div className="flex items-center gap-3 mb-10 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
            <MapIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">الخطة الدراسية</h2>
            <p className="text-slate-500 text-sm mt-1">اضغط على أجزاء القراءة لبدء الدراسة التفاعلية.</p>
          </div>
        </div>

        <div className="space-y-6">
          {COURSE_MAP.map((unit) => {
            const isOpen = openUnits[unit.beckerUnit];
            return (
              <div key={unit.beckerUnit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
                <button 
                  onClick={() => toggleUnit(unit.beckerUnit)}
                  className="w-full text-right bg-slate-50 dark:bg-slate-800/50 px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                >
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 text-right">
                    <Layers className="text-amber-500 shrink-0" size={24} />
                    <div className="flex flex-col">
                      <span>{unit.arabicUnit}</span>
                      <span className="text-sm font-normal text-slate-500 dark:text-slate-400 mt-1 font-sans text-left ltr-content">{unit.beckerUnit}</span>
                    </div>
                  </h3>
                  <ChevronDown className={cx("text-slate-500 transition-transform duration-300", isOpen ? "rotate-180" : "")} size={20} />
                </button>
                
                <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="p-6">
                      <div className="grid gap-3">
                        {unit.modules.map(mod => {
                          const unitNumber = unit.beckerUnit.match(/Unit (\d+)/)?.[1];
                          return (
                          <div key={mod.moduleId} className="group flex flex-col p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1A1A1A] hover:border-amber-200 dark:hover:border-amber-900 hover:shadow-sm transition-all">
                            <div className="mb-4">
                              <div className="flex flex-col gap-1.5">
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2 text-right">
                                  <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded text-xs font-mono shrink-0">{mod.moduleId}</span>
                                  <span>{mod.arabicTitle}</span>
                                </h4>
                                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 pr-10 font-sans text-left ltr-content">{mod.title}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3">
                              {mod.sections.map((sec, sIdx) => (
                                <Link
                                  key={sIdx} 
                                  href={`/study/reader/${sec.gleimSourceFile}?start=${sec.pdfPageStart}&end=${sec.pdfPageEnd}`}
                                  className="flex items-center gap-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 dark:hover:border-amber-800 transition-all shadow-sm"
                                >
                                  <BookOpen size={14} className="opacity-70" />
                                  <span>{sec.gleimSourceFile} (Pages {sec.pdfPageStart} - {sec.pdfPageEnd})</span>
                                  <ChevronLeft size={14} className="opacity-50" />
                                </Link>
                              ))}
                              
                              <div className="w-full sm:w-auto sm:mr-auto mt-2 sm:mt-0">
                                <Link
                                  href={`/study/flashcards?unit=${unitNumber}&module=${mod.moduleId}`}
                                  className="flex items-center justify-center gap-2 text-sm font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-5 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white transition-all shadow-sm w-full"
                                >
                                  <Sparkles size={16} />
                                  <span>مراجعة البطاقات</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        )})}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

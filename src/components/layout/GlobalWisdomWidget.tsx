"use client";

import { useState, useEffect } from "react";
import { QURAN_VERSES, WISDOMS } from "@/config/islamicContent";
import { X, RefreshCw, Minus, GripHorizontal, Quote } from "lucide-react";
import { cx } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function GlobalWisdomWidget() {
  const [mounted, setMounted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const pathname = usePathname();

  // Dragging state
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    setIndex(Math.floor(Math.random() * QURAN_VERSES.length));
  }, []);

  const changeQuote = () => {
    setFade(false);
    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * QURAN_VERSES.length);
      while (nextIndex === index) {
        nextIndex = Math.floor(Math.random() * QURAN_VERSES.length);
      }
      setIndex(nextIndex);
      setFade(true);
    }, 500); // 500ms fade out duration
  };

  useEffect(() => {
    if (!mounted || isMinimized) return;
    const interval = setInterval(() => {
      changeQuote();
    }, 30000); // Change every 30 seconds
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isMinimized, index]); // Re-run effect if index changes so the timer resets

  // Handle Dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      // Calculate new position and keep within screen bounds roughly
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      // Basic bounds checking
      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX > window.innerWidth - 60) newX = window.innerWidth - 60; // 60px minimum visible
      if (newY > window.innerHeight - 60) newY = window.innerHeight - 60;

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, dragOffset]);

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    // Capture pointer to prevent text selection while dragging
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  if (!mounted) return null;

  // Don't show on the dashboard since it already has a massive widget for this
  if (pathname === "/dashboard") return null;

  const verse = QURAN_VERSES[index];
  const wisdom = WISDOMS[index];

  return (
    <div 
      className={cx(
        "fixed z-50 animate-in fade-in duration-700",
        isDragging ? "cursor-grabbing" : ""
      )}
      style={{ left: position.x, top: position.y, touchAction: 'none' }}
      dir="rtl"
    >
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          onPointerDown={onPointerDown}
          className="relative overflow-hidden flex items-center gap-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-md border border-slate-200 dark:border-slate-700 rounded-full py-2 px-4 hover:scale-105 transition-transform text-emerald-800 dark:text-emerald-100 font-bold text-sm cursor-grab active:cursor-grabbing"
          title="إظهار الإضاءة الروحية"
        >
          {/* Dynamic Background for Minimized */}
          <div className="absolute inset-0 pointer-events-none -z-10">
            <div className="absolute top-0 -left-4 w-12 h-12 bg-emerald-300 dark:bg-emerald-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-md opacity-60 animate-blob" />
            <div className="absolute top-0 -right-4 w-12 h-12 bg-teal-300 dark:bg-teal-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-md opacity-60 animate-blob animation-delay-2000" />
          </div>
          <Quote size={14} className="opacity-70 relative z-10" />
          <span className="relative z-10">إضاءة</span>
        </button>
      ) : (
        <div className="relative group overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 w-72 flex flex-col gap-3">
          {/* Dynamic Fluid Background for Maximized */}
          <div className="absolute inset-0 pointer-events-none -z-10">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-300 dark:bg-emerald-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-60 animate-blob" />
            <div className="absolute top-0 -right-10 w-32 h-32 bg-teal-300 dark:bg-teal-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-60 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-10 left-10 w-32 h-32 bg-sky-300 dark:bg-sky-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-60 animate-blob animation-delay-4000" />
          </div>
          
          {/* Header Controls (appear on hover) */}
          <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute top-2 left-2 right-2 z-10" dir="ltr">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsMinimized(true)} 
                className="p-1.5 rounded-full bg-slate-100/50 hover:bg-slate-200/80 dark:bg-slate-800/50 dark:hover:bg-slate-700/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="تصغير"
              >
                <Minus size={14} />
              </button>
              <button 
                onClick={changeQuote} 
                className="p-1.5 rounded-full bg-slate-100/50 hover:bg-slate-200/80 dark:bg-slate-800/50 dark:hover:bg-slate-700/80 text-slate-400 hover:text-emerald-600 transition-colors"
                title="تغيير الإضاءة"
              >
                <RefreshCw size={14} />
              </button>
            </div>
            {/* Drag Handle */}
            <div 
              onPointerDown={onPointerDown}
              className="p-1.5 rounded-full text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
              title="سحب وتحريك"
            >
              <GripHorizontal size={16} />
            </div>
          </div>

          {/* Content */}
          <div className={cx("transition-opacity duration-500 text-center mt-3 px-2 cursor-default select-none", fade ? "opacity-100" : "opacity-0")}>
            <p className="text-lg font-bold text-emerald-800 dark:text-emerald-400 leading-relaxed drop-shadow-sm font-cairo">
              ﴿ {verse} ﴾
            </p>
            <div className="w-12 h-[2px] bg-emerald-200/80 dark:bg-emerald-800/50 mx-auto my-3 rounded-full"></div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed">
              "{wisdom}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState, useEffect } from "react";
import { MoonStar, Clock, BookHeart, MapPin } from "lucide-react";
import { cx } from "@/lib/utils";

const QURAN_VERSES = [
  "إِنَّ مَعَ الْعُسْرِ يُسْرًا", "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ", "فَإِنَّكَ بِأَعْيُنِنَا", "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
  "وَاللَّهُ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ", "وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ", "ادْعُونِي أَسْتَجِبْ لَكُمْ", "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ",
  "فَاصْبِرْ صَبْرًا جَمِيلًا", "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", "سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا", "فَاذْكُرُونِي أَذْكُرْكُمْ",
  "قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا", "وَتَوَكَّلْ عَلَى اللَّهِ ۚ وَكَفَىٰ بِاللَّهِ وَكِيلًا", "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا",
  "وَاللَّهُ غَالِبٌ عَلَىٰ أَمْرِهِ", "فَسَيَكْفِيكَهُمُ اللَّهُ", "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا", "وَاصْبِرْ لِحُكْمِ رَبِّكَ",
  "وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", "وَكَفَىٰ بِاللَّهِ حَسِيبًا", "نِسَاؤُكُمْ حَرْثٌ لَّكُمْ",
  "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ", "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", "وَاللَّهُ يَدْعُو إِلَىٰ دَارِ السَّلَامِ",
  "إِنَّ رَبِّي قَرِيبٌ مُّجِيبٌ", "وَاسْتَغْفِرُوا رَبَّكُمْ ثُمَّ تُوبُوا إِلَيْهِ", "وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ", "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ",
  "وَاللَّهُ ذُو الْفَضْلِ الْعَظِيمِ", "إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ", "فَتَبَارَكَ اللَّهُ أَحْسَنُ الْخَالِقِينَ", "وَاللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ"
];

const WISDOMS = [
  "اللي يتعب النهاردة يرتاح بكرة.", "العلم نور، والجهل ظلام.", "قطرة المطر تحفر الصخر، ليس بالعنف ولكن بالتكرار.", "من جد وجد، ومن زرع حصد.",
  "الوقت كالسيف، إن لم تقطعه قطعك.", "رب همة أحيت أمة.", "مشوار الألف ميل بيبدأ بخطوة.", "النجاح بييجي للي بيسعى.",
  "الاستمرار هو مفتاح الوصول.", "اللي يصبر ينول.", "كل عسير إذا استعنت بالله فهو يسير.", "التوفيق من عند ربنا، والسعي عليك.",
  "العقل السليم في الجسم السليم.", "اطلبوا العلم من المهد إلى اللحد.", "العمل عبادة.", "على قدر أهل العزم تأتي العزائم.",
  "النجاح رحلة مش محطة.", "مفيش حلاوة من غير نار.", "اللي يخاف من العفريت يطلعله، واجه صعوباتك.", "الضربة اللي متموتش تقوي.",
  "العلم بالشئ ولا الجهل به.", "الاجتهاد بيغطي على نقص الموهبة.", "التعب منسي، بس الإنجاز بيفضل.", "عشان توصل للقمة، لازم تتسلق الجبل.",
  "ابذل المجهود وربنا هيكرمك.", "في التأني السلامة وفي العجلة الندامة.", "ركز في طريقك، مش في اللي حواليك.", "بكرة أحلى طول ما إنت بتسعى.",
  "عمر الشقي بقي، فخلي شقاك في مكان يطرح.", "المذاكرة استثمار في نفسك، ومكسبه مضمون.", "النجاح بيحب اللي بيعرق عشانه.",
  "نظم وقتك، تملك يومك.", "الفرصة بتيجي للي مستعد.", "خلي هدفك واضح، وخطوتك ثابتة."
];

type PrayerTimes = {
  Fajr: string;
  Maghrib: string;
};

export function IslamicWidget() {
  const [mounted, setMounted] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<{ cairo?: PrayerTimes, riyadh?: PrayerTimes }>({});
  
  // Calculate index based on the day of the year (rotates once every 24 hours)
  const index = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear % QURAN_VERSES.length;
  }, []);

  const verse = QURAN_VERSES[index];
  const wisdom = WISDOMS[index];

  useEffect(() => {
    setMounted(true);
    
    async function fetchPrayerTimes() {
      try {
        const [cairoRes, riyadhRes] = await Promise.all([
          fetch('https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt'),
          fetch('https://api.aladhan.com/v1/timingsByCity?city=Riyadh&country=Saudi%20Arabia')
        ]);
        const cairoData = await cairoRes.json();
        const riyadhData = await riyadhRes.json();
        setPrayerTimes({
          cairo: cairoData.data.timings,
          riyadh: riyadhData.data.timings
        });
      } catch (err) {
        console.error("Failed to fetch prayer times", err);
      }
    }
    
    fetchPrayerTimes();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1A1A] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between overflow-hidden relative group">
      
      {/* Decorative background element */}
      <div className="absolute -right-10 -top-10 text-emerald-50 dark:text-emerald-950/20 opacity-50 group-hover:scale-110 transition-transform duration-700">
        <MoonStar size={180} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-500 font-sans">
              لحظة تأمل
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
              إضاءة روحية
            </h2>
          </div>
          <BookHeart className="text-emerald-600 dark:text-emerald-500" size={28} />
        </div>

        <div className="grid gap-6 flex-1 place-content-center">
          {/* Verse of the day */}
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-5 text-center">
            {mounted ? (
              <p className="text-2xl md:text-3xl font-bold text-emerald-900 dark:text-emerald-400 leading-loose">
                ﴿ {verse} ﴾
              </p>
            ) : (
              <div className="h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded animate-pulse w-3/4 mx-auto"></div>
            )}
          </div>

          {/* Wisdom */}
          <div className="text-center px-4">
            {mounted ? (
              <p className="text-lg text-slate-700 dark:text-slate-300 font-medium italic">
                "{wisdom}"
              </p>
            ) : (
              <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-2/3 mx-auto"></div>
            )}
          </div>
        </div>
      </div>

      {/* Prayer Times Section */}
      <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/80 relative z-10 grid grid-cols-2 gap-4">
        {/* Riyadh */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <MapPin size={14} />
            <span className="text-xs font-bold uppercase tracking-wider font-sans">الرياض (افتراضي)</span>
          </div>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
             <span className="text-xs font-bold text-slate-700 dark:text-slate-300">الفجر</span>
             <span className="text-sm font-bold text-emerald-700 dark:text-emerald-500 font-sans">{prayerTimes.riyadh?.Fajr || "--:--"}</span>
          </div>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
             <span className="text-xs font-bold text-slate-700 dark:text-slate-300">المغرب</span>
             <span className="text-sm font-bold text-amber-700 dark:text-amber-500 font-sans">{prayerTimes.riyadh?.Maghrib || "--:--"}</span>
          </div>
        </div>
        
        {/* Cairo */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <MapPin size={14} />
            <span className="text-xs font-bold uppercase tracking-wider font-sans">القاهرة</span>
          </div>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
             <span className="text-xs font-bold text-slate-700 dark:text-slate-300">الفجر</span>
             <span className="text-sm font-bold text-emerald-700 dark:text-emerald-500 font-sans">{prayerTimes.cairo?.Fajr || "--:--"}</span>
          </div>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
             <span className="text-xs font-bold text-slate-700 dark:text-slate-300">المغرب</span>
             <span className="text-sm font-bold text-amber-700 dark:text-amber-500 font-sans">{prayerTimes.cairo?.Maghrib || "--:--"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

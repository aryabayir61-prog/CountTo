import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Clock, 
  Volume2, 
  Maximize2, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Sliders,
  ChevronRight,
  Play
} from 'lucide-react';
import { playThemeSound } from '../utils/audio';

export const TheBestExperienceView: React.FC = () => {
  const [activeTabDemo, setActiveTabDemo] = useState<'countTo' | 'standard'>('countTo');
  const [demoDigit, setDemoDigit] = useState<number>(19);

  // Trigger digit decrement test
  const triggerDemoTick = () => {
    setDemoDigit((prev) => (prev > 10 ? prev - 1 : 19));
  };

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  const comparisonData = [
    {
      feature: 'Rakam Değişim Fiziği',
      countTo: 'Bağımsız hane silindiri; değişmeyen basamak (örn. 1) sabit kalır, sadece değişen basamak yukarıdan aşağıya organik yaylanmayla kayar.',
      standard: 'Tüm sayı bloğu bir anda titrer veya şak diye değişir; görsel ritim bozulur.',
      isCountToBetter: true,
    },
    {
      feature: 'Ses Deneyimi & Sentez',
      countTo: 'Web Audio API ile üretilen stüdyo kalitesinde extended uzay akorları (Dm11, F#maj9); rezonanslı filtre genişlemesi ve kadife süzülüş.',
      standard: 'Kulak tırmalayan 8-bit dijital "bip" sesleri veya hiç ses desteği olmaması.',
      isCountToBetter: true,
    },
    {
      feature: 'Tam Ekran & Zen Odaklanma',
      countTo: '1 dakika hareketsizlik sonrası pürüzsüz gizlenen kontroller, saatin otomatik 42px aşağı kayarak merkeze oturması ve 3.8s sonra kaybolan zarif ipucu.',
      standard: 'Kontroller ekranı sürekli kaplar, fare imleci kaybolmaz, görsel dikkat dağılır.',
      isCountToBetter: true,
    },
    {
      feature: 'Kontrol & Menü Geçişleri',
      countTo: 'Apple/Linear tarzı Segmented Pill; sekmeler arasında tıkladığınızda kapsül fizik tabanlı yaylanmayla (layoutId) yana doğru süzülür.',
      standard: 'Statik kare butonlar; tıklandığında aniden sıçrayarak değişir.',
      isCountToBetter: true,
    },
    {
      feature: 'Görsel Temalar & Ambiyans',
      countTo: 'Aurora, Kozmik Menekşe, Siber Kor gibi 6 dinamik tema; parlama (glow) efektleri ve tema rengine canlı uyum sağlayan kapsüller.',
      standard: 'Düz, ruhsuz renk paletleri ve arka plan derinliği olmayan şablonlar.',
      isCountToBetter: true,
    },
    {
      feature: 'Performans & Akıcılık',
      countTo: 'GPU hızlandırmalı Motion animasyonları; 60 FPS pürüzsüz render ve sıfır DOM layout thrashing.',
      standard: 'Saniye değiştikçe tarayıcıyı kasan ve atlama yapan ilkel interval render döngüleri.',
      isCountToBetter: true,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-x-hidden">
      {/* Ambient background glow elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[400px] bg-purple-500/10 rounded-full blur-[130px]" />
      </div>

      {/* Top Bar with Return Home */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-xl bg-neutral-950/70 sticky top-0 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleReturnHome}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all hover:scale-105"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ana Sayfaya Dön</span>
            </button>
            <span className="text-xs text-neutral-500 hidden sm:inline">|</span>
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase hidden sm:inline">
              CountTo Deneyim Raporu
            </span>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-medium">
            Özel Deneyim İncelemesi
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-20">
        {/* HERO SECTION */}
        <section className="text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs text-neutral-300 mb-6 backdrop-blur-md shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Neden Sıradan Bir Sayaç Değil?</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.08] text-balance mb-6"
          >
            CountTo Nasıl En İyi Deneyimi Yaşatıyor?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-neutral-400 max-w-2xl leading-relaxed font-normal"
          >
            Geri sayım araçlarının %99’u zamanı sadece sayar. CountTo ise her geçen saniyeyi görsel bir ritme, sinematik bir sese ve kusursuz bir mimariye dönüştürür.
          </motion.p>
        </section>

        {/* 1. SECTION: DIGIT ROLLING ENGINE */}
        <section className="p-8 sm:p-12 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 flex flex-col gap-4">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              01 / Bağımsız Hane Fiziği
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Sayı Değil, Yalnızca Değişen Rakam Kayar
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Sıradan bir geri sayımda örneğin <strong className="text-neutral-200">19’dan 18’e</strong> düşüldüğünde bütün kutu titrer veya her iki basamak birden gereksizce yeniden çizilir.
            </p>
            <p className="text-sm text-neutral-400 leading-relaxed">
              CountTo’da her basamak kendi bağımsız düşey kanalında yaşar: <strong className="text-cyan-300 font-semibold">Sol baştaki ‘1’ milimetrik olarak sabit kalır</strong>, yalnızca değişen ‘9’ aşağıya doğru süzülerek kaybolur ve ‘8’ yukarıdan organik bir yavaşlama eğrisiyle (<code className="text-xs bg-black/40 px-2 py-0.5 rounded text-neutral-300">cubic-bezier(0.22, 1, 0.36, 1)</code>) yerine yerleşir.
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={triggerDemoTick}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs transition-all flex items-center gap-2 active:scale-95 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-neutral-950" />
                <span>Test Et: Sayıyı Düşür ({demoDigit})</span>
              </button>
            </div>
          </div>

          {/* Interactive Visual Box */}
          <div className="w-full md:w-72 p-6 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center gap-3 shadow-inner">
            <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest">
              CountTo Canlı Mekanizma
            </span>
            <div className="flex items-center text-5xl sm:text-6xl font-black font-mono-numbers text-white tracking-tight">
              {/* Digit 1 (Stable) */}
              <span className="w-10 text-center select-none text-cyan-400">
                {String(demoDigit)[0]}
              </span>
              {/* Digit 2 (Rolling) */}
              <div 
                className="relative w-10 h-20 overflow-hidden flex items-center justify-center select-none"
                style={{
                  maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={String(demoDigit)[1]}
                    initial={{ y: '-90%', opacity: 0.1, filter: 'blur(2px)' }}
                    animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: '90%', opacity: 0.1, filter: 'blur(2px)' }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {String(demoDigit)[1]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            <span className="text-[10px] text-neutral-400 text-center">
              Sol hane sabit · Sağ hane akıcı düşer
            </span>
          </div>
        </section>

        {/* 2. SECTION: WEB AUDIO ENGINE */}
        <section className="p-8 sm:p-12 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row-reverse gap-10 items-center">
          <div className="flex-1 flex flex-col gap-4">
            <span className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase">
              02 / Kozmik Web Audio Motoru
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Sıfır Bip Sesi. Yalnızca Sinematik Uzay Akorları.
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Web üzerindeki çoğu araç ya tamamen sessizdir ya da 1980’lerden kalma kulak tırmalayan yapay kare dalga bip sesleri çalar.
            </p>
            <p className="text-sm text-neutral-400 leading-relaxed">
              CountTo, Web Audio API osilatörlerini gerçek zamanlı bir polifonik sentezleyici gibi kullanır. Her tema, <strong className="text-purple-300">Dm11, F#maj9, Am9</strong> gibi zengin extended akorlarla, kadife atak süreleriyle ve açılıp kapanan rezonanslı alçak geçiren filtrelerle (filter bloom) çalınır.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => playThemeSound('violet')}
                className="px-3 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Kozmik Menekşe Dinle</span>
              </button>
              <button
                onClick={() => playThemeSound('aurora')}
                className="px-3 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Aurora Dinle</span>
              </button>
            </div>
          </div>

          <div className="w-full md:w-72 p-6 rounded-2xl bg-black/60 border border-white/10 flex flex-col gap-3 shadow-inner">
            <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest">
              Ses Spektrumu
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-neutral-400">Dalga Tipi</span>
                <span className="font-mono text-white">Yumuşak Sinüs & Üçgen</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-neutral-400">Filtreleme</span>
                <span className="font-mono text-cyan-300">Resonant Lowpass (Q: 2.6)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-neutral-400">Atak & Süzülüş</span>
                <span className="font-mono text-purple-300">140ms Atak · 1.5s Tail</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SECTION: 1-MINUTE SMART FULLSCREEN */}
        <section className="p-8 sm:p-12 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 flex flex-col gap-4">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              03 / 1 Dakikalık Akıllı Zen Tam Ekran
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Saat Aşağı Süzülür, Odaklanma Başlar
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Tam ekrana geçtiğinizde kontroller aceleyle kapanmaz; 1 dakika boyunca açık kalır. 1 dakika dolduğunda ise kontroller organik bir süzülmeyle aşağı kayıp gizlenir.
            </p>
            <p className="text-sm text-neutral-400 leading-relaxed">
              En çarpıcı detay: Kontroller kapandığında boşalan alanla beraber <strong className="text-amber-300">saat bloğu otomatik olarak 42px aşağı kayarak ekranın tam görsel merkezine oturur</strong>. Ekrana tıklamak kontrolleri geri çağırır; ipucu kapsülü ise 3.8 saniye sonra kendiliğinden kaybolur.
            </p>
          </div>

          <div className="w-full md:w-72 p-6 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center gap-4 text-center">
            <Maximize2 className="w-8 h-8 text-amber-400" />
            <div className="text-xs text-neutral-300 font-medium leading-relaxed">
              1 dk Otomatik Gizleme <br />
              +42px Pürüzsüz Merkezleme <br />
              Dokunarak Geri Açma
            </div>
          </div>
        </section>

        {/* 4. COMPREHENSIVE COMPARISON TABLE */}
        <section className="flex flex-col gap-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
              04 / Detaylı Karşılaştırma
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
              CountTo vs. Sıradan Geri Sayım Araçları
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Farkı hissedin: Standart internet sayaçları ile CountTo mimarisi arasındaki doğrudan teknik karşılaştırma.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-neutral-900/70 backdrop-blur-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-neutral-300 font-semibold">
                    <th className="py-4 px-6 w-1/4">Özellik</th>
                    <th className="py-4 px-6 w-5/12 text-cyan-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>CountTo Deneyimi</span>
                    </th>
                    <th className="py-4 px-6 w-1/3 text-neutral-400">
                      Standart / Sıradan Sayaçlar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {comparisonData.map((row, index) => (
                    <tr 
                      key={index}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-white align-top">
                        {row.feature}
                      </td>
                      <td className="py-4 px-6 text-neutral-200 align-top leading-relaxed">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{row.countTo}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-neutral-400 align-top leading-relaxed">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                          <span>{row.standard}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="text-center py-8 flex flex-col items-center gap-4">
          <p className="text-sm text-neutral-400">
            En iyi deneyimi hemen canlı olarak deneyimlemek için geri sayımınıza dönün.
          </p>
          <button
            onClick={handleReturnHome}
            className="px-8 py-3.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-black text-sm transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>CountTo Canlı Ekranına Dön</span>
          </button>
        </section>
      </main>
    </div>
  );
};

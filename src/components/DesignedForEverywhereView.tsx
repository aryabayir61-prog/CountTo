import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowLeft, 
  Tv, 
  Briefcase, 
  Home, 
  CheckCircle2, 
  XCircle,
  HelpCircle, 
  Maximize2, 
  Monitor, 
  Tablet, 
  Smartphone,
  School,
  Clock,
  Volume2,
  VolumeX,
  Eye,
  ShieldCheck,
  MousePointer,
  Zap,
  Play,
  RotateCcw,
  Sliders,
  ChevronDown,
  Layers,
  GraduationCap
} from 'lucide-react';

export const DesignedForEverywhereView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'classroom' | 'office' | 'home'>('classroom');
  const [isClassroomZenMode, setIsClassroomZenMode] = useState<boolean>(true);
  const [comparisonState, setComparisonState] = useState<'countTo' | 'ordinary'>('countTo');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Live ticking simulation inside the device preview
  const [mockSeconds, setMockSeconds] = useState<number>(42);
  const [mockMinutes, setMockMinutes] = useState<number>(38);

  useEffect(() => {
    const timer = setInterval(() => {
      setMockSeconds((prev) => {
        if (prev <= 0) {
          setMockMinutes((m) => (m > 0 ? m - 1 : 40));
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  const environments = [
    {
      id: 'classroom' as const,
      name: 'Akıllı Tahta (Sınıf)',
      icon: School,
      tag: 'Okullar & Sınavlar',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      title: 'YKS Deneme Sınavı & Blok Ders',
      subtitle: 'Arka sıradan bile kristal netliğinde okunan devasa odak paneli',
      eventTitle: '40 Dk Blok Ders & Soru Çözümü',
      deviceType: 'Vestel 4K Akıllı Tahta (86")',
    },
    {
      id: 'office' as const,
      name: 'Toplantı Odası (4K TV)',
      icon: Briefcase,
      tag: 'Ofis & Kurumsal',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      title: 'Sprint 2.4 & Lansman Teslimi',
      subtitle: 'Toplantı süresini aşmayı önleyen, şirket ciddiyetine yakışan estetik',
      eventTitle: 'Sprint Teslimine Kalan Süre',
      deviceType: 'Toplantı Odası 4K Samsung TV',
    },
    {
      id: 'home' as const,
      name: 'Masaüstü (Tablet / iPad)',
      icon: Home,
      tag: 'Ev & Çalışma Alanı',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      title: 'Kişisel Odaklanma & Hedef Panosu',
      subtitle: 'Çalışma masasında ikinci ekranda veya stanttaki tablette huzurlu süzülüş',
      eventTitle: '2027 Yeni Yıl Hedefleri',
      deviceType: 'Masa Standında iPad Pro (Ambient)',
    },
  ];

  const currentEnv = environments.find((e) => e.id === activeTab) || environments[0];

  const smartBoardFaqs = [
    {
      q: 'Öğretmenler akıllı tahtada CountTo’yu kapatır mı, yoksa açık mı tutar?',
      a: 'Öğretmenler bayılır ve tüm ders boyunca açık bırakır! Çünkü sıradan sitelerin aksine CountTo’da sıfır reklam, sıfır ticari banner ve sıfır çerez bildirimi vardır. Bir kez tam ekrana alındığında tarayıcı gibi değil, tahtanın kendi yerel işletim sistemi gibi durur. Öğretmen dersi bölen hiçbir utanç verici reklamla uğraşmaz.',
      tag: 'Sıfır Reklam Garantisi',
    },
    {
      q: 'Derste veya sınavda dikkat dağınıklığı yapar mı?',
      a: 'Aksine dikkat dağınıklığını tamamen bitirir! Yanıp sönen ışıklar, dönen süslü çarklar veya ani ses patlamaları yoktur. 1 dakika sonra kontrol butonları ve fare imleci süzülerek yok olur; saat ekranın tam ortasına iner. Sınıfa bir dijital duvar saatinin ağırbaşlılığını ve dinginliğini kazandırır.',
      tag: '1 Dk Akıllı Auto-Hide',
    },
    {
      q: '“Hocam kaç dakika kaldı?” sorusu tarihe karışır mı?',
      a: 'Öğretmenlerin en büyük kurtarıcısı tam olarak budur. Deneme sınavlarında veya 40 dakikalık ders bloklarında her 5 dakikada bir sorulan bu soru dersin ritmini yok eder. CountTo’nun devasa yüksek kontrastlı rakamları sayesinde en arka sıradaki öğrenci bile başını kaldırdığı an kalan süreyi görür, ders asla bölünmez.',
      tag: 'Arka Sıradan Net Görünürlük',
    },
    {
      q: 'Dokunmatik akıllı tahta donanımlarıyla nasıl çalışır?',
      a: 'Dokunmatik ekranlarla %100 uyumludur. Tahtanın herhangi bir yerine parmakla bir kez dokunulduğunda kontroller pürüzsüzce geri açılır. İster tahtaya tek tıkla tam ekran yapılır, ister klavyeden tek bir "F" tuşuna basılarak anında açılıp kapatılabilir.',
      tag: 'Dokunmatik & Kısayol Desteği',
    },
    {
      q: 'Projeksiyon ve farklı parlaklıktaki panellerde gözü yorar mı?',
      a: 'CountTo, derin OLED siyahı (#0a0a0a) ve gözü yormayan Aurora/Kozmik yumuşak tonlarıyla tasarlanmıştır. Karanlık sınıflarda projeksiyon ışığıyla gözleri kör etmez, aydınlık sınıflarda ise yüksek kontrastıyla pürüzsüz okunur.',
      tag: 'Göz Yormayan Gece & Gündüz Uyumu',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-emerald-500/20 selection:text-emerald-300 relative overflow-x-hidden">
      {/* Subtle Blueprint Dot Grid (Inspired by high-end design reference) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-25"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Atmospheric Ambient Glow Spheres */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Sticky Navigation Bar */}
      <header className="relative z-30 border-b border-white/10 backdrop-blur-2xl bg-neutral-950/80 sticky top-0 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleReturnHome}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ana Sayfaya Dön</span>
            </button>
            <span className="text-xs text-neutral-600 hidden sm:inline">/</span>
            <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase hidden sm:inline">
              CountTo Mekan Mimarisi
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Her Ekranda Canlı</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Showcase Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-24">
        {/* HERO SECTION WITH HIGH-CONTRAST ITALIC KEYWORD (Matching OCTOADS reference) */}
        <section className="text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs text-neutral-300 mb-6 backdrop-blur-md shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Akıllı Tahtadan Ofis Monitörüne</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.08] text-balance mb-6"
          >
            Hayatın ve sınıfların tam içinde yeni nesil{' '}
            <span className="text-emerald-400 italic underline decoration-emerald-500/30 underline-offset-8">
              odaklanan
            </span>{' '}
            bir zaman mimarisi.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-neutral-400 max-w-2xl leading-relaxed font-normal"
          >
            Akıllı tahtada öğrencileri ve hocaları büyüleyen, ofiste kurumsal ciddiyet katan ve evde dikkati dağıtmayan saf dijital zaman deneyimi.
          </motion.p>
        </section>

        {/* METRIC STATS BENTO ROW (Directly modeled after the 2M+ / 12.341 / 1.165 metric pill cards in screenshot 2!) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono-numbers tracking-tight">
              %0
            </span>
            <div className="mt-3">
              <span className="text-xs font-bold text-emerald-400 block">Sıfır Reklam & Pop-up</span>
              <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">
                Tahtayı açtığınızda asla utanç verici reklam çıkmaz.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono-numbers tracking-tight">
              60 sn
            </span>
            <div className="mt-3">
              <span className="text-xs font-bold text-cyan-400 block">Akıllı Auto-Hide</span>
              <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">
                1 dakika sonra kontroller ve imleç kendiliğinden yok olur.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono-numbers tracking-tight">
              +42px
            </span>
            <div className="mt-3">
              <span className="text-xs font-bold text-purple-400 block">Merkez Odaklanması</span>
              <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">
                Kontroller kapanınca saat ekranın tam ortasına süzülür.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono-numbers tracking-tight">
              60 FPS
            </span>
            <div className="mt-3">
              <span className="text-xs font-bold text-amber-400 block">GPU Hızlandırmalı</span>
              <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">
                Sıfır sarsıntı, bağımsız kayan milimetrik rakam akışı.
              </p>
            </div>
          </div>
        </section>

        {/* INTERACTIVE DEVICE THEATER / CANLI DONANIM MOCKUP SİMÜLATÖRÜ */}
        <section className="rounded-3xl bg-neutral-900/70 border border-white/10 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
                Canlı Donanım Simülatörü
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Her Cihazda Nasıl Görünüyor?
              </h2>
            </div>

            {/* Segmented Mode Selector Pills */}
            <div className="p-1 rounded-full bg-black/60 border border-white/10 flex items-center gap-1 self-start sm:self-auto overflow-x-auto max-w-full">
              {environments.map((env) => {
                const isSelected = activeTab === env.id;
                const IconComponent = env.icon;
                return (
                  <button
                    key={env.id}
                    onClick={() => setActiveTab(env.id)}
                    className="relative px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap focus:outline-none"
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeEverywhereTab"
                        className="absolute inset-0 rounded-full bg-white/15 border border-white/20 shadow-md"
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      />
                    )}
                    <IconComponent className={`w-3.5 h-3.5 relative z-10 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                    <span className={`relative z-10 ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
                      {env.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Hardware Frame (Simulating interactive smart board bezel) */}
          <div className="relative w-full rounded-2xl bg-black border-4 border-neutral-800 shadow-2xl p-4 sm:p-8 flex flex-col items-center justify-between min-h-[380px] sm:min-h-[460px] overflow-hidden">
            {/* Realistic Hardware Bezel Top Bar */}
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 text-[11px] text-neutral-500 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-ping" />
                <span className="text-neutral-300 font-semibold">{currentEnv.deviceType}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400">4K Ultra HD · 60Hz</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">
                  TAM EKRAN
                </span>
              </div>
            </div>

            {/* Inner Live Clock Screen */}
            <div className={`w-full flex-1 flex flex-col items-center justify-center transition-all duration-700 ${
              isClassroomZenMode ? 'translate-y-6' : 'translate-y-0'
            }`}>
              <div className="text-center mb-4">
                <span className="text-xs font-semibold text-emerald-300 tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 inline-block mb-2">
                  {currentEnv.eventTitle}
                </span>
                <h3 className="text-sm sm:text-base text-neutral-300 font-medium">
                  {currentEnv.subtitle}
                </h3>
              </div>

              {/* Live Ticking Countdown Digits */}
              <div className="flex items-center gap-3 sm:gap-6 text-4xl sm:text-7xl font-black font-mono-numbers text-white tracking-tight drop-shadow-xl select-none">
                <div className="flex flex-col items-center">
                  <span>00</span>
                  <span className="text-[10px] text-neutral-500 tracking-widest font-mono uppercase mt-1">GÜN</span>
                </div>
                <span className="text-neutral-600 -translate-y-2">:</span>
                <div className="flex flex-col items-center">
                  <span>02</span>
                  <span className="text-[10px] text-neutral-500 tracking-widest font-mono uppercase mt-1">SAAT</span>
                </div>
                <span className="text-neutral-600 -translate-y-2">:</span>
                <div className="flex flex-col items-center">
                  <span>{String(mockMinutes).padStart(2, '0')}</span>
                  <span className="text-[10px] text-neutral-500 tracking-widest font-mono uppercase mt-1">DAKİKA</span>
                </div>
                <span className="text-neutral-600 -translate-y-2">:</span>
                <div className="flex flex-col items-center text-emerald-400">
                  <motion.span
                    key={mockSeconds}
                    initial={{ y: -8, opacity: 0.3 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {String(mockSeconds).padStart(2, '0')}
                  </motion.span>
                  <span className="text-[10px] text-emerald-500/80 tracking-widest font-mono uppercase mt-1">SANİYE</span>
                </div>
              </div>
            </div>

            {/* Interactive Simulator Controls inside the Bezel */}
            <div className="w-full pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-neutral-400">
                <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simülasyon: 1 dk sonra kontroller gizlenir, saat tam merkeze oturur.</span>
              </div>

              <button
                onClick={() => setIsClassroomZenMode((prev) => !prev)}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2 active:scale-95"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isClassroomZenMode ? 'Kontrolleri Göster' : 'Zen Merkezlemeyi Test Et (+42px)'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* COMPARISON BENTO CARD (Matching the interactive side-by-side Bento in Screenshot 1!) */}
        <section className="flex flex-col gap-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
              Gerçekçi Fark
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
              Akıllı Tahtada Neden Diğer Siteler Çalışamaz?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Sınıfın önündeki dev ekranda sıradan bir web sitesi ile CountTo arasındaki uçurum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bad / Ordinary Web Countdown Card */}
            <div className="rounded-3xl border border-red-500/20 bg-neutral-900/60 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Sıradan Web Sayaçları</span>
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">Hocalar Kapatır ❌</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-3">
                  Sınıfı Dağıtan, Reklamlı Karmaşa
                </h3>

                <ul className="space-y-3 text-xs sm:text-sm text-neutral-400">
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>Tahtayı açar açmaz kumar, oyun veya kontrolsüz Google reklamları patlar; öğretmen anında kapatmak zorunda kalır.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>Fareyi bıraksanız bile ekranda kocaman butonlar, menüler ve sekmeler kalır; saatin boyutu küçücük kalır.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>Rakamlar değiştikçe bütün kutu titrer; arka sıradaki öğrencilerin gözü yorulur ve dikkati dağılır.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-[11px] text-red-300">
                Sonuç: Öğretmen "Bu siteyle uğraşılmaz" diyerek tahtayı kapatır.
              </div>
            </div>

            {/* CountTo Excellence Card */}
            <div className="rounded-3xl border border-emerald-500/30 bg-neutral-900/60 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CountTo Mimarisi</span>
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">Hocalar Açık Tutar ✓</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-3">
                  Tahtanın Yerel Sistem Parçası Gibi
                </h3>

                <ul className="space-y-3 text-xs sm:text-sm text-neutral-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Sıfır reklam, sıfır çerez uyarısı, sıfır takipçi. Bir kez açıldığında ders boyunca güvenle açık kalır.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>1 dakika hareketsizlikten sonra kontroller ve fare imleci kaybolur, saat otomatik 42px aşağı kayarak merkeze oturur.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Yalnızca değişen basamak süzülür, sol basamak sabit kalır; en arka sıradan dahi huzurla takip edilir.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-semibold">
                Sonuç: "Hocam kaç dakika kaldı?" sorusu biter, dersin odağı korunur.
              </div>
            </div>
          </div>
        </section>

        {/* 3 CORE SPACES DEEP-DIVE (Sınıf, Ofis, Ev) */}
        <section className="flex flex-col gap-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              Kullanım Alanları
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
              Her Mekana Yakışan Zarafet
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Space 1: Sınıf */}
            <div className="p-7 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit mb-4">
                  <School className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Akıllı Tahtalarda Sınıflar</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Vestel, Promethean veya Arçelik akıllı tahtalarda tek tuşla (F) tam ekran. Deneme sınavları, yazılılar ve 40 dakikalık etütlerde sınıf disiplini sağlar.
                </p>
              </div>
              <div className="text-xs text-emerald-300 font-medium">✓ Sınıfın dikkatini dağıtmaz</div>
            </div>

            {/* Space 2: Ofis */}
            <div className="p-7 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 w-fit mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Ofis & Toplantı Salonları</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Sprint bitişleri, ürün lansmanları ve müşteri sunumları. Duvara asılı 4K TV'lerde şirketin ciddiyetine ve vizyonuna yakışan minimalist duruş.
                </p>
              </div>
              <div className="text-xs text-cyan-300 font-medium">✓ Kurumsal prestij ve odaklanma</div>
            </div>

            {/* Space 3: Ev */}
            <div className="p-7 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-fit mb-4">
                  <Home className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Evde Çalışma Masası</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  YKS/KPSS hazırlanan öğrenciler veya yazılımcılar için ikinci monitörde veya stanttaki iPad'de çalışan dingin masaüstü ambiyansı.
                </p>
              </div>
              <div className="text-xs text-purple-300 font-medium">✓ Kişisel motivasyon ve sakinlik</div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE EXPANDABLE FAQ SECTION (Addressing the user's specific prompt questions) */}
        <section className="rounded-3xl bg-neutral-900/70 border border-white/10 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
                Merak Edilenler
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Akıllı Tahtalar & Kullanım Soruları
              </h2>
            </div>

            <div className="space-y-3">
              {smartBoardFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:text-emerald-300 transition-colors focus:outline-none"
                    >
                      <span className="flex items-center gap-3">
                        <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{faq.q}</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/5 space-y-2">
                            <p>{faq.a}</p>
                            <span className="inline-block text-[11px] font-semibold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                              ✓ {faq.tag}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA: RETURN HOME */}
        <section className="text-center py-6 flex flex-col items-center gap-4">
          <p className="text-sm text-neutral-400">
            Kendi ekranınızda veya akıllı tahtanızda hemen canlı deneyimleyin.
          </p>
          <button
            onClick={handleReturnHome}
            className="px-8 py-3.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-black text-sm transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>CountTo Canlı Ekranına Dön</span>
          </button>
        </section>
      </main>
    </div>
  );
};

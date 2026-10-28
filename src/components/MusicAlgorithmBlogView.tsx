import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Cpu, 
  Music, 
  Shuffle, 
  Compass, 
  Radio, 
  Users, 
  BarChart3, 
  Sliders, 
  CheckCircle2, 
  RotateCcw, 
  Volume2, 
  SkipForward, 
  Repeat, 
  Flame, 
  Zap, 
  Layers, 
  Clock, 
  Headphones,
  Info,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRESET_SONGS } from '../utils/trackConstants';

export const MusicAlgorithmBlogView: React.FC = () => {
  // Interactive Simulator States
  const [selectedSignal, setSelectedSignal] = useState<'rewind' | 'complete' | 'early_skip' | 'repeat'>('rewind');
  const [temperatureSlider, setTemperatureSlider] = useState<number>(1.15);
  const [simulatedPool, setSimulatedPool] = useState<string>('recommendations');
  const [showSoftmaxDistribution, setShowSoftmaxDistribution] = useState<boolean>(false);

  // Simulated candidate scores calculation based on temperature
  const sampleCandidates = [
    { title: 'Arada Sırada', artist: 'Ajda Pekkan', baseScore: 8.8, genre: 'Pop Nostalji' },
    { title: 'Birds Of A Feather', artist: 'Billie Eilish', baseScore: 8.2, genre: 'Alternative / Lo-Fi' },
    { title: 'Yakar Geçerim', artist: 'Ajda Pekkan', baseScore: 6.4, genre: 'Pop Nostalji (Sanatçı Aralığı Cezalı)' },
    { title: 'As It Was', artist: 'Harry Styles', baseScore: 7.5, genre: 'Indie Pop' },
    { title: 'Antidepresan', artist: 'Mert Demir', baseScore: 7.9, genre: 'Akustik / Modern' },
  ];

  const maxScore = Math.max(...sampleCandidates.map((c) => c.baseScore));
  const expScores = sampleCandidates.map((c) => Math.exp((c.baseScore - maxScore) / Math.max(0.2, temperatureSlider)));
  const sumExp = expScores.reduce((a, b) => a + b, 0);
  const probabilities = expScores.map((exp) => Math.round((exp / sumExp) * 100));

  const handleReturnToHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-[#08080b] text-neutral-200 selection:bg-cyan-500/25 selection:text-cyan-300 font-sans pb-28">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/3 w-[650px] h-[500px] bg-cyan-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 right-10 w-[600px] h-[550px] bg-purple-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-rose-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Top Sticky Navigation */}
      <header className="sticky top-0 z-30 backdrop-blur-2xl bg-[#08080b]/80 border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          type="button"
          onClick={handleReturnToHome}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Geri Sayıma Dön</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>CountTo Core Audio Lab</span>
        </div>
      </header>

      {/* Hero Header */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Müzik Öneri & Akıllı Karıştırma Mimarisi</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
          Biz sizi <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">ilk şarkınızdan</span> tanıyoruz.
        </h1>

        <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-3xl mb-8 font-normal">
          Çoğu müzik uygulaması sizi gereksiz anketlerle boğar, beğeni butonuna basmanızı bekler veya tahmin edilebilir sıkıcı listeler üretir. CountTo'da ise arkada sessizce çalışan bir sinir ağı, şarkının belirli bir bölümünü kaç kez geri sardığınızdan günün saatine kadar tüm örtük sinyalleri işler.
        </p>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl mb-14 text-center">
          <div className="flex flex-col p-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">0 ms</span>
            <span className="text-[11px] text-neutral-400 font-medium mt-1">Anlık Çözümleme</span>
          </div>
          <div className="flex flex-col p-2">
            <span className="text-2xl font-bold font-mono text-indigo-400">11 Katman</span>
            <span className="text-[11px] text-neutral-400 font-medium mt-1">Örtük Sinyal Analizi</span>
          </div>
          <div className="flex flex-col p-2">
            <span className="text-2xl font-bold font-mono text-rose-400">Torba + Softmax</span>
            <span className="text-[11px] text-neutral-400 font-medium mt-1">Akıllı Shuffle</span>
          </div>
          <div className="flex flex-col p-2">
            <span className="text-2xl font-bold font-mono text-lime-400">%100 Canlı</span>
            <span className="text-[11px] text-neutral-400 font-medium mt-1">Vercel & Hibrit Ses</span>
          </div>
        </div>

        {/* Article Content */}
        <article className="space-y-14 text-sm sm:text-base leading-relaxed text-neutral-300">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-2xl bg-cyan-500/15 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                01
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Örtük Sinyaller: Beğeni Butonuna Güvenmiyoruz
              </h2>
            </div>
            
            <p>
              İnsanlar müzik dinlerken nadiren ellerini telefona götürüp kalp veya beğeni butonuna tıklar. Beğeni verisi seyrek, yanıltıcı ve tembeldir. Bunun yerine CountTo, müziğe verdiğiniz <strong>organik ve bilinçdışı tepkileri</strong> ağırlıklandırır:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Geri Sarıp Yeniden Dinleme
                  </span>
                  <span className="font-mono bg-emerald-500/20 px-2 py-0.5 rounded-md">+8 Puan</span>
                </div>
                <p className="text-xs text-neutral-400 leading-normal">
                  Kullanıcı bir şarkının solosu veya nakaratı için timeline çubuğunda geriye sıçradıysa, o parça kullanıcının duygusal zirvesine dokunmuştur.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5" />
                    Peş Peşe Tekrar Çalma
                  </span>
                  <span className="font-mono bg-emerald-500/20 px-2 py-0.5 rounded-md">+10 Puan</span>
                </div>
                <p className="text-xs text-neutral-400 leading-normal">
                  Bir şarkı bitmeden veya biter bitmez tekrar moduna alınıyorsa bu en güçlü pozitif sinyaldir.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                  <span className="flex items-center gap-1.5">
                    <SkipForward className="w-3.5 h-3.5" />
                    İlk 5 Saniyede Atlama
                  </span>
                  <span className="font-mono bg-rose-500/20 px-2 py-0.5 rounded-md">-8 Puan</span>
                </div>
                <p className="text-xs text-neutral-400 leading-normal">
                  Giriş notasında yapılan atlama net bir reddir. Şarkı mevcut oturumda anında geri çekilir ve önceki şarkıyla olan geçiş cezalandırılır.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    30. Saniyeden Sonra Atlama
                  </span>
                  <span className="font-mono bg-amber-500/20 px-2 py-0.5 rounded-md">-1 (Nötr)</span>
                </div>
                <p className="text-xs text-neutral-400 leading-normal">
                  Yarıda kesilen şarkı nefret anlamına gelmez; kullanıcı o an aradığı enerjiyi almış veya başka bir tempoya geçmek istemiş olabilir.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-2xl bg-indigo-500/15 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                02
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Şarkıyı Sayılara Çevirme: 4 Boyutlu Ses DNA'sı
              </h2>
            </div>

            <p>
              Hiç dinlenmemiş yepyeni bir parça çıktığında geleneksel sistemler ne yapacağını bilemez çünkü elinde kullanıcı verisi yoktur. CountTo'da ise her şarkı 4 ana kaynaktan birleştirilmiş bir <strong>vektör uzayına</strong> gömülür:
            </p>

            <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col gap-3 font-mono text-xs text-neutral-300">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-cyan-300">1. Ses Vektörü (Acoustic)</span>
                <span className="text-neutral-500">Spektrogram, BPM, Enerji, Tını, Vokal Tarzı</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-indigo-300">2. Söz Vektörü (Semantic)</span>
                <span className="text-neutral-500">Şarkı sözlerinin tema, melankoli ve duygu analizi</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-purple-300">3. Kolektif Vektör (Co-listening)</span>
                <span className="text-neutral-500">"Bunu dinleyenler bunu da dinledi" graf ilişkisi</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-pink-300">4. Meta Veri & Renk Paleti</span>
                <span className="text-neutral-500">Dönem, dil, prodüksiyon ve sıvı cam renk aurası</span>
              </div>
            </div>
            <p className="text-xs text-neutral-400">
              Böylece Ajda Pekkan'ın 1980'lerdeki bir şarkısı ile günümüz modern pop tınıları arasındaki harmonik köprü saniyenin binde birinde kurulabilir.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-2xl bg-purple-500/15 text-purple-300 font-mono text-xs font-bold border border-purple-500/30">
                03
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Tek Bir Zevkiniz Yok: "Zevk Haritası" ve İki Zaman Katmanı
              </h2>
            </div>

            <p>
              Hiç kimse tek bir müzik türünün robotu değildir. Aynı kişi sabah kod yazarken lo-fi veya klasik, akşam arabada 90'lar Türk popu, sporda ise yüksek tempolu elektronik dinleyebilir. Bu yüzden sistem sizi tek bir etiketle damgalamaz; <strong>birden çok zevk kümesi</strong> tutar.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Uzun Vadeli Kimlik (Long-Term Profile)
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Aylar içinde yavaşça şekillenir. Kullanıcının sarsılmaz müzik zevkini temsil eder. Geçici heveslerle hemen bozulmaz.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Oturum Niyeti (Session Intent)
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Son 5–10 şarkıdan çıkarılan anlık ruh halidir. Çok hızlı adapte olur. Eğer kullanıcı o an melankolik bir şarkı açtıysa sistem anında o frekansa geçer.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Live Interactive Algorithm Simulator */}
          <section className="p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/15 backdrop-blur-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">İnteraktif Laboratuvar</span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  Softmax & Sıcaklık ($T$) Canlı Örneklemi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTemperatureSlider(1.15)}
                className="text-xs text-neutral-400 hover:text-white px-3 py-1 rounded-full bg-white/5 border border-white/10 transition-colors w-fit"
              >
                Varsayılana Sıfırla (1.15)
              </button>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300">
              Aşağıdaki kaydırıcıyı oynatarak algoritmanın <strong>Sıcaklık ($T$)</strong> parametresini değiştirin. $T$ düştükçe sistem sadece en yüksek puanlı şarkıya odaklanır (tahmin edilebilir akış); $T$ yükseldikçe sürpriz ve çeşitlilik payı artar.
            </p>

            {/* Slider */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Sıcaklık (T): <strong className="text-cyan-400 text-sm">{temperatureSlider.toFixed(2)}</strong></span>
                <span className="text-neutral-400">
                  {temperatureSlider < 0.8 ? '🎯 Titiz & Skor Odaklı' : temperatureSlider > 1.4 ? '🎲 Cesur & Sürprizli' : '⚖️ Mükemmel Denge'}
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.0"
                step="0.05"
                value={temperatureSlider}
                onChange={(e) => setTemperatureSlider(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>0.30 (Katı Skor)</span>
                <span>1.15 (CountTo Varsayılan)</span>
                <span>2.00 (Yüksek Çeşitlilik)</span>
              </div>
            </div>

            {/* Live Distribution Bars */}
            <div className="flex flex-col gap-2.5 pt-2">
              <span className="text-xs font-semibold text-white/80">Canlı Çalma Olasılıkları Dağılımı:</span>
              {sampleCandidates.map((cand, idx) => (
                <div key={cand.title} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white truncate">{cand.title} - <span className="text-neutral-400 text-[11px]">{cand.artist}</span></span>
                    <span className="font-mono text-cyan-300 font-bold ml-2">%{probabilities[idx]}</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                      animate={{ width: `${probabilities[idx]}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-2xl bg-teal-500/15 text-teal-300 font-mono text-xs font-bold border border-teal-500/30">
                04
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                "Bugün Sizin İçin Seçtiklerimiz": Günlük Vitrin Seti
              </h2>
            </div>

            <p>
              Sürekli akan radyodan farklı olarak bu bölüm sınırlı bir vitrindir. Kullanıcı uygulamayı açtığında <em>"bugün benim için biri oturup düşünmüş"</em> hissi vermelidir. Bu yüzden amaç en yüksek puanlı 10 şarkıyı peş peşe dizmek değil; <strong>birlikte mükemmel çalışan bir set</strong> kurmaktır.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-cyan-300 font-bold block mb-1">Güvenli Liman (3-4 Şarkı)</span>
                <p className="text-neutral-400">En güçlü zevk kümenizden, yüksek güvenle seçilen ve <em>"bu sistem beni gerçekten tanıyor"</em> dedirten çekirdek.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-indigo-300 font-bold block mb-1">Geri Dönüş (2 Şarkı)</span>
                <p className="text-neutral-400">Bir zamanlar çok dinlediğiniz ama bir süredir çalınmamış; yorgunluk eğrisi dinlenmiş favorileriniz.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-pink-300 font-bold block mb-1">Küçük Sürpriz (1 Şarkı)</span>
                <p className="text-neutral-400">Haritanızın biraz daha uzağından, düşük riskli ve müzik ufkunuzu genişleten cesur bir deneme.</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-2xl bg-emerald-500/15 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                05
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Akıllı Karıştırma (Shuffle): Saf Rastgelelik Neden Bozuk Hissettirir?
              </h2>
            </div>

            <p>
              Matematiksel olarak saf rastgele bir zar atıldığında aynı sayının peş peşe 3 kez gelmesi normaldir. Ancak bir müzik çalar aynı sanatçının iki şarkısını üst üste çaldığında kullanıcı bunu "bozuk" sayar. Bu yüzden CountTo'da <strong>insan algısına uyumlu karıştırma</strong> çalışır:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-neutral-300">
              <li>
                <strong>Torba (Bag / Hat) Mantığı:</strong> Havuzdaki tüm parçalar çalınmadan hiçbiri ikinci kez gelemez. Tur bitip torba yenilendiğinde, son çalınan şarkı yeni turun hemen başına gelmez.
              </li>
              <li>
                <strong>Sanatçı Aralığı (Artist Spacing):</strong> Aynı sanatçının iki şarkısı arasına otomatik mesafe konur.
              </li>
              <li>
                <strong>Karıştırma Kapalıysa Şarkı Durur:</strong> Karıştırma kapalıysa şarkı bitince müzik durur; odağınız bölünmez. Karıştırma açıkken akıllı akış devam eder.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              Sadelik ve Mahremiyet İlkesi
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Tüm bu öğrenme döngüsü tarayıcınızın yerel depolama alanında (`localStorage`) güvenle çalışır. Dinleme alışkanlıklarınız harici reklam ağlarına satılmaz veya üçüncü partilere aktarılmaz. CountTo, geri sayımınıza eşlik eden en yalın ve en akıllı müzik dostunuz olarak kalır.
            </p>
          </section>

        </article>

        {/* Bottom CTA */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReturnToHome}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>CountTo Geri Sayım Ekranına Dön</span>
          </button>

          <span className="text-xs text-neutral-500 font-mono">
            CountTo Music Core · Build 2026.10
          </span>
        </div>
      </main>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  Type, 
  FileText, 
  Check, 
  Palette, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  Zap,
  CalendarDays,
  Tag
} from 'lucide-react';
import { CountdownEvent, CountdownStyle, ThemeId } from '../types/countdown';
import { THEMES } from '../utils/themes';

interface CountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CountdownEvent>) => void;
  initialEvent?: CountdownEvent | null;
}

export const CountdownModal: React.FC<CountdownModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEvent,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<1 | -1>(1);

  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [style, setStyle] = useState<CountdownStyle>('countTo');
  const [theme, setTheme] = useState<ThemeId>('aurora');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<CountdownEvent['category']>('genel');
  const [showMilliseconds, setShowMilliseconds] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to format ISO to datetime-local input string YYYY-MM-DDTHH:MM
  const toLocalInputString = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${y}-${m}-${d}T${h}:${min}`;
  };

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setTargetDate(toLocalInputString(new Date(initialEvent.targetDate)));
      setStyle(initialEvent.style);
      setTheme(initialEvent.theme);
      setNotes(initialEvent.notes || '');
      setCategory(initialEvent.category || 'genel');
      setShowMilliseconds(Boolean(initialEvent.showMilliseconds));
      setStep(1);
    } else {
      // Default: 7 days from now at 12:00
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      defaultDate.setHours(12, 0, 0, 0);
      setTitle('');
      setTargetDate(toLocalInputString(defaultDate));
      setStyle('countTo');
      setTheme('aurora');
      setNotes('');
      setCategory('genel');
      setShowMilliseconds(false);
      setStep(1);
    }
    setError(null);
  }, [initialEvent, isOpen]);

  if (!isOpen) return null;

  const currentThemeConfig = THEMES[theme] || THEMES.aurora;

  // Preset date helpers
  const applyPresetTime = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(12, 0, 0, 0);
    setTargetDate(toLocalInputString(d));
    setError(null);
  };

  const applyNextNewYear = () => {
    const nextYear = new Date().getFullYear() + 1;
    const d = new Date(nextYear, 0, 1, 0, 0, 0);
    setTargetDate(toLocalInputString(d));
    setError(null);
  };

  const quickInspirations = [
    { label: '🎉 Yeni Yıl', cat: 'kutlama' as const },
    { label: '🎂 Doğum Günü', cat: 'kutlama' as const },
    { label: '🏖️ Yaz Tatili', cat: 'tatil' as const },
    { label: '🚀 Büyük Lansman', cat: 'is' as const },
    { label: '🎓 Mezuniyet', cat: 'is' as const },
    { label: '🎯 Önemli Hedef', cat: 'is' as const },
  ];

  // Navigation handlers
  const handleNextFromStep1 = () => {
    if (!title.trim()) {
      setError('Lütfen bir etkinlik veya hedef başlığı girin.');
      return;
    }
    setError(null);
    setDirection(1);
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!targetDate) {
      setError('Lütfen geçerli bir tarih ve saat seçin.');
      return;
    }
    const parsedDate = new Date(targetDate);
    if (isNaN(parsedDate.getTime())) {
      setError('Geçersiz tarih formatı.');
      return;
    }
    setError(null);
    setDirection(1);
    setStep(3);
  };

  const handleBack = () => {
    setError(null);
    setDirection(-1);
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 1));
  };

  const handleFinalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setStep(1);
      setError('Lütfen bir başlık girin.');
      return;
    }
    if (!targetDate) {
      setStep(2);
      setError('Lütfen bir tarih ve saat seçin.');
      return;
    }
    const parsedDate = new Date(targetDate);
    if (isNaN(parsedDate.getTime())) {
      setStep(2);
      setError('Geçersiz tarih formatı.');
      return;
    }

    onSave({
      ...(initialEvent ? { id: initialEvent.id } : {}),
      title: title.trim(),
      targetDate: parsedDate.toISOString(),
      style,
      theme,
      notes: notes.trim() || undefined,
      category,
      showMilliseconds,
    });
    onClose();
  };

  const stylesList: { id: CountdownStyle; name: string; desc: string }[] = [
    { id: 'countTo', name: 'CountTo (Aşağı Kayma)', desc: 'Sayılar değiştikçe aşağıya doğru akıcı kayan sayaç' },
    { id: 'flip', name: '3D Flip Kart', desc: 'Klasik mekanik katlanan yapraklar' },
    { id: 'orbital', name: 'Orbital Halka', desc: 'Sürekli dönen dairesel SVG halkaları' },
    { id: 'kinetic', name: 'Kinetik Akış', desc: 'Yukarı/aşağı esneyen dinamik sayılar' },
    { id: 'monolith', name: 'Modern Monolit', desc: 'Devasa tipografik mimari sayaç' },
  ];

  // Calculate human time difference preview for Step 2
  const getTimeDifferencePreview = () => {
    if (!targetDate) return null;
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) return 'Seçilen tarih geçmişte (geçen süre sayılacak)';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days} gün ${hours} saat ${minutes} dakika sonra`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="relative w-full max-w-xl bg-neutral-900/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl my-6 text-neutral-100 overflow-hidden"
        style={{
          boxShadow: `0 20px 50px -10px ${currentThemeConfig.glow}`,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator Header (Horizontal Stepper) */}
        <div className="mb-6 pr-8">
          <div className="flex items-center gap-2 mb-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10"
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    s <= step ? 'bg-cyan-400' : 'bg-transparent'
                  }`}
                  style={s <= step ? { backgroundColor: currentThemeConfig.primary } : undefined}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 tracking-wider uppercase">
            <span className={step === 1 ? 'text-white' : ''}>1. Başlık</span>
            <span className={step === 2 ? 'text-white' : ''}>2. Tarih & Saat</span>
            <span className={step === 3 ? 'text-white' : ''}>3. Görünüm</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Dynamic Wizard Steps with Horizontal Slide Transition */}
        <div className="relative min-h-[310px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* STEP 1: TITLE & INSPIRATION */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: direction * 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 28 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>Hadi Bir Sayaç Oluşturalım!</span>
                    <Sparkles className="w-5 h-5" style={{ color: currentThemeConfig.primary }} />
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Geri saymak istediğiniz anın adını ve amacını belirleyin.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-neutral-400" />
                    Etkinlik / Hedef Başlığı *
                  </label>
                  <input
                    type="text"
                    autoFocus
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (error) setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleNextFromStep1();
                      }
                    }}
                    placeholder="Örn: Yaz Tatili, Doğum Günü, Büyük Lansman..."
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400/80 transition-colors text-base font-medium shadow-inner"
                  />
                </div>

                {/* Quick Inspiration Pills */}
                <div>
                  <span className="block text-[11px] font-semibold text-neutral-400 mb-2">
                    Hızlı İlhamlar (Tıkla & Seç):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickInspirations.map((item, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setTitle(item.label.replace(/^[\p{Emoji}\s]+/gu, ''));
                          setCategory(item.cat);
                          if (error) setError(null);
                        }}
                        className="px-3 py-1.5 text-xs rounded-xl bg-white/5 hover:bg-white/15 text-neutral-300 border border-white/5 transition-all active:scale-95"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-neutral-400" />
                    Kategori:
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'genel', label: 'Genel' },
                      { id: 'kutlama', label: 'Kutlama' },
                      { id: 'tatil', label: 'Tatil' },
                      { id: 'is', label: 'İş / Hedef' },
                    ].map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id as CountdownEvent['category'])}
                        className={`px-3 py-1 text-xs rounded-lg transition-all font-medium ${
                          category === cat.id
                            ? 'bg-white text-neutral-950 font-bold shadow-sm'
                            : 'bg-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DATE & TIME */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: direction * 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 28 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>Saati Gir</span>
                    <Clock className="w-5 h-5 text-amber-400" />
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Geri sayımın tamamlanacağı hedef tarih ve saati belirleyin.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    Hedef Tarih ve Saat *
                  </label>
                  <input
                    type="datetime-local"
                    autoFocus
                    required
                    value={targetDate}
                    onChange={(e) => {
                      setTargetDate(e.target.value);
                      if (error) setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleNextFromStep2();
                      }
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400/80 transition-colors text-base font-mono shadow-inner"
                  />
                  {getTimeDifferencePreview() && (
                    <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{getTimeDifferencePreview()}</span>
                    </div>
                  )}
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="block text-[11px] font-semibold text-neutral-400 mb-2">
                    Hızlı Zaman Kısayolları:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPresetTime(1)}
                      className="px-3 py-1.5 text-xs rounded-xl bg-white/5 hover:bg-white/15 text-neutral-300 border border-white/5 transition-all active:scale-95"
                    >
                      +1 Gün
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetTime(7)}
                      className="px-3 py-1.5 text-xs rounded-xl bg-white/5 hover:bg-white/15 text-neutral-300 border border-white/5 transition-all active:scale-95"
                    >
                      +1 Hafta
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetTime(30)}
                      className="px-3 py-1.5 text-xs rounded-xl bg-white/5 hover:bg-white/15 text-neutral-300 border border-white/5 transition-all active:scale-95"
                    >
                      +30 Gün
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetTime(100)}
                      className="px-3 py-1.5 text-xs rounded-xl bg-white/5 hover:bg-white/15 text-neutral-300 border border-white/5 transition-all active:scale-95"
                    >
                      +100 Gün
                    </button>
                    <button
                      type="button"
                      onClick={applyNextNewYear}
                      className="px-3 py-1.5 text-xs rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/20 transition-all active:scale-95 font-semibold"
                    >
                      🎉 Yeni Yıl
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: ANIMATION STYLE, THEME & NOTES */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: direction * 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 28 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>Görünüm ve Notlar</span>
                    <Palette className="w-5 h-5 text-purple-400" />
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Animasyon stilini, renk atmosferini ve motivasyon notunuzu belirleyin.
                  </p>
                </div>

                {/* Animation Style Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                    Animasyon Stili
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {stylesList.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setStyle(item.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          style === item.id
                            ? 'border-cyan-400/80 bg-cyan-500/15 text-white shadow-md'
                            : 'border-white/10 bg-black/30 text-neutral-400 hover:border-white/20'
                        }`}
                      >
                        <div className="text-xs font-semibold text-white flex items-center justify-between">
                          <span className="truncate">{item.name.split(' ')[0]}</span>
                          {style === item.id && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                          {item.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Theme Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-neutral-400" />
                    Görsel Tema
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(THEMES) as ThemeId[]).map((tid) => {
                      const t = THEMES[tid];
                      const isSelected = theme === tid;
                      return (
                        <button
                          type="button"
                          key={tid}
                          onClick={() => setTheme(tid)}
                          className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                            isSelected
                              ? 'border-white/70 bg-white/15 text-white shadow-md'
                              : 'border-white/10 bg-black/30 text-neutral-400 hover:border-white/20'
                          }`}
                        >
                          <div
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: t.primary }}
                          />
                          <span className="text-xs truncate font-medium">{t.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes (Optional) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-neutral-400" />
                    Not / Motivasyon Sözü (İsteğe bağlı)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Örn: Sabırla beklenen her şey en güzel haliyle gelir..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400/80 transition-colors text-xs resize-none"
                  />
                </div>

                {/* Milliseconds Option */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-xs text-neutral-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Saliseyi (Milisaniye) Göster
                  </span>
                  <input
                    type="checkbox"
                    checked={showMilliseconds}
                    onChange={(e) => setShowMilliseconds(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Footer Navigation Buttons */}
          <div className="pt-6 mt-6 flex items-center justify-between border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-neutral-300 font-semibold text-xs transition-colors flex items-center gap-1.5 active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Geri</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Vazgeç
              </button>
            )}

            <div className="flex items-center gap-3">
              {step === 1 && (
                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  className="px-6 py-2.5 rounded-xl text-neutral-950 font-bold text-xs transition-all shadow-lg active:scale-95 flex items-center gap-1.5 hover:brightness-110"
                  style={{ backgroundColor: currentThemeConfig.primary }}
                >
                  <span>Saati Gir (İleri)</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={handleNextFromStep2}
                  className="px-6 py-2.5 rounded-xl text-neutral-950 font-bold text-xs transition-all shadow-lg active:scale-95 flex items-center gap-1.5 hover:brightness-110"
                  style={{ backgroundColor: currentThemeConfig.primary }}
                >
                  <span>Görünüm Seç (İleri)</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={() => handleFinalSubmit()}
                  className="px-6 py-2.5 rounded-xl text-neutral-950 font-black text-xs transition-all shadow-xl active:scale-95 flex items-center gap-1.5 hover:brightness-110"
                  style={{
                    backgroundColor: currentThemeConfig.primary,
                    boxShadow: `0 4px 20px ${currentThemeConfig.glow}`,
                  }}
                >
                  <span>{initialEvent ? 'Değişiklikleri Kaydet' : 'Sayacı Başlat 🎉'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

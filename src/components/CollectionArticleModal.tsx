import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft, Sparkles, Check, Clock, Calendar, Bookmark, CloudRain, ChevronDown } from 'lucide-react';
import { CollectionArticle } from '../data/collectionsBlog';
import { CollectionCoverArt } from './CollectionCoverArt';
import { ThemeId } from '../types/countdown';
import { THEMES } from '../utils/themes';
import { playHoverClickSound, playThemeSound } from '../utils/audio';

interface CollectionArticleModalProps {
  article: CollectionArticle | null;
  onClose: () => void;
  onApplyTheme: (themeId: ThemeId) => void;
  onBackToDisplay: () => void;
  currentTheme: ThemeId;
  isRainThemeActive?: boolean;
  onToggleRainTheme?: () => void;
}

export const CollectionArticleModal: React.FC<CollectionArticleModalProps> = ({
  article,
  onClose,
  onApplyTheme,
  onBackToDisplay,
  currentTheme,
  isRainThemeActive = false,
  onToggleRainTheme,
}) => {
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press & autofocus scroll container
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (article) {
      window.addEventListener('keydown', handleKeyDown);
      // Focus modal container so keyboard arrow keys and spacebar scroll immediately
      setTimeout(() => {
        scrollContainerRef.current?.focus();
      }, 50);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [article, onClose]);

  if (!mounted || typeof document === 'undefined') return null;

  const themeConfig = article ? THEMES[article.themeId] : null;
  const isCurrentTheme = article ? currentTheme === article.themeId : false;

  const handleApply = () => {
    if (!article) return;
    onApplyTheme(article.themeId);
    playThemeSound(article.themeId);
  };

  const handleApplyAndGo = () => {
    if (!article) return;
    onApplyTheme(article.themeId);
    playThemeSound(article.themeId);
    onClose();
    onBackToDisplay();
  };

  return createPortal(
    <AnimatePresence>
      {article && (
        <div
          id="collection-article-overlay"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-2xl"
          onClick={(e) => {
            // Dismiss when clicking outer backdrop
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          {/* Modal Window Container - with direct smooth internal scrolling */}
          <motion.div
            ref={scrollContainerRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-4xl h-[92vh] sm:h-[88vh] bg-neutral-900 border border-white/15 rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-y-auto overscroll-contain flex flex-col focus:outline-none select-text"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.2) rgba(0,0,0,0.2)',
            }}
          >
            {/* Top Sticky Bar */}
            <div className="sticky top-0 z-30 shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-neutral-900/95 backdrop-blur-xl border-b border-white/10 select-none">
              <button
                type="button"
                onClick={onClose}
                onMouseEnter={() => playHoverClickSound()}
                className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Koleksiyonlara Dön</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApply}
                  onMouseEnter={() => playHoverClickSound()}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    isCurrentTheme
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950 shadow-md'
                  }`}
                >
                  {isCurrentTheme ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Tema Seçili</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Temayı Uygula</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  onMouseEnter={() => playHoverClickSound()}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Kapat (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 pb-12">
              {/* Hero Cover Art */}
              <div className="p-4 sm:p-6 pb-0">
                <CollectionCoverArt article={article} isHero={true} />
              </div>

              {/* Article Header & Metadata */}
              <div className="px-5 sm:px-10 pt-6 pb-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mb-3 select-none">
                  <span
                    className="font-bold uppercase tracking-wider text-xs"
                    style={{ color: article.accentColor }}
                  >
                    {article.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    {article.readingTime}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                    {article.date}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                  {article.title}
                </h1>
                <p className="text-base sm:text-lg text-neutral-300 mt-2.5 font-medium leading-relaxed">
                  {article.subtitle}
                </p>

                {/* Subtle Scroll Hint */}
                <div className="flex items-center gap-1.5 text-xs text-cyan-400/80 mt-3 pt-2 font-medium select-none">
                  <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                  <span>Yazının devamı için aşağı kaydırın</span>
                </div>
              </div>

              {/* Article Text Content */}
              <div className="px-5 sm:px-10 space-y-6 text-neutral-300 text-sm sm:text-base leading-relaxed">
                {/* Lead Paragraph */}
                <p className="text-lg sm:text-xl font-medium text-white/95 leading-relaxed pt-3 border-t border-white/10">
                  {article.content.lead}
                </p>

                {/* Main Paragraphs */}
                {article.content.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-neutral-300/90 leading-relaxed text-base sm:text-lg">
                    {p}
                  </p>
                ))}

                {/* Highlight Pull-Quote */}
                {article.content.quote && (
                  <blockquote className="my-6 p-5 sm:p-6 rounded-2xl bg-white/[0.04] border-l-4 border-cyan-400 text-white italic text-base sm:text-lg shadow-inner">
                    {article.content.quote}
                  </blockquote>
                )}

                {/* Practical Pro-Tips Box */}
                <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-neutral-950/70 border border-white/10 space-y-3 select-none">
                  <div className="flex items-center gap-2 font-bold text-white text-sm sm:text-base">
                    <Bookmark className="w-4 h-4 text-cyan-400" />
                    <span>Bu Atmosferi Deneyimlemek İçin İpuçları</span>
                  </div>
                  <ul className="space-y-2.5 pt-1">
                    {article.content.proTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                          style={{ backgroundColor: article.accentColor }}
                        />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Article Action Deck */}
                {themeConfig && (
                  <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 select-none bg-neutral-950/40 p-5 rounded-2xl border">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center border border-white/20 shadow-md shrink-0"
                        style={{ backgroundColor: themeConfig.cardBg }}
                      >
                        <span
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: themeConfig.primary }}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-neutral-400">Önerilen Tema</div>
                        <div className="text-sm font-bold text-white">{themeConfig.name}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {article.id === 'yagmurlu-sonbahar-aksamlari' && onToggleRainTheme && (
                        <button
                          type="button"
                          onClick={onToggleRainTheme}
                          onMouseEnter={() => playHoverClickSound()}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            isRainThemeActive
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                              : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                          }`}
                        >
                          <CloudRain className="w-4 h-4" />
                          <span>{isRainThemeActive ? 'Yağmur Aktif' : 'Yağmur Efektini Aç'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleApplyAndGo}
                        onMouseEnter={() => playHoverClickSound()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Temayı Uygula ve Geri Sayıma Git</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

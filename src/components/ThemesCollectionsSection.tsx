import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { COLLECTION_ARTICLES, CollectionArticle } from '../data/collectionsBlog';
import { CollectionCoverArt } from './CollectionCoverArt';
import { CollectionArticleModal } from './CollectionArticleModal';
import { ThemeId } from '../types/countdown';
import { playHoverClickSound } from '../utils/audio';

interface ThemesCollectionsSectionProps {
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  onBackToDisplay: () => void;
  isRainThemeActive?: boolean;
  onToggleRainTheme?: () => void;
}

export const ThemesCollectionsSection: React.FC<ThemesCollectionsSectionProps> = ({
  currentTheme,
  onSelectTheme,
  onBackToDisplay,
  isRainThemeActive = false,
  onToggleRainTheme,
}) => {
  const [activeArticle, setActiveArticle] = useState<CollectionArticle | null>(null);

  const handleOpenArticle = (article: CollectionArticle) => {
    playHoverClickSound(0.08);
    setActiveArticle(article);
  };

  return (
    <section className="mt-12 sm:mt-16 pt-6 border-t border-white/10 select-none">
      {/* Direct Clean Grid of Blog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {COLLECTION_ARTICLES.map((article) => (
          <div
            key={article.id}
            role="button"
            tabIndex={0}
            onClick={() => handleOpenArticle(article)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenArticle(article);
              }
            }}
            onMouseEnter={() => playHoverClickSound(0.04)}
            className="group cursor-pointer rounded-3xl border border-white/10 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-white/25 p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <div>
              {/* Handcrafted Visual Cover Art */}
              <CollectionCoverArt article={article} />

              {/* Title & Summary */}
              <div className="pt-4">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-400">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: article.accentColor }}
                />
                <span className="font-medium text-white/80">{article.themeId.toUpperCase()}</span>
              </div>

              <span className="flex items-center gap-1.5 font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Yazıyı Oku</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Smooth Fullscreen Article Reader Modal */}
      <CollectionArticleModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
        onApplyTheme={onSelectTheme}
        onBackToDisplay={onBackToDisplay}
        currentTheme={currentTheme}
        isRainThemeActive={isRainThemeActive}
        onToggleRainTheme={onToggleRainTheme}
      />
    </section>
  );
};

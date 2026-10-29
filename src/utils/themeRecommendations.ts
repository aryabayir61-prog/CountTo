import { ThemeId } from '../types/countdown';
import { THEMES } from './themes';

export type ThemeCluster = 'neon' | 'cosmic' | 'warm' | 'zen';

export const THEME_CLUSTERS: Record<ThemeId, ThemeCluster> = {
  synthwave: 'neon',
  cyber: 'neon',
  matrix: 'neon',
  hyperlime: 'neon',
  cobalt: 'neon',
  tokyo: 'neon',

  violet: 'cosmic',
  nebula: 'cosmic',
  aurora: 'cosmic',
  midnight: 'cosmic',
  lavender: 'cosmic',
  deepocean: 'cosmic',
  moonlight: 'cosmic',
  amethyst: 'cosmic',

  sunset: 'warm',
  solarpunk: 'warm',
  volcano: 'warm',
  crimson: 'warm',
  gold: 'warm',
  caramel: 'warm',
  copper: 'warm',
  cherry: 'warm',
  oasis: 'warm',
  sunburst: 'warm',

  aquamarine: 'zen',
  emerald: 'zen',
  nordic: 'zen',
  sakura: 'zen',
  monochrome: 'zen',
  dustypink: 'zen',
  sage: 'zen',
  matcha: 'zen',
  eucalyptus: 'zen',
};

// Natural circadian baseline affinities across 4 diurnal phases
type DiurnalPhase = 'night' | 'morning' | 'day' | 'evening';

function getDiurnalPhase(hour: number): DiurnalPhase {
  if (hour >= 23 || hour < 5) return 'night';
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 18) return 'day';
  return 'evening';
}

const DIURNAL_CLUSTER_BASELINE: Record<DiurnalPhase, Record<ThemeCluster, number>> = {
  night: { cosmic: 25, neon: 20, zen: 18, warm: 10 },
  morning: { zen: 25, warm: 20, cosmic: 18, neon: 10 },
  day: { neon: 25, warm: 22, zen: 18, cosmic: 12 },
  evening: { warm: 25, cosmic: 22, neon: 20, zen: 15 },
};

// Cluster aesthetic compatibility matrix
const CLUSTER_AFFINITIES: Record<ThemeCluster, Record<ThemeCluster, number>> = {
  neon: { neon: 42, cosmic: 26, warm: 22, zen: 12 },
  cosmic: { cosmic: 42, neon: 26, zen: 22, warm: 16 },
  warm: { warm: 42, neon: 22, cosmic: 18, zen: 16 },
  zen: { zen: 42, cosmic: 26, warm: 16, neon: 12 },
};

// Seasonal thematic harmony based on calendar month
const SEASONAL_AFFINITIES: Record<number, Record<ThemeCluster, number>> = {
  // Winter (Dec, Jan, Feb): crisp cosmic & cold zen
  11: { cosmic: 30, zen: 24, neon: 18, warm: 12 },
  0:  { cosmic: 32, zen: 26, neon: 16, warm: 12 },
  1:  { cosmic: 28, zen: 26, neon: 18, warm: 14 },
  // Spring (Mar, Apr, May): organic zen & uplifting cosmic
  2:  { zen: 32, cosmic: 24, warm: 18, neon: 14 },
  3:  { zen: 34, cosmic: 22, warm: 20, neon: 14 },
  4:  { zen: 30, warm: 26, cosmic: 20, neon: 16 },
  // Summer (Jun, Jul, Aug): high-energy neon & warm sun
  5:  { neon: 30, warm: 28, zen: 20, cosmic: 12 },
  6:  { neon: 32, warm: 30, zen: 18, cosmic: 10 },
  7:  { warm: 30, neon: 28, zen: 20, cosmic: 12 },
  // Autumn (Sep, Oct, Nov): warm amber/copper & cozy cosmic
  8:  { warm: 32, cosmic: 24, zen: 20, neon: 14 },
  9:  { warm: 34, cosmic: 26, zen: 18, neon: 12 },
  10: { warm: 30, cosmic: 28, zen: 20, neon: 14 },
};

// Specific seasonal hero themes getting natural atmospheric resonance
const SEASONAL_HERO_THEMES: Record<number, ThemeId[]> = {
  // Autumn (Sep, Oct, Nov): Copper, Caramel, Cherry, Amethyst, Eucalyptus
  8:  ['copper', 'caramel', 'cherry', 'eucalyptus', 'sunset'],
  9:  ['copper', 'caramel', 'cherry', 'amethyst', 'volcano'],
  10: ['copper', 'caramel', 'amethyst', 'cherry', 'moonlight'],
  // Winter: Nordic, Aurora, Moonlight, Cobalt, Deep Ocean
  11: ['nordic', 'moonlight', 'aurora', 'cobalt', 'deepocean'],
  0:  ['moonlight', 'nordic', 'cobalt', 'aurora', 'monochrome'],
  1:  ['nordic', 'moonlight', 'deepocean', 'aurora', 'matrix'],
  // Spring: Matcha, Eucalyptus, Sakura, Dusty Rose, Lavender
  2:  ['matcha', 'sakura', 'eucalyptus', 'dustypink', 'lavender'],
  3:  ['matcha', 'sakura', 'eucalyptus', 'sage', 'aquamarine'],
  4:  ['matcha', 'eucalyptus', 'sage', 'emerald', 'hyperlime'],
  // Summer: Tokyo, Sunburst, Oasis, Aquamarine, Deep Ocean
  5:  ['tokyo', 'sunburst', 'oasis', 'aquamarine', 'deepocean'],
  6:  ['tokyo', 'sunburst', 'oasis', 'solarpunk', 'synthwave'],
  7:  ['sunburst', 'tokyo', 'oasis', 'deepocean', 'gold'],
};

export interface ThemeSelectionLog {
  themeId: ThemeId;
  timestamp: number;
  hour: number;        // 0..23
  dayOfWeek: number;   // 0..6 (0 = Sun, 6 = Sat)
}

export interface UserThemeProfile {
  counts: Record<string, number>;
  hourly: Record<number, Record<string, number>>;
  recentLog: ThemeSelectionLog[];
}

const STORAGE_KEY = 'countto_theme_profile_v2';
const LEGACY_STORAGE_KEY = 'countto_theme_history_v1';

/**
 * Loads the user's longitudinal taste profile from localStorage,
 * migrating legacy simple count records if present.
 */
export function getUserThemeProfile(): UserThemeProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as UserThemeProfile;
    }

    // Attempt migration from v1 simple history
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    const legacyCounts: Record<string, number> = legacyRaw ? JSON.parse(legacyRaw) : {};

    const profile: UserThemeProfile = {
      counts: legacyCounts,
      hourly: {},
      recentLog: [],
    };
    return profile;
  } catch {
    return {
      counts: {},
      hourly: {},
      recentLog: [],
    };
  }
}

/**
 * Persists the user's longitudinal taste profile with hour-of-day precision.
 */
export function saveUserThemeProfile(profile: UserThemeProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Records a theme selection with exact hour, day of week, and timestamp,
 * training the circadian recommendation engine over time.
 */
export function recordThemeSelection(themeId: ThemeId): void {
  const profile = getUserThemeProfile();
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const timestamp = Date.now();

  // 1. Increment overall count
  profile.counts[themeId] = (profile.counts[themeId] || 0) + 1;

  // 2. Increment hourly bucket for this theme
  if (!profile.hourly[hour]) {
    profile.hourly[hour] = {};
  }
  profile.hourly[hour][themeId] = (profile.hourly[hour][themeId] || 0) + 1;

  // 3. Append to recent log (kept bounded to last 120 selections)
  profile.recentLog.push({
    themeId,
    timestamp,
    hour,
    dayOfWeek,
  });
  if (profile.recentLog.length > 120) {
    profile.recentLog = profile.recentLog.slice(-120);
  }

  saveUserThemeProfile(profile);
}

// Circular hour distance (e.g. diff between 23h and 1h is 2)
function getHourDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 24 - diff);
}

// Deterministic daily hash
function dailyHash(seed: number, str: string): number {
  let hash = seed;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash % 100);
}

/**
 * Generates personalized theme recommendations that:
 * 1. Learn the user's exact hour-of-day habits (circadian preferences).
 * 2. Adapt to aesthetic cluster affinities and recent momentum.
 * 3. Rotate deterministically each day for subtle variety.
 */
export function getRecommendedThemes(currentTheme: ThemeId): ThemeId[] {
  const profile = getUserThemeProfile();
  const now = new Date();
  const currentHour = now.getHours();
  const currentPhase = getDiurnalPhase(currentHour);
  const currentCluster = THEME_CLUSTERS[currentTheme] || 'cosmic';

  const currentMonth = now.getMonth();
  const currentDayOfWeek = now.getDay();
  const isWeekendVibe = (currentDayOfWeek === 5 && currentHour >= 16) || currentDayOfWeek === 6 || currentDayOfWeek === 0;

  // Date seed for subtle daily variety (YYYYMMDD)
  const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

  const allThemes = Object.keys(THEMES) as ThemeId[];

  const scored = allThemes.map((tid) => {
    const tidCluster = THEME_CLUSTERS[tid] || 'cosmic';

    // A. Base Aesthetic Compatibility with Currently Selected Theme
    let score = CLUSTER_AFFINITIES[currentCluster][tidCluster] || 15;

    // B. Natural Diurnal / Time-of-Day Baseline
    score += DIURNAL_CLUSTER_BASELINE[currentPhase][tidCluster] || 12;

    // C. Seasonal Atmospheric Resonance (Current month climate mood)
    score += SEASONAL_AFFINITIES[currentMonth]?.[tidCluster] || 14;
    if (SEASONAL_HERO_THEMES[currentMonth]?.includes(tid)) {
      score += 12;
    }

    // D. Weekly Rhythm: Weekend celebration boost vs Weekday focus
    if (isWeekendVibe && (tidCluster === 'neon' || tidCluster === 'warm')) {
      score += 10;
    } else if (!isWeekendVibe && (tidCluster === 'zen' || tidCluster === 'cosmic')) {
      score += 8;
    }

    // C. Learned Hourly Personal Preferences (Strongest Circadian Signal)
    // Examines selections made at current hour and adjacent hours (+- 2h)
    let learnedHourlyScore = 0;
    for (let h = 0; h < 24; h++) {
      const dist = getHourDistance(currentHour, h);
      if (dist <= 2 && profile.hourly[h]) {
        const themePicksAtH = profile.hourly[h][tid] || 0;
        // Weight: exact hour = 1.0, 1h away = 0.7, 2h away = 0.4
        const weight = dist === 0 ? 1.0 : dist === 1 ? 0.7 : 0.4;
        learnedHourlyScore += themePicksAtH * 16 * weight;

        // Cluster bonus at this hour
        let clusterPicksAtH = 0;
        for (const [pastTheme, count] of Object.entries(profile.hourly[h])) {
          if (THEME_CLUSTERS[pastTheme as ThemeId] === tidCluster) {
            clusterPicksAtH += count;
          }
        }
        learnedHourlyScore += clusterPicksAtH * 4 * weight;
      }
    }
    // Cap hourly bonus to keep balance with discovery
    score += Math.min(learnedHourlyScore, 50);

    // D. General Historical Affinity & Fresh Discovery
    const totalPicksForThisTheme = profile.counts[tid] || 0;
    if (totalPicksForThisTheme === 0) {
      // Fresh discovery boost so unselected/new themes are actively suggested
      score += 15;
    } else {
      score += Math.min(totalPicksForThisTheme * 6, 25);
    }

    // E. Recency Momentum from last 14 days
    const recentWindow = 14 * 24 * 60 * 60 * 1000;
    const recentHits = profile.recentLog.filter(
      (log) => log.themeId === tid && now.getTime() - log.timestamp < recentWindow
    ).length;
    score += Math.min(recentHits * 5, 20);

    // F. Diversity Balance: Keep active theme present, but celebrate siblings
    if (tid === currentTheme) {
      score += 10;
    }

    // G. Deterministic Daily Seed Rotation
    // Changes naturally at midnight local time, keeping the taste profile locked in
    const dailyJitter = dailyHash(dateSeed, tid);
    score += (dailyJitter % 30);

    return { tid, score };
  });

  // Sort descending by total score
  scored.sort((a, b) => b.score - a.score);

  // Return the top 8 distinct, time-attuned recommended themes
  return scored.slice(0, 8).map((s) => s.tid);
}

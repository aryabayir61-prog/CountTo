import { TimeRemaining, CountdownEvent } from '../types/countdown';

export function calculateTimeRemaining(targetIso: string, createdIso: string): TimeRemaining {
  const target = new Date(targetIso).getTime();
  const created = new Date(createdIso).getTime();
  const now = Date.now();

  const diff = target - now;
  const isPast = diff <= 0;
  const absDiff = Math.abs(diff);

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
  const milliseconds = Math.floor((absDiff % 1000) / 10); // 00 - 99 for clean double-digit display

  // Calculate progress from created to target
  let progressPercent = 0;
  const totalDuration = target - created;
  if (totalDuration > 0) {
    const elapsed = now - created;
    progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  } else {
    progressPercent = isPast ? 100 : 0;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    totalMs: absDiff,
    isPast,
    progressPercent,
  };
}

export function formatLocaleDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatShortDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function getTurkishRelativeTime(targetIso: string): string {
  const target = new Date(targetIso).getTime();
  const diff = target - Date.now();
  const absDiff = Math.abs(diff);
  const isPast = diff <= 0;

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (isPast) {
    if (days > 0) return `${days} gün önce tamamlandı`;
    if (hours > 0) return `${hours} saat önce tamamlandı`;
    return 'Az önce tamamlandı';
  }

  if (days > 0) return `${days} gün kaldı`;
  if (hours > 0) return `${hours} saat kaldı`;
  return '1 saatten az kaldı';
}

/**
 * Generate starter presets
 */
export function getDefaultPresets(): CountdownEvent[] {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Next New Year (1 Jan of next year)
  const nextNewYear = new Date(currentYear + 1, 0, 1, 0, 0, 0);

  // Next Friday 18:00 (Weekend celebration)
  const nextFriday = new Date();
  const dayOfWeek = nextFriday.getDay();
  const daysUntilFriday = (5 + 7 - dayOfWeek) % 7 || 7;
  nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);
  nextFriday.setHours(18, 0, 0, 0);

  // 30 Days Milestone
  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);
  thirtyDays.setHours(12, 0, 0, 0);

  // Summer Solstice or Vacation (approx mid-summer)
  const summerTarget = new Date(currentYear + (now.getMonth() > 6 ? 1 : 0), 5, 21, 9, 0, 0);

  return [
    {
      id: 'preset-new-year',
      title: `Yeni Yıl ${currentYear + 1}`,
      targetDate: nextNewYear.toISOString(),
      createdAt: now.toISOString(),
      style: 'countTo',
      theme: 'aurora',
      notes: 'Yeni başlangıçlar, yeni hedefler ve umut dolu 365 gün.',
      category: 'kutlama',
      showMilliseconds: false,
    },
    {
      id: 'preset-weekend',
      title: 'Hafta Sonu Özgürlüğü',
      targetDate: nextFriday.toISOString(),
      createdAt: now.toISOString(),
      style: 'orbital',
      theme: 'cyber',
      notes: 'Haftanın yorgunluğunu atma zamanı yaklaşıyor.',
      category: 'tatil',
      showMilliseconds: true,
    },
    {
      id: 'preset-30days',
      title: '30 Günlük Büyük Hedef',
      targetDate: thirtyDays.toISOString(),
      createdAt: now.toISOString(),
      style: 'kinetic',
      theme: 'violet',
      notes: 'Disiplin ve odaklanma ile her gün bir adım ileri.',
      category: 'is',
      showMilliseconds: false,
    },
    {
      id: 'preset-summer',
      title: 'Yaz Sezonu & Güneş',
      targetDate: summerTarget.toISOString(),
      createdAt: now.toISOString(),
      style: 'monolith',
      theme: 'gold',
      notes: 'Deniz, kum, hafif rüzgar ve sıcacık anlar.',
      category: 'tatil',
      showMilliseconds: false,
    }
  ];
}

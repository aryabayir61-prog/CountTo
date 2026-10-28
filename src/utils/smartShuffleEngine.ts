// Smart Human-Centric Shuffle Engine
// Solves perceived randomness: Bag logic, artist spacing, transition scores, temperature-based softmax sampling
import { type SongTrack, PRESET_SONGS } from './trackConstants';

export interface TransitionStats {
  success: number;
  failure: number;
}

export class SmartShuffleEngine {
  private activePool: SongTrack[] = [...PRESET_SONGS];
  private playedInCurrentBag: Set<string> = new Set();
  private recentHistory: SongTrack[] = [];
  private sessionSuppressed: Set<string> = new Set();
  private transitionHistory: Map<string, TransitionStats> = new Map();
  private temperature: number = 1.15; // T parameter (0.5 to 1.8)

  constructor() {
    this.loadState();
  }

  private loadState() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('countto_shuffle_transitions_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        for (const [k, v] of Object.entries(parsed)) {
          this.transitionHistory.set(k, v as TransitionStats);
        }
      }
    } catch {}
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      const obj: Record<string, TransitionStats> = {};
      for (const [k, v] of this.transitionHistory.entries()) {
        obj[k] = v;
      }
      localStorage.setItem('countto_shuffle_transitions_v1', JSON.stringify(obj));
    } catch {}
  }

  /**
   * 1. Havuz kullanıcının seçtiği kaynaktır:
   * Kullanıcı nereden şarkı seçtiyse (öneriler, günlük seçki, arama, preset), havuz odur.
   */
  public setPool(pool: SongTrack[]) {
    if (!pool || pool.length === 0) return;
    this.activePool = [...pool];
    // Reset bag when pool changes
    this.playedInCurrentBag.clear();
  }

  public getPool(): SongTrack[] {
    return this.activePool;
  }

  /**
   * 6. Atlamayı ve Tamamlamayı doğru yorumlama
   */
  public recordTrackFinished(currentTrack: SongTrack, prevTrack: SongTrack | null) {
    if (prevTrack && prevTrack.id !== currentTrack.id) {
      const key = `${prevTrack.id}__${currentTrack.id}`;
      const stat = this.transitionHistory.get(key) || { success: 0, failure: 0 };
      stat.success += 1;
      this.transitionHistory.set(key, stat);
      this.saveState();
    }
    // Kullanıcı şarkıyı sonuna kadar dinledikçe T hafifçe rahatlatılır (çeşitlilik artar)
    this.temperature = Math.min(1.4, this.temperature + 0.05);
  }

  public recordTrackEarlySkip(currentTrack: SongTrack, prevTrack: SongTrack | null) {
    // İlk 5 saniyede atlama: oturumda geçici bastırma
    this.sessionSuppressed.add(currentTrack.id);

    if (prevTrack && prevTrack.id !== currentTrack.id) {
      const key = `${prevTrack.id}__${currentTrack.id}`;
      const stat = this.transitionHistory.get(key) || { success: 0, failure: 0 };
      stat.failure += 1;
      this.transitionHistory.set(key, stat);
      this.saveState();
    }

    // Atlama arttıkça T düşürülür: sistem daha dikkatli ve skor odaklı seçer
    this.temperature = Math.max(0.6, this.temperature - 0.15);
  }

  /**
   * 3 & 4. Aday şarkı için çok katmanlı skor hesaplama
   */
  private computeCandidateScore(candidate: SongTrack, currentTrack: SongTrack | null): number {
    let score = 5.0; // Temel skor

    if (currentTrack) {
      // 4. Geçiş uyumu (en önemli bileşen)
      // A. Süre / Tempo ahengi
      const durDiff = Math.abs((candidate.durationSec || 180) - (currentTrack.durationSec || 180));
      if (durDiff < 45) {
        score += 2.0;
      } else if (durDiff > 120) {
        score -= 1.0;
      }

      // B. Renk paleti / ambiyans uyumu
      if (candidate.colors && currentTrack.colors) {
        const isWarm1 = candidate.colors[0].includes('8') || candidate.colors[0].includes('e');
        const isWarm2 = currentTrack.colors[0].includes('8') || currentTrack.colors[0].includes('e');
        if (isWarm1 === isWarm2) {
          score += 1.2;
        }
      }

      // C. Kişisel geçiş geçmişi
      const key = `${currentTrack.id}__${candidate.id}`;
      const stats = this.transitionHistory.get(key);
      if (stats) {
        if (stats.success > stats.failure) {
          score += Math.min(4.0, (stats.success - stats.failure) * 1.5);
        } else if (stats.failure > stats.success) {
          score -= Math.min(5.0, (stats.failure - stats.success) * 2.0);
        }
      }

      // D. Çok benzer şarkılara hafif benzerlik tavanı cezası (karıştırma hissi ölmesin)
      if (candidate.artist.toLowerCase() === currentTrack.artist.toLowerCase()) {
        score -= 3.5;
      }
    }

    // 2. Sanatçı ve Albüm Aralığı
    const last2Artists = this.recentHistory.slice(-2).map((t) => t.artist.toLowerCase());
    if (last2Artists.includes(candidate.artist.toLowerCase())) {
      score -= this.activePool.length >= 8 ? 6.0 : 2.0;
    }

    // 4. Bağlam Uyumu (Saat/Zaman)
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 22 || currentHour < 7;
    const isMorning = currentHour >= 7 && currentHour < 12;

    if (isNight && (candidate.durationSec || 180) > 200) {
      score += 1.5; // Gece daha sakin/uzun şarkılar
    } else if (isMorning && (candidate.durationSec || 180) <= 200) {
      score += 1.5; // Sabah tempolu/canlı şarkılar
    }

    // 3. Tazelik Bonusu
    const recentIndex = this.recentHistory.findIndex((t) => t.id === candidate.id);
    if (recentIndex === -1) {
      score += 2.0; // Yakın zamanda hiç çalınmamış
    } else {
      score -= Math.max(0, 4.0 - recentIndex); // Yakınlarda çalındıysa ceza
    }

    // Geçici oturum bastırması varsa hafif ceza
    if (this.sessionSuppressed.has(candidate.id)) {
      score -= 3.0;
    }

    return score;
  }

  /**
   * 2. Torba (Bag) Mantığı & Filtreleme
   */
  private getEligibleCandidates(currentTrack: SongTrack | null): SongTrack[] {
    const pool = this.activePool.length > 0 ? this.activePool : PRESET_SONGS;

    // Küçük havuz istisnası (pool < 4)
    if (pool.length <= 3) {
      const candidates = pool.filter((t) => !currentTrack || t.id !== currentTrack.id);
      return candidates.length > 0 ? candidates : pool;
    }

    // Torba kontrolü: Havuzdaki tüm şarkılar çalındıysa torbayı boşalt
    if (this.playedInCurrentBag.size >= pool.length) {
      this.playedInCurrentBag.clear();
    }

    // Torbada henüz çalınmamış adaylar
    let candidates = pool.filter((t) => !this.playedInCurrentBag.has(t.id));

    // Çalan mevcut şarkıyı hariç tut
    if (currentTrack) {
      candidates = candidates.filter((t) => t.id !== currentTrack.id);
    }

    // Eğer torba sıfırlandıktan sonra son çalınan 1-2 şarkı varsa hemen başa gelmesin (history guard)
    if (candidates.length > 2 && this.recentHistory.length > 0) {
      const lastPlayedId = this.recentHistory[this.recentHistory.length - 1]?.id;
      if (lastPlayedId) {
        candidates = candidates.filter((t) => t.id !== lastPlayedId);
      }
    }

    // Yedek durum: aday kalmadıysa tüm havuz (mevcut hariç)
    if (candidates.length === 0) {
      this.playedInCurrentBag.clear();
      candidates = pool.filter((t) => !currentTrack || t.id !== currentTrack.id);
    }

    return candidates.length > 0 ? candidates : pool;
  }

  /**
   * 5. Olasılıksal Seçim (Softmax & Temperature Sampling)
   * Olasılık ∝ exp(skor / T)
   */
  public pickNextTrack(currentTrack: SongTrack | null): SongTrack {
    const pool = this.activePool.length > 0 ? this.activePool : PRESET_SONGS;
    if (pool.length === 1) return pool[0];

    const candidates = this.getEligibleCandidates(currentTrack);
    if (candidates.length === 1) {
      this.commitSelection(candidates[0]);
      return candidates[0];
    }

    // Her adaya skor hesapla
    const scores = candidates.map((cand) => this.computeCandidateScore(cand, currentTrack));

    // Sayısal kararlılık için max skoru çıkar
    const maxScore = Math.max(...scores);
    const T = Math.max(0.4, this.temperature);

    // Softmax üstel dağılım
    const expScores = scores.map((s) => Math.exp((s - maxScore) / T));
    const sumExp = expScores.reduce((acc, val) => acc + val, 0);

    // Olasılık dağılımından rastgele örneklem yap (Thompson / Softmax Sampling)
    let randomVal = Math.random() * sumExp;
    let selectedIndex = 0;

    for (let i = 0; i < expScores.length; i++) {
      randomVal -= expScores[i];
      if (randomVal <= 0) {
        selectedIndex = i;
        break;
      }
    }

    const selectedTrack = candidates[selectedIndex] || candidates[0];
    this.commitSelection(selectedTrack);
    return selectedTrack;
  }

  private commitSelection(track: SongTrack) {
    this.playedInCurrentBag.add(track.id);
    this.recentHistory.push(track);
    if (this.recentHistory.length > 10) {
      this.recentHistory.shift();
    }
  }

  public resetBag() {
    this.playedInCurrentBag.clear();
    this.sessionSuppressed.clear();
  }
}

export const smartShuffleEngine = new SmartShuffleEngine();

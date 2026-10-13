export interface RealWeatherNotification {
  header: string; // "CountTo Hava Durumu Bildirimi"
  message: string; // e.g. "Yağmur Birazdan Başlayacak"
  iconType: 'rain' | 'heavyRain' | 'thunder' | 'snow' | 'fog' | 'cloud' | 'sun' | 'moon';
  temperature: number;
  weatherCode: number;
}

interface Coords {
  latitude: number;
  longitude: number;
}

let cachedCoords: Coords | null = null;
let lastWeatherNotification: RealWeatherNotification | null = null;
let lastFetchedTime = 0;

/**
 * Requests browser geolocation permission on startup,
 * and falls back to real IP-based geolocation if denied or unavailable.
 * Zero mock data guaranteed.
 */
export async function getRealUserCoordinates(): Promise<Coords | null> {
  if (cachedCoords) {
    return cachedCoords;
  }

  // 1. Try native browser geolocation (this will prompt the user for permission)
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 9000,
          maximumAge: 300000,
          enableHighAccuracy: false,
        });
      });

      cachedCoords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      return cachedCoords;
    } catch {
      // User denied or timed out, gracefully fallback to real IP geolocation
    }
  }

  // 2. Real fallback: GeoJS or IP-API to retrieve genuine real coordinates
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        cachedCoords = {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
        };
        return cachedCoords;
      }
    }
  } catch {
    // If first ip provider fails, try secondary real ip provider
    try {
      const res2 = await fetch('https://ipwho.is/');
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.latitude && data2.longitude) {
          cachedCoords = {
            latitude: data2.latitude,
            longitude: data2.longitude,
          };
          return cachedCoords;
        }
      }
    } catch {
      // Network failure
    }
  }

  return null;
}

/**
 * Fetches 100% genuine real-time weather and precipitation forecast from Open-Meteo
 */
export async function fetchRealWeather(): Promise<RealWeatherNotification | null> {
  const now = Date.now();
  // Return cached result if fetched within the last 5 minutes
  if (lastWeatherNotification && now - lastFetchedTime < 5 * 60 * 1000) {
    return lastWeatherNotification;
  }

  const coords = await getRealUserCoordinates();
  if (!coords) return null;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,precipitation,rain,showers,snowfall,weather_code,cloud_cover&hourly=precipitation_probability,precipitation,weather_code&forecast_days=1&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const current = data.current;
    const hourly = data.hourly;

    if (!current) return null;

    const temp = Math.round(current.temperature_2m ?? 20);
    const code = current.weather_code ?? 0;
    const precipitation = current.precipitation ?? 0;
    const currentHourIndex = new Date().getHours();

    // Check next 2 hours precipitation probability and precipitation
    const nextHourProb = hourly?.precipitation_probability?.[currentHourIndex + 1] ?? 0;
    const nextHourPrecip = hourly?.precipitation?.[currentHourIndex + 1] ?? 0;
    const secondHourProb = hourly?.precipitation_probability?.[currentHourIndex + 2] ?? 0;

    let message = 'Hava Açık ve Berrak';
    let iconType: RealWeatherNotification['iconType'] = 'sun';

    // 1. Imminent Rain Detection (Rain starting shortly)
    if (precipitation === 0 && (nextHourProb >= 40 || nextHourPrecip >= 0.2 || secondHourProb >= 50)) {
      message = 'Yağmur Birazdan Başlayacak';
      iconType = 'rain';
    }
    // 2. Heavy Rain or Severe Showers
    else if (code === 65 || code === 82 || precipitation >= 3.0 || nextHourPrecip >= 4.0) {
      message = 'Yoğun Yağmur Bekleniyor';
      iconType = 'heavyRain';
    }
    // 3. Thunderstorm
    else if (code === 95 || code === 96 || code === 99) {
      message = 'Gök Gürültülü Fırtına';
      iconType = 'thunder';
    }
    // 4. Snow
    else if (code >= 71 && code <= 77 || code === 85 || code === 86 || (current.snowfall ?? 0) > 0) {
      message = 'Kar Yağışı Bekleniyor';
      iconType = 'snow';
    }
    // 5. Active Rain or Showers
    else if (precipitation > 0 || (code >= 61 && code <= 63) || code === 80 || code === 81) {
      message = precipitation >= 1.5 ? 'Yağmur Yağışı Etkili' : 'Hafif Yağmur Çiseliyor';
      iconType = 'rain';
    }
    // 6. Drizzle
    else if (code >= 51 && code <= 57) {
      message = 'Çiseleyen Yağmur';
      iconType = 'rain';
    }
    // 7. Fog
    else if (code === 45 || code === 48) {
      message = 'Puslu ve Sisli Hava';
      iconType = 'fog';
    }
    // 8. Overcast / Cloudy
    else if (code === 2 || code === 3 || (current.cloud_cover ?? 0) >= 70) {
      message = 'Bulutlu Bir Gökyüzü';
      iconType = 'cloud';
    }
    // 9. Clear / Sunny
    else {
      const hour = new Date().getHours();
      const isNight = hour >= 21 || hour < 6;
      if (isNight) {
        message = 'Açık ve Berrak Gece';
        iconType = 'moon';
      } else {
        message = 'Açık ve Güneşli';
        iconType = 'sun';
      }
    }

    const notification: RealWeatherNotification = {
      header: 'CountTo Hava Durumu Bildirimi',
      message,
      iconType,
      temperature: temp,
      weatherCode: code,
    };

    lastWeatherNotification = notification;
    lastFetchedTime = now;
    return notification;
  } catch {
    return null;
  }
}

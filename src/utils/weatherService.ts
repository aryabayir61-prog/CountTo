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
export async function fetchRealWeather(forceRefresh = false): Promise<RealWeatherNotification | null> {
  const now = Date.now();
  // Return cached result if fetched within the last 2.5 minutes (unless forceRefresh)
  if (!forceRefresh && lastWeatherNotification && now - lastFetchedTime < 2.5 * 60 * 1000) {
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

    // Check next 3 hours forecast for proactive real-time warnings
    const nextHourProb = hourly?.precipitation_probability?.[currentHourIndex + 1] ?? 0;
    const nextHourPrecip = hourly?.precipitation?.[currentHourIndex + 1] ?? 0;
    const nextHourCode = hourly?.weather_code?.[currentHourIndex + 1] ?? code;

    const secondHourProb = hourly?.precipitation_probability?.[currentHourIndex + 2] ?? 0;
    const secondHourPrecip = hourly?.precipitation?.[currentHourIndex + 2] ?? 0;
    const secondHourCode = hourly?.weather_code?.[currentHourIndex + 2] ?? code;

    let message = 'Hava Açık ve Berrak';
    let iconType: RealWeatherNotification['iconType'] = 'sun';

    const isCurrentlyRaining = precipitation > 0 || (code >= 51 && code <= 65) || (code >= 80 && code <= 82);

    // 1. Thunderstorm incoming or active
    if (
      code === 95 || code === 96 || code === 99 ||
      nextHourCode === 95 || nextHourCode === 96 || nextHourCode === 99
    ) {
      message = 'Gök Gürültülü Fırtına Bekleniyor';
      iconType = 'thunder';
    }
    // 2. Snow incoming or active
    else if (
      (code >= 71 && code <= 77) || code === 85 || code === 86 ||
      (nextHourCode >= 71 && nextHourCode <= 77) ||
      (current.snowfall ?? 0) > 0
    ) {
      message = 'Kar Yağışı Bekleniyor';
      iconType = 'snow';
    }
    // 3. Active Rain Intelligence (Detecting if rain is speeding up or clearing)
    else if (isCurrentlyRaining) {
      if (nextHourPrecip > precipitation * 1.25 || nextHourPrecip >= 2.0 || nextHourCode === 65 || nextHourCode === 82) {
        message = 'Yağan Yağmur, Daha da Hızlanacak';
        iconType = 'heavyRain';
      } else if (precipitation >= 2.5) {
        message = 'Şiddetli Yağmur Etkili';
        iconType = 'heavyRain';
      } else if (nextHourPrecip < precipitation * 0.45 && nextHourProb < 40) {
        message = 'Yağan Yağmur, Yakında Diniyor';
        iconType = 'rain';
      } else {
        message = precipitation >= 1.0 ? 'Yağmur Yağışı Etkili' : 'Hafif Yağmur Çiseliyor';
        iconType = 'rain';
      }
    }
    // 4. Imminent Severe / Heavy Rain Forecast (Dry right now, but heavy rain arriving)
    else if (
      nextHourCode === 65 || nextHourCode === 82 ||
      secondHourCode === 65 || secondHourCode === 82 ||
      nextHourPrecip >= 2.2 || secondHourPrecip >= 2.8
    ) {
      message = 'Şiddetli Yağmur Bekleniyor';
      iconType = 'heavyRain';
    }
    // 5. Imminent Rain Starting Shortly (Dry right now, rain arriving in 1-2 hours)
    else if (nextHourProb >= 35 || nextHourPrecip >= 0.2 || secondHourProb >= 50) {
      message = 'Yağmur Birazdan Başlayacak';
      iconType = 'rain';
    }
    // 6. Fog / Mist
    else if (code === 45 || code === 48) {
      message = 'Puslu ve Sisli Hava';
      iconType = 'fog';
    }
    // 7. Overcast / Cloudy
    else if (code === 2 || code === 3 || (current.cloud_cover ?? 0) >= 70) {
      message = 'Bulutlu Bir Gökyüzü';
      iconType = 'cloud';
    }
    // 8. Clear / Sunny
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

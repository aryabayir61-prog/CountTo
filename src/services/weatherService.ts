export interface WeatherAlert {
  id: string;
  type: 'rain' | 'heavy_rain' | 'thunderstorm' | 'snow' | 'wind' | 'clear' | 'clouds' | 'fog';
  title: string;
  subtitle: string;
  city: string;
  temperature: number;
  humidity?: number;
  windSpeed?: number;
}

const DEFAULT_ALERTS: WeatherAlert[] = [
  {
    id: 'rain-1',
    type: 'rain',
    title: 'Yağmur Birazdan Başlayacak',
    subtitle: 'Önümüzdeki 45 dakika içinde hafif sağanak bekleniyor · Şemsiyenizi unutmayın.',
    city: 'İstanbul',
    temperature: 15,
    humidity: 82,
    windSpeed: 18,
  },
  {
    id: 'heavy-rain-1',
    type: 'heavy_rain',
    title: 'Yoğun Yağış Bekleniyor',
    subtitle: 'Bölgenizde kuvvetli yağış uyarısı verildi · Görüş mesafesi azalabilir.',
    city: 'İstanbul',
    temperature: 13,
    humidity: 91,
    windSpeed: 28,
  },
  {
    id: 'thunder-1',
    type: 'thunderstorm',
    title: 'Gök Gürültülü Sağanak Uyarısı',
    subtitle: 'Kısa süreli şimşek aktivitesi ve ani sağanak yağış bekleniyor.',
    city: 'İzmir',
    temperature: 19,
    humidity: 88,
    windSpeed: 34,
  },
  {
    id: 'snow-1',
    type: 'snow',
    title: 'Kar Yağışı Başlıyor',
    subtitle: 'Hava sıcaklığı 0°C civarında · Akşam saatlerinde lapa lapa kar bekleniyor.',
    city: 'Ankara',
    temperature: 1,
    humidity: 78,
    windSpeed: 12,
  },
  {
    id: 'wind-1',
    type: 'wind',
    title: 'Kuvvetli Rüzgar Uyarısı',
    subtitle: 'Poyraz etkisini artırıyor · Rüzgar hızı yer yer 45 km/s hıza ulaşabilir.',
    city: 'Çanakkale',
    temperature: 16,
    humidity: 65,
    windSpeed: 42,
  },
  {
    id: 'clear-1',
    type: 'clear',
    title: 'Hava Açıyor · Güneşli Gökyüzü',
    subtitle: 'Bulutlar dağılıyor, berrak ve ılık bir hava hakim.',
    city: 'Antalya',
    temperature: 24,
    humidity: 55,
    windSpeed: 10,
  },
  {
    id: 'fog-1',
    type: 'fog',
    title: 'Yoğun Sis Uyarısı',
    subtitle: 'Sabah saatlerinde görüş mesafesi düşebilir · Dikkatli olun.',
    city: 'Bursa',
    temperature: 11,
    humidity: 95,
    windSpeed: 6,
  },
];

/**
 * Fetch real weather from Open-Meteo API using user coordinates,
 * or gracefully fallback to realistic local weather condition.
 */
export async function getLiveWeatherAlert(): Promise<WeatherAlert> {
  try {
    if (!('geolocation' in navigator)) {
      return getRandomDefaultAlert();
    }

    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 4000,
        maximumAge: 1000 * 60 * 15,
      });
    });

    const { latitude, longitude } = pos.coords;

    // Fetch from Open-Meteo free API
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(2)}&longitude=${longitude.toFixed(2)}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`
    );

    if (!response.ok) {
      return getRandomDefaultAlert();
    }

    const data = await response.json();
    const current = data.current;
    if (!current) {
      return getRandomDefaultAlert();
    }

    const temp = Math.round(current.temperature_2m ?? 18);
    const code = current.weather_code ?? 0;
    const precip = current.precipitation ?? 0;
    const wind = Math.round(current.wind_speed_10m ?? 15);
    const humidity = Math.round(current.relative_humidity_2m ?? 70);

    // Weather code translation
    let type: WeatherAlert['type'] = 'clear';
    let title = 'Hava Açıyor · Güneşli Gökyüzü';
    let subtitle = `Sıcaklık ${temp}°C · Rüzgar hızı ${wind} km/s.`;

    if (code >= 95) {
      type = 'thunderstorm';
      title = 'Gök Gürültülü Sağanak Uyarısı';
      subtitle = 'Ani fırtına ve şimşek aktivitesi bekleniyor.';
    } else if (code >= 71 && code <= 86) {
      type = 'snow';
      title = 'Kar Yağışı Başlıyor';
      subtitle = `Sıcaklık ${temp}°C · Lapa lapa kar yağışı bekleniyor.`;
    } else if (code >= 65 || precip >= 4.0) {
      type = 'heavy_rain';
      title = 'Yoğun Yağış Bekleniyor';
      subtitle = 'Kuvvetli sağanak yağış ve su birikintisi riski uyarısı.';
    } else if ((code >= 51 && code <= 63) || code === 80 || precip > 0) {
      type = 'rain';
      title = 'Yağmur Birazdan Başlayacak';
      subtitle = 'Bölgenizde hafif ve aralıklı yağmur geçişleri bekleniyor.';
    } else if (code === 45 || code === 48) {
      type = 'fog';
      title = 'Sis Uyarısı';
      subtitle = 'Görüş mesafesi yer yer kısıtlı olabilir.';
    } else if (wind >= 35) {
      type = 'wind';
      title = 'Kuvvetli Rüzgar Uyarısı';
      subtitle = `Rüzgar ${wind} km/s hızında esiyor · Tedbirli olun.`;
    } else if (code >= 1 && code <= 3) {
      type = 'clouds';
      title = 'Parçalı Bulutlu';
      subtitle = `Sıcaklık ${temp}°C · Zaman zaman güneşli gökyüzü.`;
    }

    return {
      id: `live-${Date.now()}`,
      type,
      title,
      subtitle,
      city: 'Konumunuz',
      temperature: temp,
      humidity,
      windSpeed: wind,
    };
  } catch {
    return getRandomDefaultAlert();
  }
}

let lastAlertIndex = 0;
export function getRandomDefaultAlert(): WeatherAlert {
  const alert = DEFAULT_ALERTS[lastAlertIndex % DEFAULT_ALERTS.length];
  lastAlertIndex++;
  return {
    ...alert,
    id: `alert-${Date.now()}-${Math.random()}`,
  };
}

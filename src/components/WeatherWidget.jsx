import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './WeatherWidget.module.css';

const DEFAULT_LOCATIONS = [
  { name: 'Gurugram, HR', lat: 28.4595, lon: 77.0266 },
  { name: 'Puri, Odisha', lat: 19.8135, lon: 85.8312 },
];

const WEATHER_ACCENTS = {
  sun: {
    accent: '#C28A1E',
    badgeGrad: 'linear-gradient(150deg, #FFE9B0, #F3C765)',
    bandGrad: 'linear-gradient(180deg, #FFF3D0, transparent)',
    pillBg: '#FBF0D6',
  },
  cloud: {
    accent: '#6E7A8A',
    badgeGrad: 'linear-gradient(150deg, #EAF0F5, #C9D6E0)',
    bandGrad: 'linear-gradient(180deg, #EBF1F6, transparent)',
    pillBg: '#EAF0F5',
  },
  rain: {
    accent: '#2C6FA8',
    badgeGrad: 'linear-gradient(150deg, #D6E9FA, #9FC8EA)',
    bandGrad: 'linear-gradient(180deg, #E3F1FC, transparent)',
    pillBg: '#E3F1FC',
  },
};

const WMO = {
  0: ['☀️', 'Clear sky'],
  1: ['🌤️', 'Mainly clear'],
  2: ['⛅', 'Partly cloudy'],
  3: ['☁️', 'Overcast'],
  45: ['🌫️', 'Fog'],
  48: ['🌫️', 'Rime fog'],
  51: ['🌦️', 'Light drizzle'],
  53: ['🌦️', 'Drizzle'],
  55: ['🌦️', 'Heavy drizzle'],
  61: ['🌧️', 'Light rain'],
  63: ['🌧️', 'Rain'],
  65: ['🌧️', 'Heavy rain'],
  80: ['🌦️', 'Rain showers'],
  81: ['🌧️', 'Heavy showers'],
  82: ['⛈️', 'Violent showers'],
  95: ['⛈️', 'Thunderstorm'],
  96: ['⛈️', 'Thunderstorm with hail'],
  99: ['⛈️', 'Thunderstorm with hail'],
};

const FALLBACK_WEATHER = {
  'Gurugram, HR': {
    temp: 34,
    humidity: 48,
    windSpeed: 11,
    weatherCode: 0,
    emoji: '☀️',
    condition: 'Clear sky',
    localTime: '',
  },
  'Puri, Odisha': {
    temp: 30,
    humidity: 76,
    windSpeed: 18,
    weatherCode: 2,
    emoji: '⛅',
    condition: 'Partly cloudy',
    localTime: '',
  },
};

function toneForCode(code) {
  if ([0, 1].includes(code)) return WEATHER_ACCENTS.sun;
  if ([2, 3, 45, 48].includes(code)) return WEATHER_ACCENTS.cloud;
  return WEATHER_ACCENTS.rain;
}

function mapWeatherCode(code) {
  return WMO[code] ?? ['🌡️', '—'];
}

function getFallback(name) {
  return FALLBACK_WEATHER[name] ?? {
    temp: 28,
    humidity: 50,
    windSpeed: 10,
    weatherCode: 3,
    emoji: '🌡️',
    condition: '—',
    localTime: '',
  };
}

function formatLocalTime(isoTime) {
  if (!isoTime) return '';
  try {
    const formatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(isoTime));
    return `${formatted} IST`;
  } catch {
    return '';
  }
}

async function fetchLocationWeather(location) {
  const params = new URLSearchParams({
    latitude: String(location.lat),
    longitude: String(location.lon),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
    timezone: 'auto',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) {
    throw new Error(`Weather fetch failed (${response.status})`);
  }

  const data = await response.json();
  const current = data.current ?? {};
  const weatherCode = current.weather_code ?? 3;
  const [emoji, condition] = mapWeatherCode(weatherCode);

  return {
    temp: Math.round(current.temperature_2m ?? getFallback(location.name).temp),
    humidity: Math.round(current.relative_humidity_2m ?? getFallback(location.name).humidity),
    windSpeed: Math.round(current.wind_speed_10m ?? getFallback(location.name).windSpeed),
    weatherCode,
    emoji,
    condition,
    localTime: formatLocalTime(current.time),
  };
}

function WeatherTileSkeleton({ locationName }) {
  return (
    <article
      className={styles.tile}
      aria-busy="true"
      aria-label={`Loading weather for ${locationName}`}
    >
      <div className={`${styles.band} ${styles.bandSkeleton}`} aria-hidden="true" />
      <div className={styles.tileInner}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonPlace}`} aria-hidden="true" />
        <div className={`${styles.skeletonBlock} ${styles.skeletonTime}`} aria-hidden="true" />
        <div className={`${styles.skeletonBlock} ${styles.skeletonBadge}`} aria-hidden="true" />
        <div className={`${styles.skeletonBlock} ${styles.skeletonTemp}`} aria-hidden="true" />
        <div className={`${styles.skeletonBlock} ${styles.skeletonPill}`} aria-hidden="true" />
        <div className={`${styles.skeletonBlock} ${styles.skeletonStats}`} aria-hidden="true" />
      </div>
    </article>
  );
}

function WeatherTile({ location, weather }) {
  const accent = toneForCode(weather.weatherCode ?? 3);

  return (
    <article className={styles.tile} aria-label={`Weather in ${location.name}`}>
      <div
        className={styles.band}
        style={{ background: accent.bandGrad }}
        aria-hidden="true"
      />
      <div className={styles.tileInner}>
        <p className={styles.placeName}>{location.name}</p>
        {weather.localTime ? (
          <p className={styles.localTime} aria-label={`Local time in ${location.name}`}>
            {weather.localTime}
          </p>
        ) : (
          <p className={styles.localTime} aria-hidden="true">&nbsp;</p>
        )}

        <div
          className={styles.iconBadge}
          style={{
            background: accent.badgeGrad,
            boxShadow: `0 6px 14px -6px ${accent.accent}`,
          }}
        >
          <span className={styles.emoji} role="img" aria-label={weather.condition}>
            {weather.emoji}
          </span>
        </div>

        <div className={styles.tempRow}>
          <span className={styles.tempNum}>{weather.temp}</span>
          <span className={styles.tempUnit}>°C</span>
        </div>

        <span
          className={styles.pill}
          style={{ background: accent.pillBg, color: accent.accent }}
        >
          {weather.condition}
        </span>

        <div className={styles.stats}>
          <span aria-label={`Humidity ${weather.humidity} percent`}>
            💧 {weather.humidity}%
          </span>
          <span className={styles.statDivider} aria-hidden="true" />
          <span aria-label={`Wind speed ${weather.windSpeed} kilometers per hour`}>
            🌬 {weather.windSpeed} km/h
          </span>
        </div>
      </div>
    </article>
  );
}

export default function WeatherWidget({
  title = 'Weather along the yatra',
  locations = DEFAULT_LOCATIONS,
  refreshMinutes = 10,
}) {
  const [weatherByName, setWeatherByName] = useState({});
  const [loading, setLoading] = useState(true);
  const [usingCache, setUsingCache] = useState(false);

  const locationKey = useMemo(
    () => locations.map((loc) => `${loc.name}:${loc.lat}:${loc.lon}`).join('|'),
    [locations],
  );

  const loadWeather = useCallback(async () => {
    setLoading(true);

    try {
      const results = await Promise.all(
        locations.map(async (location) => {
          const weather = await fetchLocationWeather(location);
          return [location.name, weather];
        }),
      );

      setWeatherByName(Object.fromEntries(results));
      setUsingCache(false);
    } catch {
      setWeatherByName((prev) => {
        const next = Object.fromEntries(
          locations.map((location) => [
            location.name,
            prev[location.name] ?? getFallback(location.name),
          ]),
        );
        return next;
      });
      setUsingCache(true);
    } finally {
      setLoading(false);
    }
  }, [locations]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather, locationKey]);

  useEffect(() => {
    if (refreshMinutes <= 0) return undefined;

    const intervalMs = refreshMinutes * 60 * 1000;
    const timer = setInterval(loadWeather, intervalMs);
    return () => clearInterval(timer);
  }, [loadWeather, refreshMinutes, locationKey]);

  return (
    <section className={styles.card} aria-label={title}>
      <div className={styles.eyebrowRow}>
        <span className={styles.liveDot} aria-hidden="true">
          <span className={styles.liveDotPulse} />
        </span>
        <p className={styles.eyebrow}>{title}</p>
      </div>

      {usingCache ? (
        <p className={styles.cachedNote}>(showing last known)</p>
      ) : null}

      <div className={styles.grid}>
        {locations.map((location) => (
          loading ? (
            <WeatherTileSkeleton key={location.name} locationName={location.name} />
          ) : (
            <WeatherTile
              key={location.name}
              location={location}
              weather={weatherByName[location.name] ?? getFallback(location.name)}
            />
          )
        ))}
      </div>
    </section>
  );
}

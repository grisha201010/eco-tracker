'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAirQualityByLocation, getLatestMeasurements, AirQualityData } from '@/lib/api';
import { localCache, generateCacheKey } from '@/lib/cache';

interface Location {
  latitude: number;
  longitude: number;
}

interface UseCachedAirQualityOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // в миллисекундах
  enableLocalStorage?: boolean;
}

export function useCachedAirQuality(
  location: Location | null,
  options: UseCachedAirQualityOptions = {}
) {
  const {
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 минут
    enableLocalStorage = true
  } = options;

  const [data, setData] = useState<AirQualityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Функция для загрузки данных
  const fetchData = useCallback(async (force = false) => {
    if (!location) return;

    const cacheKey = generateCacheKey('air-quality-hook', {
      lat: location.latitude,
      lng: location.longitude
    });

    try {
      setLoading(true);
      setError(null);

      // Проверяем localStorage кэш, если не принудительное обновление
      if (!force && enableLocalStorage) {
        const cachedData = localCache.get<{
          data: AirQualityData[];
          timestamp: number;
        }>(cacheKey);

        if (cachedData) {
          setData(cachedData.data);
          setLastUpdated(new Date(cachedData.timestamp));
          setLoading(false);
          return;
        }
      }

      // Загружаем данные с API (уже кэшированного)
      const airQualityData = await getAirQualityByLocation(
        location.latitude,
        location.longitude
      );

      setData(airQualityData);
      setLastUpdated(new Date());

      // Сохраняем в localStorage
      if (enableLocalStorage) {
        localCache.set(
          cacheKey,
          {
            data: airQualityData,
            timestamp: Date.now()
          },
          10 * 60 * 1000 // 10 минут
        );
      }

    } catch (err) {
      console.error('Error fetching air quality data:', err);
      setError('Ошибка при загрузке данных о качестве воздуха');
    } finally {
      setLoading(false);
    }
  }, [location, enableLocalStorage]);

  // Принудительное обновление данных
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Загрузка данных при изменении местоположения
  useEffect(() => {
    if (location) {
      fetchData();
    }
  }, [location, fetchData]);

  // Автоматическое обновление
  useEffect(() => {
    if (!autoRefresh || !location) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, location, fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

// Хук для кэширования измерений по параметру
export function useCachedMeasurements(
  parameter: string | null,
  limit: number = 100,
  options: UseCachedAirQualityOptions = {}
) {
  const {
    autoRefresh = false, // По умолчанию не обновляем автоматически
    refreshInterval = 10 * 60 * 1000, // 10 минут
    enableLocalStorage = true
  } = options;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Функция для загрузки измерений
  const fetchMeasurements = useCallback(async (force = false) => {
    if (!parameter) return;

    const cacheKey = generateCacheKey('measurements-hook', {
      parameter,
      limit
    });

    try {
      setLoading(true);
      setError(null);

      // Проверяем localStorage кэш
      if (!force && enableLocalStorage) {
        const cachedData = localCache.get<{
          data: any[];
          timestamp: number;
        }>(cacheKey);

        if (cachedData) {
          setData(cachedData.data);
          setLastUpdated(new Date(cachedData.timestamp));
          setLoading(false);
          return;
        }
      }

      // Загружаем данные с API
      const measurements = await getLatestMeasurements(parameter, limit);

      setData(measurements);
      setLastUpdated(new Date());

      // Сохраняем в localStorage
      if (enableLocalStorage) {
        localCache.set(
          cacheKey,
          {
            data: measurements,
            timestamp: Date.now()
          },
          5 * 60 * 1000 // 5 минут
        );
      }

    } catch (err) {
      console.error('Error fetching measurements:', err);
      setError('Ошибка при загрузке измерений');
    } finally {
      setLoading(false);
    }
  }, [parameter, limit, enableLocalStorage]);

  // Принудительное обновление
  const refresh = useCallback(() => {
    return fetchMeasurements(true);
  }, [fetchMeasurements]);

  // Загрузка данных при изменении параметра
  useEffect(() => {
    if (parameter) {
      fetchMeasurements();
    }
  }, [parameter, fetchMeasurements]);

  // Автоматическое обновление
  useEffect(() => {
    if (!autoRefresh || !parameter) return;

    const interval = setInterval(() => {
      fetchMeasurements();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, parameter, fetchMeasurements]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

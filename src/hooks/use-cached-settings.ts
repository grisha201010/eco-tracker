'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { userSettingsCache, localCache, generateCacheKey } from '@/lib/cache';

interface UserSettings {
  notifications_email: boolean;
  notifications_push: boolean;
  notification_frequency: string;
  default_location: string;
  thresholds: Record<string, number>;
}

const DEFAULT_SETTINGS: UserSettings = {
  notifications_email: true,
  notifications_push: false,
  notification_frequency: 'daily',
  default_location: 'moscow',
  thresholds: {
    co2: 1000,
    pm25: 35,
    pm10: 50,
    voc: 100,
    temperature: 30,
    humidity: 70,
    pressure: 1030,
    o3: 70,
    no2: 100,
    so2: 75
  }
};

export function useCachedSettings() {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Генерируем ключ кэша для пользователя
  const getCacheKey = (userId: string) => generateCacheKey('user-settings', { userId });

  // Загрузка настроек
  const loadSettings = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    const cacheKey = getCacheKey(user.id);

    try {
      // Сначала проверяем memory cache
      let cachedSettings = userSettingsCache.get<UserSettings>(cacheKey);

      if (cachedSettings) {
        setSettings(cachedSettings);
        setLoading(false);
        return;
      }

      // Затем проверяем localStorage
      cachedSettings = localCache.get<UserSettings>(cacheKey);

      if (cachedSettings) {
        setSettings(cachedSettings);
        // Сохраняем в memory cache
        userSettingsCache.set(cacheKey, cachedSettings);
        setLoading(false);
        return;
      }

      // Загружаем с сервера
      const response = await fetch('/api/user/settings');

      if (!response.ok) {
        throw new Error('Ошибка при загрузке настроек');
      }

      const data = await response.json();
      const serverSettings = data.data || DEFAULT_SETTINGS;

      // Сохраняем в оба кэша
      userSettingsCache.set(cacheKey, serverSettings);
      localCache.set(cacheKey, serverSettings, 30 * 60 * 1000); // 30 минут

      setSettings(serverSettings);
      setError(null);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Ошибка при загрузке настроек');
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Сохранение настроек
  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!isAuthenticated || !user) {
      return false;
    }

    const cacheKey = getCacheKey(user.id);
    const updatedSettings = { ...settings, ...newSettings };

    try {
      setLoading(true);

      // Оптимистичное обновление - сначала обновляем локально
      setSettings(updatedSettings);

      // Обновляем кэши
      userSettingsCache.set(cacheKey, updatedSettings);
      localCache.set(cacheKey, updatedSettings, 30 * 60 * 1000);

      // Отправляем на сервер
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        throw new Error('Ошибка при сохранении настроек');
      }

      const data = await response.json();
      const serverSettings = data.data;

      // Обновляем с данными сервера
      setSettings(serverSettings);
      userSettingsCache.set(cacheKey, serverSettings);
      localCache.set(cacheKey, serverSettings, 30 * 60 * 1000);

      setError(null);
      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Ошибка при сохранении настроек');

      // Откатываем изменения
      await loadSettings();
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Очистка кэша настроек
  const clearSettingsCache = () => {
    if (!user) return;

    const cacheKey = getCacheKey(user.id);
    userSettingsCache.delete(cacheKey);
    localCache.delete(cacheKey);
  };

  // Обновление конкретного порогового значения
  const updateThreshold = async (parameter: string, value: number) => {
    const newThresholds = { ...settings.thresholds, [parameter]: value };
    return await saveSettings({ thresholds: newThresholds });
  };

  // Загрузка настроек при изменении пользователя
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Очистка кэша при выходе пользователя
  useEffect(() => {
    if (!isAuthenticated) {
      clearSettingsCache();
    }
  }, [isAuthenticated]);

  return {
    settings,
    loading,
    error,
    saveSettings,
    updateThreshold,
    clearSettingsCache,
    refreshSettings: loadSettings
  };
}

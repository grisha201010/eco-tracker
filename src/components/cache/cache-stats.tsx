'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { airQualityCache, measurementsCache, userSettingsCache, localCache } from '@/lib/cache';
import { RefreshCw, Trash2, Database, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

interface CacheStatsProps {
  className?: string;
}

export function CacheStats({ className }: CacheStatsProps) {
  const [stats, setStats] = useState({
    airQuality: { totalEntries: 0, validEntries: 0, expiredEntries: 0, maxSize: 0, ttl: 0 },
    measurements: { totalEntries: 0, validEntries: 0, expiredEntries: 0, maxSize: 0, ttl: 0 },
    userSettings: { totalEntries: 0, validEntries: 0, expiredEntries: 0, maxSize: 0, ttl: 0 }
  });

  const [localStorageSize, setLocalStorageSize] = useState(0);

  // Обновление статистики
  const updateStats = () => {
    setStats({
      airQuality: airQualityCache.getStats(),
      measurements: measurementsCache.getStats(),
      userSettings: userSettingsCache.getStats()
    });

    // Подсчет размера localStorage
    if (typeof window !== 'undefined') {
      let totalSize = 0;
      for (let key in localStorage) {
        if (key.startsWith('eco-tracker-cache')) {
          totalSize += localStorage[key].length;
        }
      }
      setLocalStorageSize(totalSize);
    }
  };

  // Очистка всех кэшей
  const clearAllCaches = () => {
    airQualityCache.clear();
    measurementsCache.clear();
    userSettingsCache.clear();
    localCache.clear();
    
    updateStats();
    toast.success('Все кэши очищены');
  };

  // Очистка конкретного кэша
  const clearSpecificCache = (cacheType: 'airQuality' | 'measurements' | 'userSettings' | 'localStorage') => {
    switch (cacheType) {
      case 'airQuality':
        airQualityCache.clear();
        toast.success('Кэш данных о качестве воздуха очищен');
        break;
      case 'measurements':
        measurementsCache.clear();
        toast.success('Кэш измерений очищен');
        break;
      case 'userSettings':
        userSettingsCache.clear();
        toast.success('Кэш настроек пользователя очищен');
        break;
      case 'localStorage':
        localCache.clear();
        toast.success('Локальный кэш очищен');
        break;
    }
    updateStats();
  };

  // Очистка устаревших записей
  const cleanupExpired = () => {
    // Memory caches автоматически очищают устаревшие записи
    localCache.cleanup();
    updateStats();
    toast.success('Устаревшие записи удалены');
  };

  // Обновление статистики при монтировании и каждые 30 секунд
  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTTL = (ttl: number) => {
    const minutes = Math.floor(ttl / (1000 * 60));
    return `${minutes} мин`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Статистика кэширования
            </CardTitle>
            <CardDescription>
              Информация о состоянии кэшей приложения
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={updateStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
            <Button variant="outline" size="sm" onClick={clearAllCaches}>
              <Trash2 className="h-4 w-4 mr-2" />
              Очистить все
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Memory Caches */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Кэши в памяти</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Air Quality Cache */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Качество воздуха</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSpecificCache('airQuality')}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Записей:</span>
                    <Badge variant="secondary">
                      {stats.airQuality.validEntries}/{stats.airQuality.maxSize}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Устарело:</span>
                    <Badge variant={stats.airQuality.expiredEntries > 0 ? "destructive" : "secondary"}>
                      {stats.airQuality.expiredEntries}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>TTL:</span>
                    <span className="text-muted-foreground">
                      {formatTTL(stats.airQuality.ttl)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Measurements Cache */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Измерения</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSpecificCache('measurements')}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Записей:</span>
                    <Badge variant="secondary">
                      {stats.measurements.validEntries}/{stats.measurements.maxSize}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Устарело:</span>
                    <Badge variant={stats.measurements.expiredEntries > 0 ? "destructive" : "secondary"}>
                      {stats.measurements.expiredEntries}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>TTL:</span>
                    <span className="text-muted-foreground">
                      {formatTTL(stats.measurements.ttl)}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Settings Cache */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Настройки</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSpecificCache('userSettings')}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Записей:</span>
                    <Badge variant="secondary">
                      {stats.userSettings.validEntries}/{stats.userSettings.maxSize}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Устарело:</span>
                    <Badge variant={stats.userSettings.expiredEntries > 0 ? "destructive" : "secondary"}>
                      {stats.userSettings.expiredEntries}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>TTL:</span>
                    <span className="text-muted-foreground">
                      {formatTTL(stats.userSettings.ttl)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Local Storage */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Локальное хранилище</h3>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  localStorage
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearSpecificCache('localStorage')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Размер данных:</span>
                  <Badge variant="secondary">
                    {formatBytes(localStorageSize)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Статус:</span>
                  <Badge variant={localStorageSize > 0 ? "default" : "secondary"}>
                    {localStorageSize > 0 ? "Активен" : "Пуст"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={cleanupExpired}>
              Очистить устаревшие
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

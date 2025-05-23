// Система кэширования для оптимизации запросов

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live в миллисекундах
  maxSize: number; // Максимальный размер кэша
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;

  constructor(config: CacheConfig = { ttl: 5 * 60 * 1000, maxSize: 100 }) {
    this.config = config;
    
    // Очистка устаревших записей каждые 5 минут
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set<T>(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    const now = Date.now();
    
    // Если кэш переполнен, удаляем самые старые записи
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Проверяем, не истек ли срок действия
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Проверяем, не истек ли срок действия
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Очистка устаревших записей
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Удаление самых старых записей при переполнении
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Получение статистики кэша
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl
    };
  }
}

// Создаем экземпляры кэша для разных типов данных
export const airQualityCache = new MemoryCache({
  ttl: 10 * 60 * 1000, // 10 минут для данных о качестве воздуха
  maxSize: 50
});

export const measurementsCache = new MemoryCache({
  ttl: 5 * 60 * 1000, // 5 минут для измерений
  maxSize: 100
});

export const userSettingsCache = new MemoryCache({
  ttl: 30 * 60 * 1000, // 30 минут для настроек пользователя
  maxSize: 20
});

// Утилиты для работы с localStorage (клиентское кэширование)
export class LocalStorageCache {
  private prefix: string;

  constructor(prefix: string = 'eco-tracker-cache') {
    this.prefix = prefix;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    if (typeof window === 'undefined') return;

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };

    try {
      localStorage.setItem(`${this.prefix}-${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const itemStr = localStorage.getItem(`${this.prefix}-${key}`);
      
      if (!itemStr) {
        return null;
      }

      const item: CacheItem<T> = JSON.parse(itemStr);

      // Проверяем, не истек ли срок действия
      if (Date.now() > item.expiresAt) {
        localStorage.removeItem(`${this.prefix}-${key}`);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${this.prefix}-${key}`);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Очистка устаревших записей
  cleanup(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const itemStr = localStorage.getItem(key);
          if (itemStr) {
            const item = JSON.parse(itemStr);
            if (now > item.expiresAt) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Удаляем поврежденные записи
          localStorage.removeItem(key);
        }
      }
    });
  }
}

export const localCache = new LocalStorageCache();

// Функция для генерации ключей кэша
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return `${prefix}:${sortedParams}`;
}

// Декоратор для кэширования функций
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cache: MemoryCache,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    
    // Проверяем кэш
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Выполняем функцию и кэшируем результат
    try {
      const result = await fn(...args);
      cache.set(key, result, ttl);
      return result;
    } catch (error) {
      // Не кэшируем ошибки
      throw error;
    }
  }) as T;
}

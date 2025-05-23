# Настройка для продакшена

## Обзор

Экологический трекер готов к развертыванию в продакшене. Все основные функции реализованы и протестированы в режиме разработки.

## Что уже готово

### ✅ Полностью реализованные функции:
- Адаптивный пользовательский интерфейс
- Система мониторинга качества воздуха
- Интерактивные графики и диаграммы
- Интерактивные карты с Leaflet
- Система отчетов с экспортом (CSV, JSON, PDF)
- Система уведомлений и алертов
- Полная аутентификация пользователей
- API эндпоинты
- Поддержка темной/светлой темы

### ✅ Технические особенности:
- Fallback на демо-данные при отсутствии API ключей
- Graceful degradation для всех внешних сервисов
- Полная типизация TypeScript
- Адаптивный дизайн для всех устройств

## Настройка для продакшена

### 1. Создание проекта в Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте URL проекта и анонимный ключ
4. Создайте следующие таблицы в SQL Editor:

```sql
-- Таблица настроек пользователей
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_email BOOLEAN DEFAULT true,
  notifications_push BOOLEAN DEFAULT false,
  notification_frequency TEXT DEFAULT 'daily',
  default_location TEXT DEFAULT 'moscow',
  thresholds JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS (Row Level Security)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Политика безопасности: пользователи могут видеть только свои настройки
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);
```

### 2. Получение API ключей OpenAQ

1. Перейдите на [openaq.org](https://openaq.org)
2. Зарегистрируйтесь и получите API ключ
3. Ознакомьтесь с лимитами API

### 3. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAQ API (опционально)
NEXT_PUBLIC_OPENAQ_API_KEY=your-openaq-api-key
```

**Важно**: Если API ключи не указаны, приложение будет работать с демо-данными.

### 4. Деплой на Vercel

1. Установите Vercel CLI: `npm i -g vercel`
2. Войдите в аккаунт: `vercel login`
3. Деплой: `vercel --prod`
4. Добавьте переменные окружения в настройках проекта Vercel

### 5. Настройка домена (опционально)

1. В настройках проекта Vercel добавьте свой домен
2. Настройте DNS записи согласно инструкциям Vercel

## Мониторинг и обслуживание

### Логирование
- Все ошибки API логируются в консоль
- Используйте Vercel Analytics для мониторинга производительности

### Резервное копирование
- Supabase автоматически создает резервные копии
- Экспортируйте важные данные регулярно

### Обновления
- Следите за обновлениями зависимостей
- Тестируйте изменения в staging-среде

## Возможные улучшения

### Краткосрочные:
- Добавление push-уведомлений
- Интеграция с дополнительными источниками данных
- Расширенная аналитика

### Долгосрочные:
- Мобильное приложение
- Машинное обучение для прогнозов
- Интеграция с IoT датчиками

## Поддержка

При возникновении проблем:
1. Проверьте логи в Vercel Dashboard
2. Убедитесь, что переменные окружения настроены корректно
3. Проверьте статус внешних сервисов (Supabase, OpenAQ)

## Безопасность

- Все API ключи хранятся как переменные окружения
- Используется Row Level Security в Supabase
- Все пользовательские данные защищены аутентификацией
- HTTPS обязателен для продакшена

## Производительность

- Приложение оптимизировано для быстрой загрузки
- Используется кэширование на уровне браузера
- Lazy loading для тяжелых компонентов (карты)
- Оптимизированные изображения и ресурсы

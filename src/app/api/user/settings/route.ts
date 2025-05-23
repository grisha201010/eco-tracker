import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Если Supabase не настроен, возвращаем настройки по умолчанию
    if (!supabase) {
      const defaultSettings = {
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
      return NextResponse.json({ data: defaultSettings, success: true });
    }

    // Получаем текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // Получаем настройки пользователя
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Settings fetch error:', error);
      return NextResponse.json(
        { error: 'Ошибка при получении настроек' },
        { status: 500 }
      );
    }

    // Если настройки не найдены, возвращаем настройки по умолчанию
    if (!settings) {
      const defaultSettings = {
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

      return NextResponse.json({ data: defaultSettings, success: true });
    }

    return NextResponse.json({ data: settings, success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Если Supabase не настроен, возвращаем успех без сохранения
    if (!supabase) {
      const body = await request.json();
      return NextResponse.json({ data: body, success: true });
    }

    // Получаем текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Обновляем или создаем настройки пользователя
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        ...body,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Settings update error:', error);
      return NextResponse.json(
        { error: 'Ошибка при сохранении настроек' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Создаем клиент Supabase для использования на стороне сервера
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Если переменные окружения не настроены, возвращаем null
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-supabase-url' || supabaseAnonKey === 'your-supabase-anon-key') {
    console.warn('Supabase credentials not configured on server side.');
    return null;
  }

  try {
    const cookieStore = cookies();

    return createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
  } catch (error) {
    console.error('Failed to create server Supabase client:', error);
    return null;
  }
};

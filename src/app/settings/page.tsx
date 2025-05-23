'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIR_QUALITY_PARAMETERS } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useCachedSettings } from '@/hooks/use-cached-settings';
import { CacheStats } from '@/components/cache/cache-stats';

// Схема для формы настроек профиля
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Имя должно содержать не менее 2 символов',
  }),
  email: z.string().email({
    message: 'Введите корректный email',
  }),
  location: z.string().min(1, {
    message: 'Выберите местоположение по умолчанию',
  }),
});

// Схема для формы настроек уведомлений
const notificationsFormSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  frequency: z.string(),
});

// Схема для формы настроек пороговых значений
const thresholdsFormSchema = z.object({
  parameterId: z.string(),
  threshold: z.string().transform(val => Number(val)),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;
type ThresholdsFormValues = z.infer<typeof thresholdsFormSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { settings, loading: settingsLoading, saveSettings, updateThreshold } = useCachedSettings();

  // Форма профиля
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: 'Иван Иванов',
      email: 'ivan@example.com',
      location: 'moscow',
    },
  });

  // Форма уведомлений
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      email: settings.notifications_email,
      push: settings.notifications_push,
      frequency: settings.notification_frequency,
    },
  });

  // Форма пороговых значений
  const thresholdsForm = useForm<ThresholdsFormValues>({
    resolver: zodResolver(thresholdsFormSchema),
    defaultValues: {
      parameterId: 'co2',
      threshold: '1000',
    },
  });

  // Обработчики отправки форм
  const onProfileSubmit = (data: ProfileFormValues) => {
    toast.success('Настройки профиля сохранены');
    console.log('Profile form data:', data);
  };

  const onNotificationsSubmit = async (data: NotificationsFormValues) => {
    const success = await saveSettings({
      notifications_email: data.email,
      notifications_push: data.push,
      notification_frequency: data.frequency,
    });

    if (success) {
      toast.success('Настройки уведомлений сохранены');
    } else {
      toast.error('Ошибка при сохранении настроек');
    }
  };

  const onThresholdsSubmit = async (data: ThresholdsFormValues) => {
    const success = await updateThreshold(data.parameterId, data.threshold);

    if (success) {
      toast.success('Пороговое значение сохранено');
    } else {
      toast.error('Ошибка при сохранении порогового значения');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container ml-8">
          <h1 className="mb-6 text-3xl font-bold">Настройки</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="profile">Профиль</TabsTrigger>
              <TabsTrigger value="notifications">Уведомления</TabsTrigger>
              <TabsTrigger value="thresholds">Пороговые значения</TabsTrigger>
              <TabsTrigger value="cache">Кэширование</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Настройки профиля</CardTitle>
                  <CardDescription>
                    Управляйте настройками вашего профиля
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Имя</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Местоположение по умолчанию</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите местоположение" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="moscow">Москва</SelectItem>
                                <SelectItem value="spb">Санкт-Петербург</SelectItem>
                                <SelectItem value="ekb">Екатеринбург</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit">Сохранить настройки</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Настройки уведомлений</CardTitle>
                  <CardDescription>
                    Настройте способы получения уведомлений
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationsForm}>
                    <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                      <FormField
                        control={notificationsForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email уведомления</FormLabel>
                              <FormDescription>
                                Получать уведомления на email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationsForm.control}
                        name="push"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Push-уведомления</FormLabel>
                              <FormDescription>
                                Получать push-уведомления в браузере
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationsForm.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Частота уведомлений</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите частоту" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="realtime">В реальном времени</SelectItem>
                                <SelectItem value="hourly">Ежечасно</SelectItem>
                                <SelectItem value="daily">Ежедневно</SelectItem>
                                <SelectItem value="weekly">Еженедельно</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit">Сохранить настройки</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="thresholds" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Пороговые значения</CardTitle>
                  <CardDescription>
                    Настройте пороговые значения для параметров качества воздуха
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...thresholdsForm}>
                    <form onSubmit={thresholdsForm.handleSubmit(onThresholdsSubmit)} className="space-y-6">
                      <FormField
                        control={thresholdsForm.control}
                        name="parameterId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Параметр</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите параметр" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {AIR_QUALITY_PARAMETERS.map((param) => (
                                  <SelectItem key={param.id} value={param.id}>
                                    {param.displayName} ({param.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={thresholdsForm.control}
                        name="threshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Пороговое значение</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" />
                            </FormControl>
                            <FormDescription>
                              При превышении этого значения вы получите уведомление
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit">Сохранить пороговое значение</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cache" className="mt-6">
              <CacheStats />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { LocationSelector } from '@/components/location/location-selector';
import { ParameterCard } from '@/components/air-quality/parameter-card';
import { AirQualityIndex } from '@/components/air-quality/air-quality-index';
import { ParameterChart } from '@/components/air-quality/parameter-chart';
import { AirQualityMap } from '@/components/air-quality/air-quality-map';
import { AlertNotifications } from '@/components/notifications/alert-notifications';
import { AIR_QUALITY_PARAMETERS } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCachedAirQuality } from '@/hooks/use-cached-air-quality';
import { useCachedSettings } from '@/hooks/use-cached-settings';

// Демо-данные для отображения
const DEMO_VALUES = {
  co2: 450,
  pm25: 15,
  pm10: 30,
  voc: 40,
  temperature: 22,
  humidity: 45,
  pressure: 1015,
  o3: 30,
  no2: 25,
  so2: 5
};

// Демо-данные для графиков
const generateChartData = (parameterId: string, count: number = 24) => {
  const now = new Date();
  const data = [];

  // Базовое значение из демо-данных
  const baseValue = DEMO_VALUES[parameterId as keyof typeof DEMO_VALUES] || 0;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString();
    // Добавляем случайное отклонение от базового значения
    const randomVariation = (Math.random() - 0.5) * baseValue * 0.4;
    const value = Math.max(0, baseValue + randomVariation);

    data.push({
      timestamp,
      value: Number(value.toFixed(2))
    });
  }

  return data;
};

interface Location {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export default function Dashboard() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Используем кэшированные данные
  const { settings } = useCachedSettings();
  const {
    data: airQualityData,
    loading: airQualityLoading,
    error: airQualityError,
    lastUpdated,
    refresh: refreshAirQuality
  } = useCachedAirQuality(
    selectedLocation ? {
      latitude: selectedLocation.coordinates.latitude,
      longitude: selectedLocation.coordinates.longitude
    } : null,
    {
      autoRefresh: true,
      refreshInterval: 5 * 60 * 1000, // 5 минут
      enableLocalStorage: true
    }
  );

  const handleLocationChange = (location: Location) => {
    setSelectedLocation(location);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container ml-8">
          <h1 className="mb-6 text-3xl font-bold">Дашборд мониторинга</h1>

          <LocationSelector
            onLocationChange={handleLocationChange}
            className="mb-8"
          />

          {selectedLocation && (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedLocation.name}, {selectedLocation.city}, {selectedLocation.country}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Координаты: {selectedLocation.coordinates.latitude.toFixed(4)}, {selectedLocation.coordinates.longitude.toFixed(4)}
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                  <TabsTrigger value="overview">Обзор</TabsTrigger>
                  <TabsTrigger value="details">Детали</TabsTrigger>
                  <TabsTrigger value="charts">Графики</TabsTrigger>
                  <TabsTrigger value="map">Карта</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <AirQualityIndex
                      measurements={DEMO_VALUES}
                      className="md:col-span-2 lg:col-span-1"
                    />

                    {AIR_QUALITY_PARAMETERS.slice(0, 5).map((parameter) => (
                      <ParameterCard
                        key={parameter.id}
                        parameter={parameter}
                        value={DEMO_VALUES[parameter.id as keyof typeof DEMO_VALUES]}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {AIR_QUALITY_PARAMETERS.map((parameter) => (
                      <ParameterCard
                        key={parameter.id}
                        parameter={parameter}
                        value={DEMO_VALUES[parameter.id as keyof typeof DEMO_VALUES]}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="charts" className="mt-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {AIR_QUALITY_PARAMETERS.slice(0, 4).map((parameter) => (
                      <ParameterChart
                        key={parameter.id}
                        parameterId={parameter.id}
                        data={generateChartData(parameter.id)}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="map" className="mt-6">
                  <AirQualityMap
                    center={[selectedLocation.coordinates.latitude, selectedLocation.coordinates.longitude]}
                    zoom={12}
                  />
                </TabsContent>
              </Tabs>

              <AlertNotifications
                measurements={DEMO_VALUES}
                location={selectedLocation.name}
                thresholds={settings.thresholds}
                className="mb-8"
              />

              <Card>
                <CardHeader>
                  <CardTitle>Рекомендации</CardTitle>
                  <CardDescription>
                    На основе текущих показателей качества воздуха
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Качество воздуха в целом хорошее, особых мер предосторожности не требуется.</li>
                    <li>Рекомендуется проветривать помещение в утренние часы.</li>
                    <li>Людям с респираторными заболеваниями рекомендуется следить за уровнем PM2.5.</li>
                    <li>Для улучшения качества воздуха в помещении рекомендуется использовать очистители воздуха.</li>
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

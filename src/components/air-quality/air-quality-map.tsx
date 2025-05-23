'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAirQualityAssessment } from '@/lib/air-quality-utils';

// Динамический импорт компонентов карты для избежания SSR проблем
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface AirQualityStation {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  measurements: {
    parameter: string;
    value: number;
    unit: string;
  }[];
}

interface AirQualityMapProps {
  stations: AirQualityStation[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

// Демо-данные для станций мониторинга
const DEMO_STATIONS: AirQualityStation[] = [
  {
    id: '1',
    name: 'Москва, Центр',
    coordinates: { latitude: 55.7558, longitude: 37.6173 },
    measurements: [
      { parameter: 'pm25', value: 15, unit: 'µg/m³' },
      { parameter: 'pm10', value: 30, unit: 'µg/m³' },
      { parameter: 'co2', value: 450, unit: 'ppm' }
    ]
  },
  {
    id: '2',
    name: 'Москва, Север',
    coordinates: { latitude: 55.8, longitude: 37.6 },
    measurements: [
      { parameter: 'pm25', value: 25, unit: 'µg/m³' },
      { parameter: 'pm10', value: 45, unit: 'µg/m³' },
      { parameter: 'co2', value: 520, unit: 'ppm' }
    ]
  },
  {
    id: '3',
    name: 'Москва, Юг',
    coordinates: { latitude: 55.7, longitude: 37.65 },
    measurements: [
      { parameter: 'pm25', value: 12, unit: 'µg/m³' },
      { parameter: 'pm10', value: 28, unit: 'µg/m³' },
      { parameter: 'co2', value: 420, unit: 'ppm' }
    ]
  },
  {
    id: '4',
    name: 'Санкт-Петербург, Центр',
    coordinates: { latitude: 59.9343, longitude: 30.3351 },
    measurements: [
      { parameter: 'pm25', value: 18, unit: 'µg/m³' },
      { parameter: 'pm10', value: 35, unit: 'µg/m³' },
      { parameter: 'co2', value: 480, unit: 'ppm' }
    ]
  }
];

export function AirQualityMap({ 
  stations = DEMO_STATIONS, 
  center = [55.7558, 37.6173], 
  zoom = 10,
  className 
}: AirQualityMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [leafletIcon, setLeafletIcon] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Настройка иконок Leaflet
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      
      // Исправляем проблему с иконками в Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      });
      
      setLeafletIcon(L.Icon.Default);
    }
  }, []);

  // Функция для получения цвета маркера на основе качества воздуха
  const getMarkerColor = (station: AirQualityStation) => {
    // Берем PM2.5 как основной показатель
    const pm25Measurement = station.measurements.find(m => m.parameter === 'pm25');
    if (!pm25Measurement) return '#00E400'; // зеленый по умолчанию
    
    const assessment = getAirQualityAssessment(pm25Measurement.value, 'pm25');
    return assessment.color;
  };

  if (!isClient) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Карта качества воздуха</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center bg-muted rounded-lg">
            <p className="text-muted-foreground">Загрузка карты...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Карта качества воздуха</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] rounded-lg overflow-hidden">
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {stations.map((station) => (
              <Marker
                key={station.id}
                position={[station.coordinates.latitude, station.coordinates.longitude]}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold mb-2">{station.name}</h3>
                    <div className="space-y-1">
                      {station.measurements.map((measurement, index) => {
                        const assessment = getAirQualityAssessment(measurement.value, measurement.parameter);
                        return (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{measurement.parameter.toUpperCase()}:</span>
                            <span 
                              className="text-sm font-medium px-2 py-1 rounded"
                              style={{ 
                                backgroundColor: assessment.color,
                                color: assessment.category === 'good' || assessment.category === 'moderate' 
                                  ? 'black' 
                                  : 'white'
                              }}
                            >
                              {measurement.value} {measurement.unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Легенда:</h4>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Хорошее</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs">Умеренное</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs">Вредное для чувствительных</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs">Вредное</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

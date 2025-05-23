// Типы данных для API
export interface AirQualityParameter {
  id: string;
  name: string;
  displayName: string;
  description: string;
  unit: string;
  thresholds: {
    good: number;
    moderate: number;
    unhealthyForSensitive: number;
    unhealthy: number;
    veryUnhealthy: number;
    hazardous: number;
  };
}

export interface AirQualityData {
  location: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  measurements: {
    parameter: string;
    value: number;
    unit: string;
    lastUpdated: string;
  }[];
}

// Параметры качества воздуха
export const AIR_QUALITY_PARAMETERS: AirQualityParameter[] = [
  {
    id: 'co2',
    name: 'CO2',
    displayName: 'Уровень CO2',
    description: 'Углекислый газ',
    unit: 'ppm',
    thresholds: {
      good: 400,
      moderate: 1000,
      unhealthyForSensitive: 1500,
      unhealthy: 2000,
      veryUnhealthy: 5000,
      hazardous: 10000
    }
  },
  {
    id: 'pm25',
    name: 'PM2.5',
    displayName: 'PM2.5',
    description: 'Твердые частицы диаметром 2.5 микрометра или меньше',
    unit: 'µg/m³',
    thresholds: {
      good: 12,
      moderate: 35.4,
      unhealthyForSensitive: 55.4,
      unhealthy: 150.4,
      veryUnhealthy: 250.4,
      hazardous: 350.4
    }
  },
  {
    id: 'pm10',
    name: 'PM10',
    displayName: 'PM10',
    description: 'Твердые частицы диаметром 10 микрометров или меньше',
    unit: 'µg/m³',
    thresholds: {
      good: 54,
      moderate: 154,
      unhealthyForSensitive: 254,
      unhealthy: 354,
      veryUnhealthy: 424,
      hazardous: 504
    }
  },
  {
    id: 'voc',
    name: 'VOC',
    displayName: 'ЛОС',
    description: 'Летучие органические соединения',
    unit: 'ppb',
    thresholds: {
      good: 50,
      moderate: 100,
      unhealthyForSensitive: 150,
      unhealthy: 200,
      veryUnhealthy: 300,
      hazardous: 500
    }
  },
  {
    id: 'temperature',
    name: 'Temperature',
    displayName: 'Температура',
    description: 'Температура воздуха',
    unit: '°C',
    thresholds: {
      good: 20,
      moderate: 25,
      unhealthyForSensitive: 30,
      unhealthy: 35,
      veryUnhealthy: 40,
      hazardous: 45
    }
  },
  {
    id: 'humidity',
    name: 'Humidity',
    displayName: 'Влажность',
    description: 'Относительная влажность воздуха',
    unit: '%',
    thresholds: {
      good: 40,
      moderate: 60,
      unhealthyForSensitive: 70,
      unhealthy: 80,
      veryUnhealthy: 90,
      hazardous: 100
    }
  },
  {
    id: 'pressure',
    name: 'Pressure',
    displayName: 'Давление',
    description: 'Атмосферное давление',
    unit: 'гПа',
    thresholds: {
      good: 1013,
      moderate: 1020,
      unhealthyForSensitive: 1030,
      unhealthy: 1040,
      veryUnhealthy: 1050,
      hazardous: 1060
    }
  },
  {
    id: 'o3',
    name: 'O3',
    displayName: 'Озон',
    description: 'Концентрация озона',
    unit: 'ppb',
    thresholds: {
      good: 54,
      moderate: 70,
      unhealthyForSensitive: 85,
      unhealthy: 105,
      veryUnhealthy: 200,
      hazardous: 300
    }
  },
  {
    id: 'no2',
    name: 'NO2',
    displayName: 'Диоксид азота',
    description: 'Концентрация диоксида азота',
    unit: 'ppb',
    thresholds: {
      good: 53,
      moderate: 100,
      unhealthyForSensitive: 360,
      unhealthy: 649,
      veryUnhealthy: 1249,
      hazardous: 1649
    }
  },
  {
    id: 'so2',
    name: 'SO2',
    displayName: 'Диоксид серы',
    description: 'Концентрация диоксида серы',
    unit: 'ppb',
    thresholds: {
      good: 35,
      moderate: 75,
      unhealthyForSensitive: 185,
      unhealthy: 304,
      veryUnhealthy: 604,
      hazardous: 804
    }
  }
];

import { airQualityCache, measurementsCache, generateCacheKey, withCache } from './cache';

// Базовый URL для OpenAQ API
const OPENAQ_API_BASE_URL = 'https://api.openaq.org/v2';

// Внутренняя функция для получения данных о качестве воздуха (без кэширования)
async function _getAirQualityByLocation(
  latitude: number,
  longitude: number,
  radius: number = 10000
): Promise<AirQualityData[]> {
  try {
    // Если нет API ключа, возвращаем демо-данные
    if (!process.env.NEXT_PUBLIC_OPENAQ_API_KEY) {
      console.warn('OpenAQ API key not found, using demo data');
      return getDemoAirQualityData(latitude, longitude);
    }

    const response = await fetch(
      `${OPENAQ_API_BASE_URL}/locations?coordinates=${latitude},${longitude}&radius=${radius}&limit=10`,
      {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_OPENAQ_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.warn('OpenAQ API request failed, using demo data');
      return getDemoAirQualityData(latitude, longitude);
    }

    const data = await response.json();

    // Преобразуем данные в нужный формат
    return data.results.map((location: any) => ({
      location: location.name,
      city: location.city || 'Неизвестно',
      country: location.country || 'Неизвестно',
      coordinates: {
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude
      },
      measurements: location.parameters.map((param: any) => ({
        parameter: param.parameter,
        value: param.lastValue,
        unit: param.unit,
        lastUpdated: param.lastUpdated
      }))
    }));
  } catch (error) {
    console.error('Ошибка при получении данных о качестве воздуха:', error);
    return getDemoAirQualityData(latitude, longitude);
  }
}

// Кэшированная версия функции для получения данных о качестве воздуха
export const getAirQualityByLocation = withCache(
  _getAirQualityByLocation,
  airQualityCache,
  (latitude: number, longitude: number, radius: number = 10000) =>
    generateCacheKey('air-quality', { latitude, longitude, radius }),
  10 * 60 * 1000 // 10 минут
);

// Функция для получения демо-данных
function getDemoAirQualityData(latitude: number, longitude: number): AirQualityData[] {
  // Генерируем демо-данные на основе координат
  const baseData = {
    location: `Станция ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
    city: 'Демо-город',
    country: 'Россия',
    coordinates: { latitude, longitude },
    measurements: [
      { parameter: 'pm25', value: Math.random() * 50 + 10, unit: 'µg/m³', lastUpdated: new Date().toISOString() },
      { parameter: 'pm10', value: Math.random() * 80 + 20, unit: 'µg/m³', lastUpdated: new Date().toISOString() },
      { parameter: 'co2', value: Math.random() * 200 + 400, unit: 'ppm', lastUpdated: new Date().toISOString() },
      { parameter: 'no2', value: Math.random() * 50 + 10, unit: 'ppb', lastUpdated: new Date().toISOString() },
      { parameter: 'o3', value: Math.random() * 60 + 20, unit: 'ppb', lastUpdated: new Date().toISOString() },
      { parameter: 'so2', value: Math.random() * 30 + 5, unit: 'ppb', lastUpdated: new Date().toISOString() }
    ]
  };

  return [baseData];
}

// Внутренняя функция для получения последних измерений (без кэширования)
async function _getLatestMeasurements(
  parameter: string,
  limit: number = 100
): Promise<any[]> {
  try {
    // Если нет API ключа, возвращаем демо-данные
    if (!process.env.NEXT_PUBLIC_OPENAQ_API_KEY) {
      console.warn('OpenAQ API key not found, using demo data');
      return getDemoMeasurements(parameter, limit);
    }

    const response = await fetch(
      `${OPENAQ_API_BASE_URL}/measurements?parameter=${parameter}&limit=${limit}&sort=desc&order_by=datetime`,
      {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_OPENAQ_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.warn('OpenAQ API request failed, using demo data');
      return getDemoMeasurements(parameter, limit);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Ошибка при получении последних измерений:', error);
    return getDemoMeasurements(parameter, limit);
  }
}

// Кэшированная версия функции для получения последних измерений
export const getLatestMeasurements = withCache(
  _getLatestMeasurements,
  measurementsCache,
  (parameter: string, limit: number = 100) =>
    generateCacheKey('measurements', { parameter, limit }),
  5 * 60 * 1000 // 5 минут
);

// Функция для получения демо-измерений
function getDemoMeasurements(parameter: string, limit: number): any[] {
  const measurements = [];
  const now = new Date();

  for (let i = 0; i < limit; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    measurements.push({
      parameter,
      value: Math.random() * 100 + 10,
      unit: getParameterUnit(parameter),
      date: {
        utc: timestamp.toISOString()
      },
      location: 'Демо-станция',
      city: 'Демо-город',
      country: 'Россия'
    });
  }

  return measurements;
}

// Функция для получения единицы измерения параметра
function getParameterUnit(parameter: string): string {
  const units: Record<string, string> = {
    'pm25': 'µg/m³',
    'pm10': 'µg/m³',
    'co2': 'ppm',
    'no2': 'ppb',
    'o3': 'ppb',
    'so2': 'ppb',
    'voc': 'ppb',
    'temperature': '°C',
    'humidity': '%',
    'pressure': 'гПа'
  };

  return units[parameter] || 'unit';
}

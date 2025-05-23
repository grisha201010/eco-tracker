import { NextRequest, NextResponse } from 'next/server';
import { getAirQualityByLocation, getLatestMeasurements } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('lat');
    const longitude = searchParams.get('lng');
    const parameter = searchParams.get('parameter');
    const limit = searchParams.get('limit');

    // Если указаны координаты, получаем данные по местоположению
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radius = searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : 10000;

      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json(
          { error: 'Некорректные координаты' },
          { status: 400 }
        );
      }

      const data = await getAirQualityByLocation(lat, lng, radius);
      return NextResponse.json({ data, success: true });
    }

    // Если указан параметр, получаем последние измерения
    if (parameter) {
      const limitNum = limit ? parseInt(limit) : 100;
      const data = await getLatestMeasurements(parameter, limitNum);
      return NextResponse.json({ data, success: true });
    }

    // Если параметры не указаны, возвращаем демо-данные
    const demoData = [
      {
        location: 'Москва, Центр',
        city: 'Москва',
        country: 'Россия',
        coordinates: {
          latitude: 55.7558,
          longitude: 37.6173
        },
        measurements: [
          { parameter: 'pm25', value: 15, unit: 'µg/m³', lastUpdated: new Date().toISOString() },
          { parameter: 'pm10', value: 30, unit: 'µg/m³', lastUpdated: new Date().toISOString() },
          { parameter: 'co2', value: 450, unit: 'ppm', lastUpdated: new Date().toISOString() },
          { parameter: 'no2', value: 25, unit: 'ppb', lastUpdated: new Date().toISOString() },
          { parameter: 'o3', value: 30, unit: 'ppb', lastUpdated: new Date().toISOString() }
        ]
      }
    ];

    return NextResponse.json({ data: demoData, success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении данных о качестве воздуха' },
      { status: 500 }
    );
  }
}

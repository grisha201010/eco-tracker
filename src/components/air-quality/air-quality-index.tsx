'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  calculateAQI, 
  getOverallAirQualityAssessment 
} from '@/lib/air-quality-utils';

interface AirQualityIndexProps {
  measurements: Record<string, number>;
  className?: string;
}

export function AirQualityIndex({ measurements, className }: AirQualityIndexProps) {
  const aqi = calculateAQI(measurements);
  const assessment = getOverallAirQualityAssessment(aqi);
  
  return (
    <Card className={className}>
      <div 
        className="h-2" 
        style={{ backgroundColor: assessment.color }}
      />
      <CardHeader>
        <CardTitle>Индекс качества воздуха</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div 
            className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold"
            style={{ 
              backgroundColor: assessment.color,
              color: assessment.category === 'good' || assessment.category === 'moderate' 
                ? 'black' 
                : 'white'
            }}
          >
            {aqi}
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold">{assessment.label}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              {assessment.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

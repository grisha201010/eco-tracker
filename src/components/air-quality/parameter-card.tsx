'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  getAirQualityAssessment, 
  formatValueWithUnit 
} from '@/lib/air-quality-utils';
import { AirQualityParameter } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ParameterCardProps {
  parameter: AirQualityParameter;
  value: number;
  className?: string;
}

export function ParameterCard({ parameter, value, className }: ParameterCardProps) {
  const assessment = getAirQualityAssessment(value, parameter.id);
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div 
        className="h-1" 
        style={{ backgroundColor: assessment.color }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{parameter.displayName}</CardTitle>
          <Badge 
            style={{ 
              backgroundColor: assessment.color,
              color: assessment.category === 'good' || assessment.category === 'moderate' 
                ? 'black' 
                : 'white'
            }}
          >
            {assessment.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-bold">
            {formatValueWithUnit(value, parameter.id)}
          </div>
          <p className="text-xs text-muted-foreground">
            {parameter.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

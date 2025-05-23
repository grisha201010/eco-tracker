'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AirQualityParameter } from '@/lib/api';
import { getParameterById } from '@/lib/air-quality-utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';

interface DataPoint {
  timestamp: string;
  value: number;
}

interface ParameterChartProps {
  parameterId: string;
  data: DataPoint[];
  className?: string;
}

export function ParameterChart({ parameterId, data, className }: ParameterChartProps) {
  const parameter = getParameterById(parameterId);
  
  if (!parameter) {
    return null;
  }
  
  // Преобразуем данные для графика
  const chartData = data.map(point => ({
    time: format(new Date(point.timestamp), 'HH:mm'),
    value: point.value,
    fullTime: point.timestamp
  }));
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{parameter.displayName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: parameter.unit, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip 
                formatter={(value) => [`${value} ${parameter.unit}`, parameter.displayName]}
                labelFormatter={(label) => `Время: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

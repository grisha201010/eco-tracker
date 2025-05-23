'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Bell, X } from 'lucide-react';
import { getAirQualityAssessment } from '@/lib/air-quality-utils';
import { AIR_QUALITY_PARAMETERS } from '@/lib/api';
import { toast } from 'sonner';

interface AlertNotification {
  id: string;
  parameter: string;
  value: number;
  threshold: number;
  location: string;
  timestamp: string;
  severity: 'warning' | 'danger' | 'critical';
}

interface AlertNotificationsProps {
  measurements: Record<string, number>;
  location: string;
  thresholds?: Record<string, number>;
  className?: string;
}

// Пороговые значения по умолчанию
const DEFAULT_THRESHOLDS = {
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
};

export function AlertNotifications({
  measurements,
  location,
  thresholds = DEFAULT_THRESHOLDS,
  className
}: AlertNotificationsProps) {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newAlerts: AlertNotification[] = [];

    Object.entries(measurements).forEach(([parameterId, value]) => {
      const threshold = thresholds[parameterId];
      const parameter = AIR_QUALITY_PARAMETERS.find(p => p.id === parameterId);

      if (!threshold || !parameter) return;

      // Проверяем превышение порогового значения
      if (value > threshold) {
        const assessment = getAirQualityAssessment(value, parameterId);

        let severity: 'warning' | 'danger' | 'critical' = 'warning';
        if (assessment.category === 'unhealthy' || assessment.category === 'veryUnhealthy') {
          severity = 'danger';
        } else if (assessment.category === 'hazardous') {
          severity = 'critical';
        }

        const alertId = `${parameterId}-${location}-${Date.now()}`;

        newAlerts.push({
          id: alertId,
          parameter: parameter.displayName,
          value,
          threshold,
          location,
          timestamp: new Date().toISOString(),
          severity
        });
      }
    });

    setAlerts(newAlerts);

    // Показываем toast уведомления для новых критических превышений
    newAlerts.forEach(alert => {
      if (alert.severity === 'critical' && !dismissedAlerts.has(alert.id)) {
        toast.error(
          `Критическое превышение ${alert.parameter}: ${alert.value} (норма: ${alert.threshold})`,
          {
            duration: 10000,
            action: {
              label: 'Подробнее',
              onClick: () => {
                // Можно добавить переход к детальной информации
              }
            }
          }
        );
      }
    });
  }, [measurements, thresholds, location, dismissedAlerts]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'danger': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'critical': return 'bg-red-100 border-red-500 text-red-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Bell className="h-5 w-5 text-orange-600" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Уведомления о превышении норм
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleAlerts.map((alert) => (
            <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <AlertTitle className="text-sm font-medium">
                      Превышение нормы: {alert.parameter}
                    </AlertTitle>
                    <AlertDescription className="text-sm mt-1">
                      <div className="space-y-1">
                        <div>
                          Текущее значение: <strong>{alert.value}</strong>
                        </div>
                        <div>
                          Пороговое значение: <strong>{alert.threshold}</strong>
                        </div>
                        <div>
                          Местоположение: {alert.location}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </AlertDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.severity === 'critical' ? 'Критично' :
                     alert.severity === 'danger' ? 'Опасно' : 'Внимание'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Alert>
          ))}
        </div>

        {visibleAlerts.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Рекомендации:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Ограничьте время пребывания на улице</li>
              <li>• Используйте защитные маски при выходе</li>
              <li>• Закройте окна и используйте очистители воздуха</li>
              <li>• Людям с респираторными заболеваниями следует быть особенно осторожными</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

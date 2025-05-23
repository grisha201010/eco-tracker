'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AIR_QUALITY_PARAMETERS } from '@/lib/api';
import { ParameterChart } from '@/components/air-quality/parameter-chart';
import { format } from 'date-fns';
import { Download, FileText, Filter, FileSpreadsheet, FileJson } from 'lucide-react';
import { exportToCSV, exportToJSON, exportToPDF, formatDataForExport } from '@/lib/export-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Демо-данные для отчетов
const generateReportData = (parameterId: string, days: number = 7) => {
  const now = new Date();
  const data = [];

  // Базовое значение
  const baseValue = {
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
  }[parameterId] || 0;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

    // Генерируем несколько значений для каждого дня
    const dailyData = [];
    for (let hour = 0; hour < 24; hour += 3) {
      const timestamp = new Date(date.getTime() + hour * 60 * 60 * 1000).toISOString();
      // Добавляем случайное отклонение от базового значения
      const randomVariation = (Math.random() - 0.5) * baseValue * 0.4;
      const value = Math.max(0, baseValue + randomVariation);

      dailyData.push({
        timestamp,
        value: Number(value.toFixed(2))
      });
    }

    // Вычисляем среднее, минимальное и максимальное значения за день
    const values = dailyData.map(item => item.value);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    data.push({
      date: format(date, 'dd.MM.yyyy'),
      avg: Number(avg.toFixed(2)),
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      hourlyData: dailyData
    });
  }

  return data;
};

export default function Reports() {
  const [selectedParameter, setSelectedParameter] = useState('co2');
  const [dateRange, setDateRange] = useState('7days');
  const [reportData, setReportData] = useState(() =>
    generateReportData(selectedParameter, 7)
  );

  // Обработчик изменения параметра
  const handleParameterChange = (value: string) => {
    setSelectedParameter(value);

    // Обновляем данные отчета
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
    setReportData(generateReportData(value, days));
  };

  // Обработчик изменения диапазона дат
  const handleDateRangeChange = (value: string) => {
    setDateRange(value);

    // Обновляем данные отчета
    const days = value === '7days' ? 7 : value === '30days' ? 30 : 90;
    setReportData(generateReportData(selectedParameter, days));
  };

  // Получаем выбранный параметр
  const parameter = AIR_QUALITY_PARAMETERS.find(p => p.id === selectedParameter);

  // Подготавливаем данные для графика
  const chartData = reportData.flatMap(day => day.hourlyData);

  // Функции экспорта
  const handleExportCSV = () => {
    if (!parameter) return;
    const exportData = formatDataForExport(reportData, selectedParameter, 'Выбранное местоположение');
    exportToCSV(exportData, `air-quality-${selectedParameter}-${dateRange}`);
  };

  const handleExportJSON = () => {
    if (!parameter) return;
    const exportData = formatDataForExport(reportData, selectedParameter, 'Выбранное местоположение');
    exportToJSON(exportData, `air-quality-${selectedParameter}-${dateRange}`);
  };

  const handleExportPDF = () => {
    if (!parameter) return;
    const exportData = formatDataForExport(reportData, selectedParameter, 'Выбранное местоположение');
    exportToPDF(exportData, `air-quality-${selectedParameter}-${dateRange}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container ml-8">
          <h1 className="mb-6 text-3xl font-bold">Отчеты</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Параметры отчета</CardTitle>
              <CardDescription>
                Выберите параметр и временной диапазон для формирования отчета
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Параметр</label>
                  <Select
                    value={selectedParameter}
                    onValueChange={handleParameterChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите параметр" />
                    </SelectTrigger>
                    <SelectContent>
                      {AIR_QUALITY_PARAMETERS.map((param) => (
                        <SelectItem key={param.id} value={param.id}>
                          {param.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Временной диапазон</label>
                  <Select
                    value={dateRange}
                    onValueChange={handleDateRangeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите диапазон" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Последние 7 дней</SelectItem>
                      <SelectItem value="30days">Последние 30 дней</SelectItem>
                      <SelectItem value="90days">Последние 90 дней</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Местоположение</label>
                  <Select defaultValue="moscow">
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите местоположение" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moscow">Москва</SelectItem>
                      <SelectItem value="spb">Санкт-Петербург</SelectItem>
                      <SelectItem value="ekb">Екатеринбург</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    Применить фильтры
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {parameter && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  Отчет по параметру: {parameter.displayName}
                </h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Скачать отчет
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportCSV}>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Экспорт в CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportJSON}>
                      <FileJson className="mr-2 h-4 w-4" />
                      Экспорт в JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPDF}>
                      <FileText className="mr-2 h-4 w-4" />
                      Экспорт в PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Статистика</CardTitle>
                    <CardDescription>
                      Статистические данные за выбранный период
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Дата</TableHead>
                          <TableHead>Среднее</TableHead>
                          <TableHead>Минимум</TableHead>
                          <TableHead>Максимум</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.map((day) => (
                          <TableRow key={day.date}>
                            <TableCell>{day.date}</TableCell>
                            <TableCell>{day.avg} {parameter.unit}</TableCell>
                            <TableCell>{day.min} {parameter.unit}</TableCell>
                            <TableCell>{day.max} {parameter.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>График изменения</CardTitle>
                    <CardDescription>
                      Динамика изменения параметра за выбранный период
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ParameterChart
                      parameterId={selectedParameter}
                      data={chartData}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Выводы и рекомендации</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                      <h3 className="mb-2 text-lg font-semibold">Анализ данных</h3>
                      <p>
                        За выбранный период значения параметра {parameter.displayName} находились в пределах нормы.
                        Среднее значение составило {reportData[0]?.avg} {parameter.unit}, что соответствует хорошему качеству воздуха.
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <h3 className="mb-2 text-lg font-semibold">Рекомендации</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Продолжайте регулярный мониторинг качества воздуха</li>
                        <li>Обратите внимание на пиковые значения в определенные часы</li>
                        <li>Рассмотрите возможность установки дополнительных датчиков для более точного мониторинга</li>
                      </ul>
                    </div>
                  </div>
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

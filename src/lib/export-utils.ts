// Утилиты для экспорта данных

export interface ExportData {
  date: string;
  parameter: string;
  value: number;
  unit: string;
  location: string;
  assessment: string;
}

// Функция для экспорта данных в CSV
export function exportToCSV(data: ExportData[], filename: string = 'air-quality-report') {
  const headers = ['Дата', 'Параметр', 'Значение', 'Единица', 'Местоположение', 'Оценка'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.date,
      row.parameter,
      row.value,
      row.unit,
      row.location,
      row.assessment
    ].join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Функция для экспорта данных в JSON
export function exportToJSON(data: ExportData[], filename: string = 'air-quality-report') {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Функция для создания PDF отчета (базовая реализация)
export function exportToPDF(data: ExportData[], filename: string = 'air-quality-report') {
  // Создаем HTML контент для PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Отчет о качестве воздуха</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { margin-bottom: 20px; }
        .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Отчет о качестве воздуха</h1>
        <p><strong>Дата создания:</strong> ${new Date().toLocaleString('ru-RU')}</p>
        <p><strong>Количество записей:</strong> ${data.length}</p>
      </div>
      
      <div class="summary">
        <h2>Сводка</h2>
        <p>Данный отчет содержит информацию о качестве воздуха за выбранный период.</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Параметр</th>
            <th>Значение</th>
            <th>Единица</th>
            <th>Местоположение</th>
            <th>Оценка</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              <td>${row.date}</td>
              <td>${row.parameter}</td>
              <td>${row.value}</td>
              <td>${row.unit}</td>
              <td>${row.location}</td>
              <td>${row.assessment}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Создаем новое окно для печати
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Ждем загрузки контента и запускаем печать
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }
}

// Функция для форматирования данных для экспорта
export function formatDataForExport(
  reportData: any[],
  parameter: string,
  location: string
): ExportData[] {
  return reportData.map(day => ({
    date: day.date,
    parameter: parameter.toUpperCase(),
    value: day.avg,
    unit: getParameterUnit(parameter),
    location: location,
    assessment: getAssessmentLabel(day.avg, parameter)
  }));
}

// Вспомогательная функция для получения единицы измерения
function getParameterUnit(parameter: string): string {
  const units: Record<string, string> = {
    'co2': 'ppm',
    'pm25': 'µg/m³',
    'pm10': 'µg/m³',
    'voc': 'ppb',
    'temperature': '°C',
    'humidity': '%',
    'pressure': 'гПа',
    'o3': 'ppb',
    'no2': 'ppb',
    'so2': 'ppb'
  };
  
  return units[parameter] || 'unit';
}

// Вспомогательная функция для получения оценки качества
function getAssessmentLabel(value: number, parameter: string): string {
  // Упрощенная логика оценки
  const thresholds: Record<string, number[]> = {
    'co2': [400, 1000, 1500],
    'pm25': [12, 35, 55],
    'pm10': [54, 154, 254],
    'voc': [50, 100, 150],
    'temperature': [20, 25, 30],
    'humidity': [40, 60, 70],
    'pressure': [1013, 1020, 1030],
    'o3': [54, 70, 85],
    'no2': [53, 100, 360],
    'so2': [35, 75, 185]
  };
  
  const paramThresholds = thresholds[parameter] || [0, 50, 100];
  
  if (value <= paramThresholds[0]) return 'Хорошее';
  if (value <= paramThresholds[1]) return 'Умеренное';
  if (value <= paramThresholds[2]) return 'Вредное для чувствительных';
  return 'Вредное';
}

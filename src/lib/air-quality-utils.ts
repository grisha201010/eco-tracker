import { AIR_QUALITY_PARAMETERS, AirQualityParameter } from './api';

// Типы для категорий качества воздуха
export type AirQualityCategory = 
  | 'good' 
  | 'moderate' 
  | 'unhealthyForSensitive' 
  | 'unhealthy' 
  | 'veryUnhealthy' 
  | 'hazardous';

// Интерфейс для оценки качества воздуха
export interface AirQualityAssessment {
  category: AirQualityCategory;
  color: string;
  label: string;
  description: string;
}

// Категории качества воздуха с цветами и описаниями
export const AIR_QUALITY_CATEGORIES: Record<AirQualityCategory, AirQualityAssessment> = {
  good: {
    category: 'good',
    color: '#00E400',
    label: 'Хорошее',
    description: 'Качество воздуха считается удовлетворительным, и загрязнение воздуха представляет незначительный риск или не представляет риска.'
  },
  moderate: {
    category: 'moderate',
    color: '#FFFF00',
    label: 'Умеренное',
    description: 'Качество воздуха приемлемое; однако некоторые загрязнители могут представлять умеренную опасность для очень небольшого числа людей, которые особенно чувствительны к загрязнению воздуха.'
  },
  unhealthyForSensitive: {
    category: 'unhealthyForSensitive',
    color: '#FF7E00',
    label: 'Вредное для чувствительных групп',
    description: 'Представители чувствительных групп могут испытывать последствия для здоровья. Широкая общественность, скорее всего, не будет затронута.'
  },
  unhealthy: {
    category: 'unhealthy',
    color: '#FF0000',
    label: 'Вредное',
    description: 'Каждый может начать испытывать последствия для здоровья; представители чувствительных групп могут испытывать более серьезные последствия для здоровья.'
  },
  veryUnhealthy: {
    category: 'veryUnhealthy',
    color: '#99004C',
    label: 'Очень вредное',
    description: 'Предупреждения о риске для здоровья, означающие, что каждый может испытывать более серьезные последствия для здоровья.'
  },
  hazardous: {
    category: 'hazardous',
    color: '#7E0023',
    label: 'Опасное',
    description: 'Тревога о здоровье: каждый может испытывать более серьезные последствия для здоровья.'
  }
};

// Функция для определения категории качества воздуха на основе значения и параметра
export function getAirQualityCategory(
  value: number,
  parameterId: string
): AirQualityCategory {
  const parameter = AIR_QUALITY_PARAMETERS.find(p => p.id === parameterId);
  
  if (!parameter) {
    return 'good'; // По умолчанию, если параметр не найден
  }
  
  const { thresholds } = parameter;
  
  if (value <= thresholds.good) {
    return 'good';
  } else if (value <= thresholds.moderate) {
    return 'moderate';
  } else if (value <= thresholds.unhealthyForSensitive) {
    return 'unhealthyForSensitive';
  } else if (value <= thresholds.unhealthy) {
    return 'unhealthy';
  } else if (value <= thresholds.veryUnhealthy) {
    return 'veryUnhealthy';
  } else {
    return 'hazardous';
  }
}

// Функция для получения оценки качества воздуха
export function getAirQualityAssessment(
  value: number,
  parameterId: string
): AirQualityAssessment {
  const category = getAirQualityCategory(value, parameterId);
  return AIR_QUALITY_CATEGORIES[category];
}

// Функция для получения параметра по ID
export function getParameterById(parameterId: string): AirQualityParameter | undefined {
  return AIR_QUALITY_PARAMETERS.find(p => p.id === parameterId);
}

// Функция для форматирования значения с единицей измерения
export function formatValueWithUnit(value: number, parameterId: string): string {
  const parameter = getParameterById(parameterId);
  if (!parameter) {
    return `${value}`;
  }
  return `${value} ${parameter.unit}`;
}

// Функция для расчета индекса качества воздуха (AQI) на основе значений параметров
export function calculateAQI(measurements: Record<string, number>): number {
  // Получаем индивидуальные AQI для каждого параметра
  const individualAQIs = Object.entries(measurements).map(([parameterId, value]) => {
    const parameter = getParameterById(parameterId);
    if (!parameter) return 0;
    
    const category = getAirQualityCategory(value, parameterId);
    
    // Преобразуем категорию в числовое значение
    switch (category) {
      case 'good': return 1;
      case 'moderate': return 2;
      case 'unhealthyForSensitive': return 3;
      case 'unhealthy': return 4;
      case 'veryUnhealthy': return 5;
      case 'hazardous': return 6;
      default: return 0;
    }
  });
  
  // Если нет данных, возвращаем 0
  if (individualAQIs.length === 0) {
    return 0;
  }
  
  // Берем максимальное значение как общий AQI
  return Math.max(...individualAQIs);
}

// Функция для получения общей оценки качества воздуха на основе AQI
export function getOverallAirQualityAssessment(aqi: number): AirQualityAssessment {
  switch (aqi) {
    case 1: return AIR_QUALITY_CATEGORIES.good;
    case 2: return AIR_QUALITY_CATEGORIES.moderate;
    case 3: return AIR_QUALITY_CATEGORIES.unhealthyForSensitive;
    case 4: return AIR_QUALITY_CATEGORIES.unhealthy;
    case 5: return AIR_QUALITY_CATEGORIES.veryUnhealthy;
    case 6: return AIR_QUALITY_CATEGORIES.hazardous;
    default: return AIR_QUALITY_CATEGORIES.good;
  }
}

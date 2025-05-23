'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Search } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface LocationSelectorProps {
  onLocationChange: (location: Location) => void;
  className?: string;
}

// Демо-данные для локаций
const DEMO_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Москва, Центр',
    city: 'Москва',
    country: 'Россия',
    coordinates: {
      latitude: 55.7558,
      longitude: 37.6173
    }
  },
  {
    id: '2',
    name: 'Санкт-Петербург, Невский проспект',
    city: 'Санкт-Петербург',
    country: 'Россия',
    coordinates: {
      latitude: 59.9343,
      longitude: 30.3351
    }
  },
  {
    id: '3',
    name: 'Екатеринбург, Центр',
    city: 'Екатеринбург',
    country: 'Россия',
    coordinates: {
      latitude: 56.8389,
      longitude: 60.6057
    }
  }
];

export function LocationSelector({ onLocationChange, className }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [locations, setLocations] = useState<Location[]>(DEMO_LOCATIONS);

  // Эффект для установки первой локации по умолчанию
  useEffect(() => {
    if (locations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(locations[0].id);
      onLocationChange(locations[0]);
    }
  }, [locations, selectedLocationId]); // Убираем onLocationChange из зависимостей

  // Обработчик изменения локации
  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    const selectedLocation = locations.find(loc => loc.id === locationId);
    if (selectedLocation) {
      onLocationChange(selectedLocation);
    }
  };

  // Обработчик поиска локации
  const handleSearch = () => {
    // В реальном приложении здесь будет запрос к API
    // Для демо просто фильтруем существующие локации
    const filteredLocations = DEMO_LOCATIONS.filter(
      loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             loc.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setLocations(filteredLocations.length > 0 ? filteredLocations : DEMO_LOCATIONS);
  };

  // Обработчик определения текущего местоположения
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // В реальном приложении здесь будет запрос к API для получения ближайших станций
          // Для демо просто выбираем ближайшую из существующих локаций
          const { latitude, longitude } = position.coords;

          // Находим ближайшую локацию (простой расчет расстояния)
          const closestLocation = DEMO_LOCATIONS.reduce((closest, location) => {
            const distance = Math.sqrt(
              Math.pow(location.coordinates.latitude - latitude, 2) +
              Math.pow(location.coordinates.longitude - longitude, 2)
            );

            if (!closest || distance < closest.distance) {
              return { location, distance };
            }
            return closest;
          }, null as { location: Location; distance: number } | null);

          if (closestLocation) {
            setSelectedLocationId(closestLocation.location.id);
            onLocationChange(closestLocation.location);
          }
        },
        (error) => {
          console.error('Ошибка при получении местоположения:', error);
        }
      );
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Input
            placeholder="Поиск местоположения..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Поиск</span>
          </Button>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleGetCurrentLocation}
        >
          <MapPin className="h-4 w-4" />
          <span>Моё местоположение</span>
        </Button>
      </div>

      <Select
        value={selectedLocationId}
        onValueChange={handleLocationChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Выберите местоположение" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}, {location.city}, {location.country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

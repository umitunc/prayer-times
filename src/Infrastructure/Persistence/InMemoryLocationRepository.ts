import { ILocationRepository, LocationInfo } from '../../Core/Interfaces/ILocationRepository.js';

export class InMemoryLocationRepository implements ILocationRepository {
  private locations: LocationInfo[] = [
    {
      country: 'Turkey',
      city: 'Istanbul',
      district: 'Kadikoy',
      latitude: 41.0082,
      longitude: 28.9784,
      timezone: 'Europe/Istanbul',
    },
    {
      country: 'Turkey',
      city: 'Istanbul',
      latitude: 41.0082,
      longitude: 28.9784,
      timezone: 'Europe/Istanbul',
    },
    {
      country: 'Turkey',
      city: 'Ankara',
      latitude: 39.9334,
      longitude: 32.8597,
      timezone: 'Europe/Istanbul',
    },
    {
      country: 'Norway',
      city: 'Oslo',
      latitude: 59.9139,
      longitude: 10.7522,
      timezone: 'Europe/Oslo',
    },
    {
      country: 'Saudi Arabia',
      city: 'Mecca',
      latitude: 21.3891,
      longitude: 39.8579,
      timezone: 'Asia/Riyadh',
    },
    {
      country: 'United Kingdom',
      city: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London',
    },
    {
      country: 'United States',
      city: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
    }
  ];

  async findByName(country: string, city: string, district?: string): Promise<LocationInfo | null> {
    const normalize = (s: string) => s.toLowerCase().trim();
    
    return this.locations.find(loc => {
      const matchCountry = normalize(loc.country) === normalize(country);
      const matchCity = normalize(loc.city) === normalize(city);
      const matchDistrict = district 
        ? (loc.district && normalize(loc.district) === normalize(district))
        : true;
      return matchCountry && matchCity && matchDistrict;
    }) || null;
  }

  async search(query: string): Promise<LocationInfo[]> {
    const normalize = (s: string) => s.toLowerCase().trim();
    const q = normalize(query);
    if (!q) return [];
    
    return this.locations.filter(loc => 
      normalize(loc.country).includes(q) || 
      normalize(loc.city).includes(q) || 
      (loc.district && normalize(loc.district).includes(q))
    );
  }
}

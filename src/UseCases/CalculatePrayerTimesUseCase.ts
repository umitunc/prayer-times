import { CalculatedPrayerTimes, IPrayerCalculator } from '../Core/Interfaces/IPrayerCalculator.js';
import { ILocationRepository } from '../Core/Interfaces/ILocationRepository.js';

export interface CoordinateInput {
  latitude: number;
  longitude: number;
  date?: Date;
  method?: string;
  timezone?: string;
}

export interface SearchInput {
  country: string;
  city: string;
  district?: string;
  date?: Date;
  method?: string;
}

export class CalculatePrayerTimesUseCase {
  constructor(
    private calculator: IPrayerCalculator,
    private locationRepo?: ILocationRepository
  ) {}

  public async executeWithCoordinates(input: CoordinateInput): Promise<CalculatedPrayerTimes> {
    return this.calculator.calculate({
      latitude: input.latitude,
      longitude: input.longitude,
      date: input.date || new Date(),
      method: input.method,
      timezone: input.timezone || 'UTC'
    });
  }

  public async executeWithSearch(input: SearchInput): Promise<CalculatedPrayerTimes> {
    if (!this.locationRepo) {
      throw new Error('Location repository is not configured.');
    }

    const location = await this.locationRepo.findByName(input.country, input.city, input.district);
    if (!location) {
      throw new Error(`Location not found: ${input.country}, ${input.city}${input.district ? `, ${input.district}` : ''}`);
    }

    return this.calculator.calculate({
      latitude: location.latitude,
      longitude: location.longitude,
      date: input.date || new Date(),
      method: input.method,
      timezone: location.timezone
    });
  }
}

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AdhanPrayerCalculator } from '../src/Infrastructure/Calculators/AdhanPrayerCalculator.js';
import { CalculatePrayerTimesUseCase } from '../src/UseCases/CalculatePrayerTimesUseCase.js';
import { InMemoryLocationRepository } from '../src/Infrastructure/Persistence/InMemoryLocationRepository.js';

describe('Prayer & Sunrise Reference & Seasonal Tests', () => {
  const calculator = new AdhanPrayerCalculator();
  const locationRepo = new InMemoryLocationRepository();
  const useCase = new CalculatePrayerTimesUseCase(calculator, locationRepo);

  const testCases = [
    {
      city: 'Istanbul',
      country: 'Turkey',
      dateStr: '2026-06-21', // Summer Solstice
      expected: { fajr: '03:24', sunrise: '05:25', dhuhr: '13:11', asr: '17:11', maghrib: '20:47', isha: '22:38' }
    },
    {
      city: 'Istanbul',
      country: 'Turkey',
      dateStr: '2026-12-21', // Winter Solstice
      expected: { fajr: '06:46', sunrise: '08:18', dhuhr: '13:07', asr: '15:25', maghrib: '17:46', isha: '19:13' }
    },
    {
      city: 'Gaziantep',
      country: 'Turkey',
      dateStr: '2026-06-21', // Summer
      expected: { fajr: '03:18', sunrise: '05:04', dhuhr: '12:37', asr: '16:29', maghrib: '20:01', isha: '21:39' }
    },
    {
      city: 'Gaziantep',
      country: 'Turkey',
      dateStr: '2026-09-23', // Autumn
      expected: { fajr: '04:52', sunrise: '06:12', dhuhr: '12:28', asr: '15:53', maghrib: '18:33', isha: '19:48' }
    },
    {
      city: 'Gaziantep',
      country: 'Turkey',
      dateStr: '2026-12-21', // Winter
      expected: { fajr: '06:07', sunrise: '07:33', dhuhr: '12:33', asr: '15:03', maghrib: '17:24', isha: '18:45' }
    },
    {
      city: 'Gaziantep',
      country: 'Turkey',
      dateStr: '2026-03-21', // Spring
      expected: { fajr: '05:06', sunrise: '06:26', dhuhr: '12:43', asr: '16:09', maghrib: '18:50', isha: '20:05' }
    },
    {
      city: 'Mecca',
      country: 'Saudi Arabia',
      dateStr: '2026-03-21', // Equinox
      expected: { fajr: '05:08', sunrise: '06:24', dhuhr: '12:28', asr: '15:53', maghrib: '18:32', isha: '20:02' }
    },
    {
      city: 'Oslo',
      country: 'Norway',
      dateStr: '2026-09-23', // Equinox
      expected: { fajr: '04:38', sunrise: '07:03', dhuhr: '13:10', asr: '16:13', maghrib: '19:14', isha: '21:29' }
    }
  ];

  const parseTimeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  testCases.forEach(({ city, country, dateStr, expected }) => {
    test(`Verify ${city} (${country}) Prayer/Sunrise Times on ${dateStr}`, async () => {
      const times = await useCase.executeWithSearch({
        country,
        city,
        date: new Date(dateStr),
        method: country === 'Turkey' ? 'Turkey' : (country === 'Saudi Arabia' ? 'Mecca' : 'MWL')
      });

      Object.keys(expected).forEach((key) => {
        const calculatedTime = times[key as keyof typeof expected];
        const targetTime = expected[key as keyof typeof expected];
        
        const calculatedMin = parseTimeToMinutes(calculatedTime);
        const targetMin = parseTimeToMinutes(targetTime);
        const diff = Math.abs(calculatedMin - targetMin);

        // Within 3 minutes tolerance for astronomical model variances
        assert.ok(diff <= 3, `${key} time diff is ${diff} minutes (Calculated: ${calculatedTime}, Expected: ${targetTime})`);
      });
    });
  });
});

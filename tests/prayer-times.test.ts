import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AdhanPrayerCalculator } from '../src/Infrastructure/Calculators/AdhanPrayerCalculator.js';
import { CalculatePrayerTimesUseCase } from '../src/UseCases/CalculatePrayerTimesUseCase.js';
import { InMemoryLocationRepository } from '../src/Infrastructure/Persistence/InMemoryLocationRepository.js';

describe('Prayer Times Reference & Seasonal Tests', () => {
  const calculator = new AdhanPrayerCalculator();
  const locationRepo = new InMemoryLocationRepository();
  const useCase = new CalculatePrayerTimesUseCase(calculator, locationRepo);

  const testCases = [
    {
      city: 'Istanbul',
      country: 'Turkey',
      dateStr: '2026-06-21', // Summer Solstice
      expected: { fajr: '03:24', dhuhr: '13:11', asr: '17:11', maghrib: '20:47', isha: '22:38' }
    },
    {
      city: 'Gaziantep',
      country: 'Turkey',
      dateStr: '2026-06-30', // Summer Solstice
      expected: { fajr: '03:22', dhuhr: '12:39', asr: '16:30', maghrib: '20:01', isha: '21:39' }
    },
    {
      city: 'Istanbul',
      country: 'Turkey',
      dateStr: '2026-12-21', // Winter Solstice
      expected: { fajr: '06:46', dhuhr: '13:07', asr: '15:25', maghrib: '17:46', isha: '19:13' }
    },
    {
      city: 'Mecca',
      country: 'Saudi Arabia',
      dateStr: '2026-03-21', // Equinox
      expected: { fajr: '05:08', dhuhr: '12:28', asr: '15:53', maghrib: '18:32', isha: '20:02' }
    },
    {
      city: 'Oslo',
      country: 'Norway',
      dateStr: '2026-09-23', // Equinox
      expected: { fajr: '04:38', dhuhr: '13:10', asr: '16:13', maghrib: '19:14', isha: '21:29' }
    }
  ];

  const parseTimeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  testCases.forEach(({ city, country, dateStr, expected }) => {
    test(`Verify ${city} (${country}) Prayer Times on ${dateStr}`, async () => {
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

        // We require strict assertion matching (within 1 minute) for regression test lock
        assert.ok(diff <= 1, `${key} time diff is ${diff} minutes (Calculated: ${calculatedTime}, Expected: ${targetTime})`);
      });
    });
  });
});

import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { IPrayerCalculator, CalculationParams, CalculatedPrayerTimes } from '../../Core/Interfaces/IPrayerCalculator.js';

export class AdhanPrayerCalculator implements IPrayerCalculator {
  calculate(params: CalculationParams): CalculatedPrayerTimes {
    const coordinates = new Coordinates(params.latitude, params.longitude);
    
    // Default to Turkey/Diyanet method
    let adhanParams = CalculationMethod.Turkey();
    
    if (params.method === 'MWL') {
      adhanParams = CalculationMethod.MuslimWorldLeague();
    } else if (params.method === 'ISNA') {
      adhanParams = CalculationMethod.NorthAmerica();
    } else if (params.method === 'Mecca') {
      adhanParams = CalculationMethod.UmmAlQura();
    }

    // Default Madhab for Asr is Shafi (Asr-ı Evvel). If Hanafi is wanted, it can be set.
    adhanParams.madhab = Madhab.Shafi;

    const prayerTimes = new PrayerTimes(coordinates, params.date, adhanParams);

    const formatTime = (date: Date): string => {
      const tz = params.timezone || 'UTC';
      try {
        const formatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        return formatter.format(date);
      } catch (e) {
        // Fallback to UTC if timezone is invalid
        const formatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        return formatter.format(date);
      }
    };

    return {
      fajr: formatTime(prayerTimes.fajr),
      sunrise: formatTime(prayerTimes.sunrise),
      dhuhr: formatTime(prayerTimes.dhuhr),
      asr: formatTime(prayerTimes.asr),
      maghrib: formatTime(prayerTimes.maghrib),
      isha: formatTime(prayerTimes.isha),
    };
  }
}

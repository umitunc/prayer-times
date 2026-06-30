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
      // Return HH:MM in timezone-local or simple format
      // Note: Adhan dates are UTC. We should format them in local time or simple HH:MM using standard options
      const pad = (n: number) => n.toString().padStart(2, '0');
      
      // Since this is a microservice, we will return the times in the location's local time or standard format.
      // Typically we'd use timezone offsets, but here we can format them using UTC or local depending on requirement.
      // Let's format to simple HH:MM in local timezone of the server, or we can format according to timezone offset if provided.
      // For now, let's return HH:MM based on standard date hours/minutes.
      return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

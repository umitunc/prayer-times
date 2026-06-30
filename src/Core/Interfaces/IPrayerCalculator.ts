export interface CalculationParams {
  latitude: number;
  longitude: number;
  date: Date;
  method?: string; // e.g. "Diyanet", "MWL", "ISNA"
}

export interface CalculatedPrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface IPrayerCalculator {
  calculate(params: CalculationParams): CalculatedPrayerTimes;
}

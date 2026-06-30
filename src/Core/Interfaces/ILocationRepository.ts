export interface LocationInfo {
  country: string;
  city: string;
  district?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface ILocationRepository {
  findByName(country: string, city: string, district?: string): Promise<LocationInfo | null>;
  search(query: string): Promise<LocationInfo[]>;
}

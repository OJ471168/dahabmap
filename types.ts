export interface Store {
  title: string;
  city: string;
  lat: number;
  lng: number;
  link: string;
  dist?: number;
  originalIndex?: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}
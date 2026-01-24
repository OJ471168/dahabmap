export interface StoreRawData {
    id: number;
    created_at: string;
    "store name"?: string;
    store_name?: string;
    title?: string;
    city?: string;
    latitude?: number;
    lat?: number;
    langitude?: number;
    longitude?: number;
    lng?: number;
}

export interface Store {
    id: number; // using original ID or generated index
    title: string;
    city: string;
    lat: number;
    lng: number;
    distance?: number; // Distance from user in meters
}

export interface Coordinates {
    lat: number;
    lng: number;
}

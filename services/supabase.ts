import { createClient } from '@supabase/supabase-js';
import { StoreRawData, Store } from '../types';

const SUPABASE_URL = 'https://vlrbeemaxxdqiczdxomd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZscmJlZW1heHhkcWljemR4b21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzkxNDYsImV4cCI6MjA4NDE1NTE0Nn0.TVPeCb9pudVV2_OsjSeNU6fGCVOVxSx6mYUfZPg0QB0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const safeParseFloat = (val: string | number | undefined | null): number => {
    if (val === null || val === undefined) return NaN;
    if (typeof val === 'number') return val;
    return parseFloat(String(val).replace(',', '.'));
};

export const fetchStores = async (): Promise<Store[]> => {
    const { data, error } = await supabase.from('dahab').select('*');
    
    if (error) {
        console.error('Error fetching stores:', error);
        throw error;
    }

    if (!data) return [];

    return data
        .map((item: StoreRawData, index: number) => {
            const lat = safeParseFloat(item.latitude || item.lat);
            const lng = safeParseFloat(item.langitude || item.longitude || item.lng);
            
            // Heuristic to find the best title field
            const title = item['store name'] || item.store_name || item.title || "Unknown Store";

            return {
                id: item.id || index,
                title: title,
                city: item.city || "Morocco",
                lat,
                lng
            };
        })
        .filter(store => !isNaN(store.lat) && !isNaN(store.lng));
};

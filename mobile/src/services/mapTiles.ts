// mobile/src/services/mapTiles.ts
// Configuração dos tiles do mapa (CARTO Basemaps), usada pelo LeafletMap.tsx e LeafletMap.web.tsx.
// Desde 2026 o CARTO exige uma chave gratuita: sem ela os tiles mostram "API KEY REQUIRED".
// Obtenha a chave em https://carto.com/basemaps/apikey e defina EXPO_PUBLIC_CARTO_API_KEY no .env.

const CARTO_API_KEY = process.env.EXPO_PUBLIC_CARTO_API_KEY ?? '';

const TILE_STYLES = {
  dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
} as const;

export const hasMapApiKey = CARTO_API_KEY.length > 0;

export function getTileUrl(isDark: boolean): string {
  const base = isDark ? TILE_STYLES.dark : TILE_STYLES.light;
  return hasMapApiKey ? `${base}?key=${encodeURIComponent(CARTO_API_KEY)}` : base;
}

// Atribuição obrigatória pelos termos do CARTO e do OpenStreetMap
export const MAP_ATTRIBUTION = '&copy; OpenStreetMap contributors, &copy; CARTO';

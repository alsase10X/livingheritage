/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param lat1 Latitud del primer punto en grados
 * @param lng1 Longitud del primer punto en grados
 * @param lat2 Latitud del segundo punto en grados
 * @param lng2 Longitud del segundo punto en grados
 * @returns Distancia en metros (redondeada)
 */
export function calcularDistancia(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distancia en metros
}

/**
 * Formatea una distancia en metros a un string legible
 * @param metros Distancia en metros
 * @returns String formateado (ej: "180 m" o "2.4 km")
 */
export function formatearDistancia(metros: number): string {
  if (metros < 1000) {
    return `${metros} m`;
  }
  return `${(metros / 1000).toFixed(1)} km`;
}

/**
 * Calcula el tiempo aproximado caminando desde una distancia
 * Aproximadamente 5 km/h = 83 metros por minuto
 * @param metros Distancia en metros
 * @returns String formateado (ej: "<1min" o "5min")
 */
export function calcularTiempo(metros: number): string {
  const minutos = Math.round(metros / 83);
  if (minutos < 1) {
    return "<1min";
  }
  return `${minutos}min`;
}

/**
 * Calcula el tiempo aproximado caminando desde una distancia
 * Aproximadamente 5 km/h = 83 metros por minuto
 * @param metros Distancia en metros
 * @returns String formateado (ej: "<1 min" o "5 min")
 */
export function calcularTiempoCaminando(metros: number): string {
  const minutos = Math.round(metros / 83);
  if (minutos < 1) {
    return "<1 min";
  }
  return `${minutos} min`;
}
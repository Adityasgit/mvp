import type { CampusFeature } from "./types";

const DEG = Math.PI / 180;

export function haversineDistance(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const dLat = (b[1] - a[1]) * DEG;
  const dLng = (b[0] - a[0]) * DEG;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(a[1] * DEG) * Math.cos(b[1] * DEG) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function bearing(from: [number, number], to: [number, number]): number {
  const fromLat = from[1] * DEG;
  const toLat = to[1] * DEG;
  const dLng = (to[0] - from[0]) * DEG;
  const y = Math.sin(dLng) * Math.cos(toLat);
  const x =
    Math.cos(fromLat) * Math.sin(toLat) -
    Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLng);
  return ((Math.atan2(y, x) / DEG) + 360) % 360;
}

export function polygonCentroid(coords: [number, number][]): [number, number] {
  let lngSum = 0;
  let latSum = 0;
  const n = coords.length;
  for (const [lng, lat] of coords) {
    lngSum += lng;
    latSum += lat;
  }
  return [lngSum / n, latSum / n];
}

export function featurePoint(feature: CampusFeature): [number, number] {
  const c = feature.coordinates;
  if (feature.geometryType === "point") return c as [number, number];
  if (feature.geometryType === "line") return (c as [number, number][])[0];
  // polygon — centroid of outer ring
  const outer = (c as [number, number][][])[0];
  return polygonCentroid(outer);
}

export function nearestFeatures(
  userPos: [number, number],
  features: CampusFeature[],
  maxMeters: number
): CampusFeature[] {
  return features
    .filter((f) => {
      const pt = featurePoint(f);
      return haversineDistance(userPos, pt) <= maxMeters;
    })
    .sort((a, b) => {
      const da = haversineDistance(userPos, featurePoint(a));
      const db = haversineDistance(userPos, featurePoint(b));
      return da - db;
    });
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
